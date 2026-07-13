"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function addInterval(dateStr: string, recurring: string) {
  const d = new Date(dateStr + "T00:00:00");
  if (recurring === "monthly") d.setMonth(d.getMonth() + 1);
  if (recurring === "yearly") d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export async function createBill(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") || "outros");
  const due_date = String(formData.get("due_date"));
  const recurring = String(formData.get("recurring") || "none");

  if (!name || !due_date || Number.isNaN(amount)) {
    throw new Error("Preencha nome, valor e data de vencimento.");
  }

  const { error } = await supabase.from("bills").insert({
    user_id: user.id,
    name,
    amount,
    category,
    due_date,
    recurring,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}

export async function updateBill(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") || "outros");
  const due_date = String(formData.get("due_date"));
  const recurring = String(formData.get("recurring") || "none");

  const { error } = await supabase
    .from("bills")
    .update({ name, amount, category, due_date, recurring })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  redirect("/");
}

export async function deleteBill(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("bills").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/");
  redirect("/");
}

export async function markBillPaid(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bill } = await supabase
    .from("bills")
    .select("due_date, recurring")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!bill) return;

  if (bill.recurring === "monthly" || bill.recurring === "yearly") {
    const nextDate = addInterval(bill.due_date, bill.recurring);
    await supabase
      .from("bills")
      .update({ due_date: nextDate, is_paid: false, last_notified_date: null })
      .eq("id", id)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("bills")
      .update({ is_paid: true })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  revalidatePath("/");
}

export async function reopenBill(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("bills")
    .update({ is_paid: false })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/");
}

export async function updateLeadDays(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lead_days = Number(formData.get("lead_days"));

  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, lead_days }, { onConflict: "user_id" });

  if (error) throw new Error(error.message);

  revalidatePath("/configuracoes");
}

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) throw new Error(error.message);
}

export async function removePushSubscription(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", user.id);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
