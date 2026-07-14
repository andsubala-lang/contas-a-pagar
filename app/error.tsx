"use client";

import { RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-sm text-center fade-in">
        <p className="font-mono text-xs tracking-widest uppercase text-[var(--ink-soft)] mb-3">
          Nexus
        </p>
        <h1 className="font-display text-xl font-semibold text-[var(--ink)] mb-2">
          Não consegui confirmar suas contas agora
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mb-6">
          Pode ser só uma instabilidade de conexão. Tente de novo.
        </p>
        <button
          onClick={() => reset()}
          className="tap inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-ink)] rounded-lg px-4 py-2.5 text-sm font-medium"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
