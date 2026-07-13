import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BillForm from "@/components/BillForm";
import DeleteBillButton from "@/components/DeleteBillButton";
import { updateBill } from "@/lib/actions";

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

  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-8">
      <div className="max-w-md mx-auto fade-in">
        <h1 className="font-display text-2xl font-semibold text-[var(--ink)] mb-6">
          Editar conta
        </h1>
        <BillForm action={updateWithId} initial={bill} submitLabel="Salvar alterações" />

        <div className="mt-4">
          <DeleteBillButton id={id} />
        </div>
      </div>
    </main>
  );
}
