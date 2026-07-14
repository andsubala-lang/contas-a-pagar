"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"entrar" | "criar" | "recuperar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError("E-mail ou senha incorretos.");
        return;
      }
      router.push("/");
      router.refresh();
    } else if (mode === "criar") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo("Conta criada. Verifique seu e-mail para confirmar o acesso.");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      setLoading(false);
      if (error) {
        setError("Não consegui enviar o link. Tente novamente.");
        return;
      }
      setInfo("Enviamos um link para o seu e-mail com o próximo passo.");
    }
  }

  const titles = {
    entrar: "Acessar sua conta",
    criar: "Criar sua conta",
    recuperar: "Recuperar acesso",
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-sm fade-in">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--ink-soft)] mb-2">
            Nexus
          </p>
          <h1 className="font-display text-3xl font-semibold text-[var(--ink)]">
            {titles[mode]}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--surface)] rounded-2xl border border-[var(--line)] p-6 space-y-4 shadow-sm"
        >
          <div>
            <label className="block text-sm text-[var(--ink-soft)] mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--surface-input)]"
              placeholder="voce@email.com"
            />
          </div>

          {mode !== "recuperar" && (
            <div>
              <label className="block text-sm text-[var(--ink-soft)] mb-1">
                Senha
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
          )}

          {mode === "entrar" && (
            <button
              type="button"
              onClick={() => {
                setMode("recuperar");
                setError(null);
                setInfo(null);
              }}
              className="text-xs text-[var(--ink-soft)]"
            >
              Esqueceu a senha?
            </button>
          )}

          {error && (
            <p className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-[var(--success)] bg-[var(--success-soft)] rounded-lg px-3 py-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="tap w-full bg-[var(--primary)] text-[var(--primary-ink)] rounded-lg py-2.5 font-medium disabled:opacity-60"
          >
            {loading
              ? "Aguarde..."
              : mode === "entrar"
              ? "Entrar"
              : mode === "criar"
              ? "Criar conta"
              : "Enviar link"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "entrar" ? "criar" : "entrar");
            setError(null);
            setInfo(null);
          }}
          className="w-full text-center text-sm text-[var(--ink-soft)] mt-4"
        >
          {mode === "criar"
            ? "Já tem conta? Entrar"
            : mode === "recuperar"
            ? "Voltar para entrar"
            : "Ainda não tem conta? Criar uma"}
        </button>
      </div>
    </main>
  );
}
