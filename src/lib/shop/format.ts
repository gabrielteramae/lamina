import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseDay } from "@/lib/shop/schedule";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatMoney(cents: number) {
  return brl.format(cents / 100);
}

export function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

export function formatDayLong(key: string) {
  return format(parseDay(key), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatDayChip(key: string) {
  return format(parseDay(key), "EEE d MMM", { locale: ptBR });
}

export function parseReais(raw: string) {
  const t = raw.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const cents = Math.round(Number(t) * 100);
  if (!Number.isFinite(cents) || cents <= 0 || cents > 1_000_000) return null;
  return cents;
}

export function validPhone(digits: string) {
  return /^\d{10,11}$/.test(digits);
}

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
