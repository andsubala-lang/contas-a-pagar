export function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

export function formatDateBR(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMoneyBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const CATEGORIES = [
  { value: "moradia", label: "Moradia (aluguel/condomínio)" },
  { value: "utilidades", label: "Água, luz, internet" },
  { value: "assinaturas", label: "Assinaturas" },
  { value: "cartao", label: "Cartão de crédito" },
  { value: "saude", label: "Saúde" },
  { value: "outros", label: "Outros" },
];

export const RECURRING_LABEL: Record<string, string> = {
  none: "Não se repete",
  monthly: "Mensal",
  yearly: "Anual",
};

export function computeNextDueDate(dueDate: string, recurring: string): string {
  if (recurring !== "monthly" && recurring !== "yearly") return dueDate;
  const d = new Date(dueDate + "T00:00:00");
  if (recurring === "monthly") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}
