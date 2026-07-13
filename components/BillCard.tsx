"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { daysUntil, formatDateBR, formatMoneyBRL, computeNextDueDate } from "@/lib/dates";
import { markBillPaid, reopenBill } from "@/lib/actions";
import { showToast } from "@/lib/toast";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const days = daysUntil(bill.due_date);
  const isRecurring = bill.recurring === "monthly" || bill.recurring === "yearly";

  let stubBg = "bg-[var(--ok-soft)]";
  let stubText = "text-[var(--ok)]";
  let label = "em dia";

  if (bill.is_paid) {
    stubBg = "bg-[var(--surface)]";
    stubText = "text-[var(--ink-soft)]";
    label = "paga";
  } else if (days < 0) {
    stubBg = "bg-[var(--danger-soft)]";
    stubText = "text-[var(--danger)]";
    label = "atrasada";
  } else if (days <= leadDays) {
    stubBg = "bg-[var(--amber-soft)]";
    stubText = "text-[var(--amber)]";
    label = days === 0 ? "vence hoje" : days === 1 ? "vence amanhã" : "dias";
  } else {
    label = "dias";
  }

  function doMarkPaid() {
    startTransition(async () => {
      await markBillPaid(bill.id);
      showToast(isRecurring ? "Paga — renovada para o próximo ciclo" : "Conta marcada como paga");
      setConfirmOpen(false);
    });
  }

  function handleMarkPaidClick() {
    if (isRecurring) {
      setConfirmOpen(true);
    } else {
      doMarkPaid();
    }
  }

  function handleReopen() {
    startTransition(async () => {
      await reopenBill(bill.id);
      showToast("Conta reaberta");
    });
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
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] font-mono truncate">
            {formatMoneyBRL(bill.amount)} · {formatDateBR(bill.due_date)} · {CATEGORY_LABEL[bill.category] || "Outros"}
            {bill.recurring !== "none" && (bill.recurring === "monthly" ? " · mensal" : " · anual")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/contas/${bill.id}/editar`}
            aria-label="Editar conta"
            className="tap text-[var(--ink-soft)] p-2 rounded-lg"
          >
            <Pencil size={16} />
          </Link>
          <div className="flex-1" />
          {bill.is_paid ? (
            <button
              disabled={isPending}
              onClick={handleReopen}
              className="tap text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-[var(--line)] text-[var(--ink-soft)]"
            >
              Reabrir
            </button>
          ) : (
            <button
              disabled={isPending}
              onClick={handleMarkPaidClick}
              className="tap text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-ink)] disabled:opacity-60"
            >
              Marcar paga
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Renovar conta recorrente?"
        description={`Isso marca como paga e reagenda o vencimento para ${formatDateBR(
          computeNextDueDate(bill.due_date, bill.recurring)
        )}.`}
        confirmLabel="Confirmar"
        pending={isPending}
        onConfirm={doMarkPaid}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
