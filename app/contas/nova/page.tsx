import BillForm from "@/components/BillForm";
import { createBill } from "@/lib/actions";

export default function NovaContaPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-8">
      <div className="max-w-md mx-auto fade-in">
        <h1 className="font-display text-2xl font-semibold text-[var(--ink)] mb-6">
          Nova conta
        </h1>
        <BillForm action={createBill} submitLabel="Salvar conta" />
      </div>
    </main>
  );
}
