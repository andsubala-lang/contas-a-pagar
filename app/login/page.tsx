"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
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
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo("Conta criada. Verifique seu e-mail para confirmar o acesso.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-sm fade-in">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs tracking-widest uppercase text-[var(--ink-soft)] mb-2">
            Contas a Pagar
          </p>
          <h1 className="font-display text-3xl font-semibold text-[var(--primary)]">
            {mode === "entrar" ? "Acessar sua conta" : "Criar sua conta"}
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
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              placeholder="voce@email.com"
            />
          </div>
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
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              placeholder="mínimo 6 caracteres"
            />
          </div>

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
            className="w-full bg-[var(--primary)] text-[var(--primary-ink)] rounded-lg py-2.5 font-medium disabled:opacity-60"
          >
            {loading
              ? "Aguarde..."
              : mode === "entrar"
              ? "Entrar"
              : "Criar conta"}
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
          {mode === "entrar"
            ? "Ainda não tem conta? Criar uma"
            : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
