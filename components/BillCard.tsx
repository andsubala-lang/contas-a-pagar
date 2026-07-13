"use client";

import Link from "next/link";
import { useTransition } from "react";
import { daysUntil, formatDateBR, formatMoneyBRL } from "@/lib/dates";
import { markBillPaid, reopenBill } from "@/lib/actions";

type Bill = {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_date: string;
  recurring: string;
  is_paid: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  moradia: "Moradia",
  utilidades: "Água/luz/internet",
  assinaturas: "Assinatura",
  cartao: "Cartão",
  saude: "Saúde",
  outros: "Outros",
};

export default function BillCard({
  bill,
  leadDays,
}: {
  bill: Bill;
  leadDays: number;
}) {
  const [isPending, startTransition] = useTransition();
  const days = daysUntil(bill.due_date);

  let stubBg = "bg-[var(--success-soft)]";
  let stubText = "text-[var(--success)]";
  let label = "em dia";

  if (bill.is_paid) {
    stubBg = "bg-[var(--surface)]";
    stubText = "text-[var(--ink-soft)]";
    label = "paga";
  } else if (days < 0) {
    stubBg = "bg-[var(--danger-soft)]";
    stubText = "text-[var(--danger)]";
    label = days === -1 ? "1 dia atrasada" : `${Math.abs(days)} dias atrasada`;
  } else if (days <= leadDays) {
    stubBg = "bg-[var(--amber-soft)]";
    stubText = "text-[#a8641c]";
    label = days === 0 ? "vence hoje" : days === 1 ? "vence amanhã" : `faltam ${days} dias`;
  } else {
    label = `faltam ${days} dias`;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden fade-in ${
        bill.is_paid ? "opacity-60" : ""
      }`}
    >
      <div
        className={`stub sm:w-20 w-full shrink-0 flex flex-row sm:flex-col items-center justify-center gap-1.5 sm:gap-0 ${stubBg} py-1.5 sm:py-3`}
      >
        <span className={`font-display text-lg sm:text-2xl font-semibold ${stubText}`}>
          {bill.is_paid ? "✓" : days < 0 ? Math.abs(days) : days}
        </span>
        <span className={`font-mono text-[9px] sm:text-[10px] text-center px-1 leading-tight ${stubText}`}>
          {label}
        </span>
      </div>

      <div className="flex-1 p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 min-w-0">
        <div className="min-w-0">
          <p className="font-medium text-[var(--ink)] text-sm sm:text-base truncate">{bill.name}</p>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] font-mono">
            {formatMoneyBRL(bill.amount)} · vence {formatDateBR(bill.due_date)}
          </p>
          <p className="text-[11px] sm:text-xs text-[var(--ink-soft)] mt-0.5">
            {CATEGORY_LABEL[bill.category] || "Outros"}
            {bill.recurring !== "none" && (
              <span> · {bill.recurring === "monthly" ? "mensal" : "anual"}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/contas/${bill.id}/editar`}
            className="flex-1 sm:flex-initial text-center text-xs sm:text-sm text-[var(--ink-soft)] px-3 py-1.5 rounded-lg border border-[var(--line)]"
          >
            Editar
          </Link>
          {bill.is_paid ? (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => reopenBill(bill.id))}
              className="flex-1 sm:flex-initial text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink-soft)]"
            >
              Reabrir
            </button>
          ) : (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => markBillPaid(bill.id))}
              className="flex-1 sm:flex-initial text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-ink)] disabled:opacity-60"
            >
              Marcar paga
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
