"use client";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 modal-backdrop-in"
        onClick={onCancel}
      />
      <div className="relative w-full sm:max-w-sm bg-[var(--surface)] border border-[var(--line)] rounded-t-2xl sm:rounded-2xl p-5 modal-panel-in">
        <h2 className="font-medium text-[var(--ink)] mb-1.5">{title}</h2>
        <p className="text-sm text-[var(--ink-soft)] mb-5">{description}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={pending}
            className="tap flex-1 text-center text-sm text-[var(--ink-soft)] px-4 py-2.5 rounded-lg border border-[var(--line)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className={`tap flex-1 text-center text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-60 ${
              danger
                ? "bg-[var(--danger)] text-white"
                : "bg-[var(--primary)] text-[var(--primary-ink)]"
            }`}
          >
            {pending ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
