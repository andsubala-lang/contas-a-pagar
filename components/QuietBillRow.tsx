import Link from "next/link";
import { formatDateBR, formatMoneyBRL } from "@/lib/dates";

type Bill = {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  is_paid: boolean;
};

export default function QuietBillRow({ bill }: { bill: Bill }) {
  return (
    <Link
      href={`/contas/${bill.id}/editar`}
      className="tap flex items-center justify-between gap-3 py-2.5 border-b border-[var(--line)] last:border-b-0"
    >
      <span
        className={`text-sm truncate ${
          bill.is_paid ? "text-[var(--ink-soft)] line-through" : "text-[var(--ink)]"
        }`}
      >
        {bill.name}
      </span>
      <span className="text-xs text-[var(--ink-soft)] font-mono shrink-0">
        {bill.is_paid ? "paga" : formatDateBR(bill.due_date)}
      </span>
    </Link>
  );
}
