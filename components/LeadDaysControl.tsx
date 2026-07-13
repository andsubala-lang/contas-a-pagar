"use client";

import { useTransition } from "react";
import { updateLeadDays } from "@/lib/actions";
import { showToast } from "@/lib/toast";

export default function LeadDaysControl({ initialValue }: { initialValue: number }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    const fd = new FormData();
    fd.set("lead_days", value);
    startTransition(async () => {
      await updateLeadDays(fd);
      showToast("Antecedência atualizada");
    });
  }

  return (
    <select
      defaultValue={initialValue}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-[var(--line)] px-3 py-2 bg-[var(--surface-input)] disabled:opacity-60"
    >
      {[1, 2, 3, 5, 7, 10].map((d) => (
        <option key={d} value={d}>
          {d} {d === 1 ? "dia" : "dias"} antes
        </option>
      ))}
    </select>
  );
}
