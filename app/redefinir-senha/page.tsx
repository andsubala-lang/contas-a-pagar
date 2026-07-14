"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setValid(!!data.session);
      setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("Não consegui atualizar a senha. Tente novamente.");
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-sm fade-in">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--ink-soft)] mb-2">
            Nexus
          </p>
          <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
            Nova senha
          </h1>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--line)] p-6 shadow-sm">
          {!ready ? (
            <p className="text-sm text-[var(--ink-soft)] text-center">Verificando link...</p>
          ) : !valid ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-[var(--ink-soft)]">
                Esse link expirou ou já foi usado. Solicite um novo na tela de login.
              </p>
              <a href="/login" className="tap inline-block text-sm text-[var(--primary)]">
                Voltar para o login
              </a>
            </div>
          ) : done ? (
            <p className="text-sm text-[var(--success)] bg-[var(--success-soft)] rounded-lg px-3 py-2 text-center">
              Senha atualizada. Entrando...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--ink-soft)] mb-1">
                  Nova senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--surface-input)]"
                  placeholder="mínimo 6 caracteres"
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="tap w-full bg-[var(--primary)] text-[var(--primary-ink)] rounded-lg py-2.5 font-medium disabled:opacity-60"
              >
                {loading ? "Aguarde..." : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
