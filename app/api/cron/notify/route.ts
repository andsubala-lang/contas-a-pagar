import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createServiceRoleClient } from "@/lib/supabase/server";

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;
  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  webpush.setVapidDetails(
    "mailto:contas@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createServiceRoleClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: bills, error: billsError } = await supabase
    .from("bills")
    .select("id, user_id, name, amount, due_date, last_notified_date")
    .eq("is_paid", false)
    .or(`last_notified_date.is.null,last_notified_date.lt.${today}`);

  if (billsError) {
    return NextResponse.json({ error: billsError.message }, { status: 500 });
  }
  if (!bills || bills.length === 0) {
    return NextResponse.json({ sent: 0, checked: 0 });
  }

  const { data: allSettings } = await supabase
    .from("user_settings")
    .select("user_id, lead_days");

  const leadDaysByUser = new Map<string, number>();
  (allSettings || []).forEach((s: any) =>
    leadDaysByUser.set(s.user_id, s.lead_days)
  );

  const todayDate = new Date(today + "T00:00:00");
  const dueBills = bills.filter((b: any) => {
    const leadDays = leadDaysByUser.get(b.user_id) ?? 3;
    const due = new Date(b.due_date + "T00:00:00");
    const daysLeft = Math.round(
      (due.getTime() - todayDate.getTime()) / 86400000
    );
    return daysLeft <= leadDays;
  });

  if (dueBills.length === 0) {
    return NextResponse.json({ sent: 0, checked: bills.length });
  }

  const userIds = Array.from(new Set(dueBills.map((b: any) => b.user_id)));
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);

  const subsByUser = new Map<string, any[]>();
  (subs || []).forEach((s: any) => {
    const list = subsByUser.get(s.user_id) || [];
    list.push(s);
    subsByUser.set(s.user_id, list);
  });

  let sent = 0;
  const notifiedBillIds: string[] = [];
  const deadEndpoints: string[] = [];

  for (const bill of dueBills as any[]) {
    const userSubs = subsByUser.get(bill.user_id) || [];
    if (userSubs.length === 0) continue;

    const due = new Date(bill.due_date + "T00:00:00");
    const daysLeft = Math.round(
      (due.getTime() - todayDate.getTime()) / 86400000
    );
    const body =
      daysLeft < 0
        ? `Venceu há ${Math.abs(daysLeft)} dia(s). Valor: R$ ${Number(
            bill.amount
          ).toFixed(2)}`
        : daysLeft === 0
        ? `Vence hoje. Valor: R$ ${Number(bill.amount).toFixed(2)}`
        : `Vence em ${daysLeft} dia(s). Valor: R$ ${Number(bill.amount).toFixed(
            2
          )}`;

    const payload = JSON.stringify({
      title: bill.name,
      body,
      url: "/",
      tag: `bill-${bill.id}`,
    });

    let anySuccess = false;
    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
        anySuccess = true;
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    }

    if (anySuccess) notifiedBillIds.push(bill.id);
  }

  if (notifiedBillIds.length > 0) {
    await supabase
      .from("bills")
      .update({ last_notified_date: today })
      .in("id", notifiedBillIds);
  }

  if (deadEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", deadEndpoints);
  }

  return NextResponse.json({
    sent,
    checked: bills.length,
    dueBills: dueBills.length,
  });
}
