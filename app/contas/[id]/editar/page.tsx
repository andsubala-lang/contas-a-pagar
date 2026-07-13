import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BillForm from "@/components/BillForm";
import { updateBill, deleteBill } from "@/lib/actions";

export default async function EditarContaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: bill } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .single();

  if (!bill) notFound();

  const updateWithId = updateBill.bind(null, id);
  const deleteWithId = deleteBill.bind(null, id);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-8">
      <div className="max-w-md mx-auto fade-in">
        <h1 className="font-display text-2xl font-semibold text-[var(--primary)] mb-6">
          Editar conta
        </h1>
        <BillForm action={updateWithId} initial={bill} submitLabel="Salvar alterações" />

        <form action={deleteWithId} className="mt-4">
          <button
            type="submit"
            className="w-full text-center text-sm text-[var(--danger)] py-2.5 rounded-lg border border-[var(--danger)] border-opacity-30"
          >
            Excluir conta
          </button>
        </form>
      </div>
    </main>
  );
}
