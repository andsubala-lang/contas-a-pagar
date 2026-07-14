"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import QuietBillRow from "@/components/QuietBillRow";

export default function MoreBillsDisclosure({
  bills,
  monitoredCount,
}: {
  bills: any[];
  monitoredCount: number;
}) {
  const [open, setOpen] = useState(false);

  if (bills.length === 0) return null;

  const label =
    monitoredCount > 0
      ? `${monitoredCount} ${monitoredCount === 1 ? "conta" : "contas"} sob controle`
      : "Ver histórico";

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap flex items-center gap-1.5 text-sm text-[var(--ink-soft)] font-mono"
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-[220ms] ${open ? "rotate-180" : ""}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }}
        />
      </button>

      {open && (
        <div className="mt-3 bg-[var(--surface)] border border-[var(--line)] rounded-2xl px-4 fade-in">
          {bills.map((b) => (
            <QuietBillRow key={b.id} bill={b} />
          ))}
        </div>
      )}
    </div>
  );
}
