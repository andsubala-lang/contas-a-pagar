import Link from "next/link";
import { Settings, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BillCard from "@/components/BillCard";
import ToastFlash from "@/components/ToastFlash";
import MoreBillsDisclosure from "@/components/MoreBillsDisclosure";
import { daysUntil } from "@/lib/dates";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ toast?: string }>;
}) {
  const { toast } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: bills }, { data: settings }] = await Promise.all([
    supabase
      .from("bills")
      .select("*")
      .order("due_date", { ascending: true }),
    supabase
      .from("user_settings")
      .select("lead_days")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  const leadDays = settings?.lead_days ?? 3;
  const all = bills || [];

  const unpaid = all.filter((b) => !b.is_paid);
  const paid = all.filter((b) => b.is_paid);

  const overdue = unpaid.filter((b) => daysUntil(b.due_date) < 0);
  const dueSoon = unpaid.filter((b) => {
    const d = daysUntil(b.due_date);
    return d >= 0 && d <= leadDays;
  });
  const upcoming = unpaid.filter((b) => daysUntil(b.due_date) > leadDays);

  const needsAttention = [...overdue, ...dueSoon];
  const quiet = [...upcoming, ...paid];

  // Status headline — this single line is what the whole ritual depends on:
  // it must answer "estou seguro, ou preciso agir?" before any list loads.
  let headline = "Tudo tranquilo";
  if (overdue.length > 0) {
    headline =
      overdue.length === 1
        ? "1 conta atrasada — resolve quando puder"
        : `${overdue.length} contas atrasadas — resolve quando puder`;
  } else if (dueSoon.length > 0) {
    headline =
      dueSoon.length === 1 ? "1 conta vencendo em breve" : `${dueSoon.length} contas vencendo em breve`;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] pb-32">
      <ToastFlash message={toast} />
      <header className="px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--ink)] leading-snug">
          {headline}
        </h1>
        <Link
          href="/configuracoes"
          aria-label="Ajustes"
          className="tap text-[var(--ink-soft)] p-2.5 rounded-lg shrink-0"
        >
          <Settings size={20} />
        </Link>
      </header>

      <div className="px-4 sm:px-6 space-y-6 sm:space-y-8 max-w-2xl">
        {all.length === 0 && (
          <div className="bg-[var(--surface)] border border-dashed border-[var(--line)] rounded-2xl p-8 text-center">
            <p className="font-display text-lg text-[var(--primary)] mb-1">
              Nenhuma conta cadastrada
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              Cadastre sua primeira conta para começar a receber lembretes.
            </p>
          </div>
        )}

        {needsAttention.length > 0 && (
          <div className="space-y-2.5 sm:space-y-3">
            {needsAttention.map((b) => (
              <BillCard key={b.id} bill={b} leadDays={leadDays} />
            ))}
          </div>
        )}

        {quiet.length > 0 && <MoreBillsDisclosure bills={quiet} />}
      </div>

      <Link
        href="/contas/nova"
        className="tap fixed bottom-6 right-6 bg-[var(--primary)] text-[var(--primary-ink)] rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-20"
        aria-label="Nova conta"
      >
        <Plus size={24} />
      </Link>
    </main>
  );
}
