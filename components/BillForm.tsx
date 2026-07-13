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
      className="space-y-5"
    >
      <div>
        <label className="block text-sm text-[var(--ink-soft)] mb-1">
          Nome da conta
        </label>
        <input
          name="name"
          required
          autoFocus
          defaultValue={initial?.name}
          placeholder="Ex: Aluguel, Internet, Netflix"
          className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">
            Valor
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] font-mono text-sm pointer-events-none">
              R$
            </span>
            <input
              name="amount"
              type="text"
              inputMode="decimal"
              required
              defaultValue={
                initial?.amount != null
                  ? String(initial.amount).replace(".", ",")
                  : undefined
              }
              placeholder="0,00"
              className="w-full rounded-lg border border-[var(--line)] pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
            />
          </div>
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
          Ao pagar, renova sozinha para o próximo ciclo.
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
          className="tap flex-1 text-center rounded-lg py-2.5 text-sm text-[var(--ink-soft)]"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="tap flex-1 rounded-lg bg-[var(--primary)] text-[var(--primary-ink)] py-2.5 font-medium"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
