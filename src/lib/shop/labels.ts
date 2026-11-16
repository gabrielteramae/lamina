import type { BookingStatus, PayMethod, PayStatus } from "@/lib/shop/types";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "A confirmar",
  confirmed: "Confirmada",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Faltou",
};

export const PAY_LABEL: Record<PayStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  refunded: "Estornado",
  declined: "Recusado",
};

export const METHOD_LABEL: Record<PayMethod, string> = {
  pix: "Pix",
  card: "Cartão",
  shop: "Na cadeira",
};

export const WEEKDAYS = [
  { day: 0, long: "Domingo", short: "Dom" },
  { day: 1, long: "Segunda", short: "Seg" },
  { day: 2, long: "Terça", short: "Ter" },
  { day: 3, long: "Quarta", short: "Qua" },
  { day: 4, long: "Quinta", short: "Qui" },
  { day: 5, long: "Sexta", short: "Sex" },
  { day: 6, long: "Sábado", short: "Sáb" },
] as const;
