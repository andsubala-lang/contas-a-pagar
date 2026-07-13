"use client";

import { useState, useTransition } from "react";
import { deleteBill } from "@/lib/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteBillButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tap w-full text-center text-sm text-[var(--ink-soft)] py-2.5"
      >
        Excluir conta
      </button>

      <ConfirmDialog
        open={open}
        title="Excluir esta conta?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        pending={isPending}
        onConfirm={() => startTransition(() => deleteBill(id))}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
