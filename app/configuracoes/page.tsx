import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions";
import PushSubscribeButton from "@/components/PushSubscribeButton";
import LeadDaysControl from "@/components/LeadDaysControl";

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
    <main className="min-h-screen bg-[var(--bg)] px-4 sm:px-6 py-8">
      <div className="max-w-md mx-auto space-y-8 fade-in">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Voltar"
            className="tap text-[var(--ink-soft)] p-2 -ml-2 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">
            Ajustes
          </h1>
        </div>

        <section>
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[var(--ink-soft)] mb-3">
            Notificações
          </h2>
          <p className="text-sm text-[var(--ink-soft)] mb-4">
            Um aviso no celular quando algo estiver perto de vencer.
          </p>
          <PushSubscribeButton />
        </section>

        <section className="pt-2 border-t border-[var(--line)]">
          <h2 className="font-mono text-[10px] tracking-widest uppercase text-[var(--ink-soft)] mb-3 mt-6">
            Antecedência do lembrete
          </h2>
          <LeadDaysControl initialValue={leadDays} />
        </section>

        <form action={signOut} className="pt-2">
          <button
            type="submit"
            className="tap w-full text-center text-sm text-[var(--ink-soft)] py-2.5"
          >
            Sair da conta
          </button>
        </form>
      </div>
    </main>
  );
}
