import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BillCard from "@/components/BillCard";
import { daysUntil } from "@/lib/dates";

export default async function DashboardPage() {
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

  return (
    <main className="min-h-screen bg-[var(--bg)] pb-24">
      <header className="px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] sm:text-xs tracking-widest uppercase text-[var(--ink-soft)] mb-1">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--primary)]">
            Contas a pagar
          </h1>
        </div>
        <Link
          href="/configuracoes"
          className="text-sm text-[var(--ink-soft)] px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)]"
        >
          Ajustes
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

        {overdue.length > 0 && (
          <Section title="Atrasadas" bills={overdue} leadDays={leadDays} />
        )}
        {dueSoon.length > 0 && (
          <Section title="Vencendo em breve" bills={dueSoon} leadDays={leadDays} />
        )}
        {upcoming.length > 0 && (
          <Section title="Em dia" bills={upcoming} leadDays={leadDays} />
        )}
        {paid.length > 0 && (
          <Section title="Pagas recentemente" bills={paid} leadDays={leadDays} />
        )}
      </div>

      <Link
        href="/contas/nova"
        className="fixed bottom-6 right-6 bg-[var(--primary)] text-[var(--primary-ink)] rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
        aria-label="Nova conta"
      >
        +
      </Link>
    </main>
  );
}

function Section({
  title,
  bills,
  leadDays,
}: {
  title: string;
  bills: any[];
  leadDays: number;
}) {
  return (
    <section>
      <h2 className="font-mono text-[10px] sm:text-xs tracking-widest uppercase text-[var(--ink-soft)] mb-2 sm:mb-3">
        {title} · {bills.length}
      </h2>
      <div className="space-y-2.5 sm:space-y-3">
        {bills.map((b) => (
          <BillCard key={b.id} bill={b} leadDays={leadDays} />
        ))}
      </div>
    </section>
  );
}
