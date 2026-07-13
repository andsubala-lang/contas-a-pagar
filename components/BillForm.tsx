"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/dates";

type Bill = {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_date: string;
  recurring: string;
};

export default function BillForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initial?: Partial<Bill>;
  submitLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        try {
          await action(formData);
        } catch (e: any) {
          setError(e?.message || "Não foi possível salvar. Tente novamente.");
        }
      }}
      className="bg-[var(--surface)] rounded-2xl border border-[var(--line)] p-6 space-y-4"
    >
      <div>
        <label className="block text-sm text-[var(--ink-soft)] mb-1">
          Nome da conta
        </label>
        <input
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="Ex: Aluguel, Internet, Netflix"
          className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">
            Valor (R$)
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={initial?.amount}
            placeholder="0,00"
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">
            Vencimento
          </label>
          <input
            name="due_date"
            type="date"
            required
            defaultValue={initial?.due_date}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-soft)] mb-1">
          Categoria
        </label>
        <select
          name="category"
          defaultValue={initial?.category || "outros"}
          className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--surface-input)]"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-soft)] mb-1">
          Repetição
        </label>
        <select
          name="recurring"
          defaultValue={initial?.recurring || "none"}
          className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--surface-input)]"
        >
          <option value="none">Não se repete</option>
          <option value="monthly">Todo mês</option>
          <option value="yearly">Todo ano</option>
        </select>
        <p className="text-xs text-[var(--ink-soft)] mt-1">
          Ao marcar como paga, uma conta recorrente já agenda o próximo vencimento automaticamente.
        </p>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href="/"
          className="flex-1 text-center rounded-lg border border-[var(--line)] py-2.5 text-[var(--ink-soft)]"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-[var(--primary)] text-[var(--primary-ink)] py-2.5 font-medium"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
