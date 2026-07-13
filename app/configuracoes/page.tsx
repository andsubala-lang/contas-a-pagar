import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateLeadDays, signOut } from "@/lib/actions";
import PushSubscribeButton from "@/components/PushSubscribeButton";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("lead_days")
    .eq("user_id", user!.id)
    .maybeSingle();

  const leadDays = settings?.lead_days ?? 3;

  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-8">
      <div className="max-w-md mx-auto space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-[var(--primary)]">
            Ajustes
          </h1>
          <Link href="/" className="text-sm text-[var(--ink-soft)]">
            Voltar
          </Link>
        </div>

        <section className="bg-[var(--surface)] rounded-2xl border border-[var(--line)] p-6">
          <h2 className="font-medium text-[var(--ink)] mb-1">Notificações</h2>
          <p className="text-sm text-[var(--ink-soft)] mb-4">
            Ative para receber um aviso no celular quando uma conta estiver perto
            de vencer. Sem custo — funciona melhor se você adicionar este app à
            tela inicial do celular.
          </p>
          <PushSubscribeButton />
        </section>

        <section className="bg-[var(--surface)] rounded-2xl border border-[var(--line)] p-6">
          <h2 className="font-medium text-[var(--ink)] mb-1">
            Antecedência do lembrete
          </h2>
          <p className="text-sm text-[var(--ink-soft)] mb-4">
            Com quantos dias de antecedência você quer ser avisado?
          </p>
          <form action={updateLeadDays} className="flex items-center gap-3">
            <select
              name="lead_days"
              defaultValue={leadDays}
              className="rounded-lg border border-[var(--line)] px-3 py-2 bg-white"
            >
              {[1, 2, 3, 5, 7, 10].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? "dia" : "dias"} antes
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-[var(--primary)] text-[var(--primary-ink)] px-4 py-2 text-sm font-medium"
            >
              Salvar
            </button>
          </form>
        </section>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full text-center text-sm text-[var(--ink-soft)] py-2.5"
          >
            Sair da conta
          </button>
        </form>
      </div>
    </main>
  );
}
