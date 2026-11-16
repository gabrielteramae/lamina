import { BARBERS, HOURS, SERVICES } from "@/lib/shop/catalog";
import { shiftOpen, todayOrNextOpen } from "@/lib/shop/schedule";
import type { Booking } from "@/lib/shop/types";

type Draft = Omit<Booking, "notes" | "createdAt" | "id"> & { notes?: string };

function row(draft: Draft, now: Date): Booking {
  return {
    notes: "",
    createdAt: now.toISOString(),
    ...draft,
    id: `bk_${draft.code.toLowerCase()}`,
  };
}

export function buildSeedBookings(now: Date): Booking[] {
  const past = shiftOpen(now, -1, 1, HOURS);
  const today = todayOrNextOpen(now, HOURS);
  const next = shiftOpen(parseDaySafe(today), 1, 1, HOURS);
  const later = shiftOpen(parseDaySafe(today), 1, 2, HOURS);
  const corte = SERVICES[0];
  const degrade = SERVICES[1];
  const barba = SERVICES[2];
  const combo = SERVICES[3];
  const navalha = SERVICES[4];
  if (!corte || !degrade || !barba || !combo || !navalha) return [];

  const rafael = BARBERS[0];
  const caio = BARBERS[1];
  const helena = BARBERS[2];
  if (!rafael || !caio || !helena) return [];

  return [
    row(
      {
        code: "LM7A2K",
        serviceId: combo.id,
        barberId: rafael.id,
        date: past,
        time: "11:00",
        minutes: combo.minutes,
        priceCents: combo.priceCents,
        customerName: "Marcos Teixeira",
        phone: "11987651110",
        email: "marcos.teixeira@email.com",
        status: "completed",
        payMethod: "pix",
        payStatus: "paid",
      },
      now,
    ),
    row(
      {
        code: "LM9C4P",
        serviceId: barba.id,
        barberId: caio.id,
        date: past,
        time: "14:00",
        minutes: barba.minutes,
        priceCents: barba.priceCents,
        customerName: "Diego Ramos",
        phone: "11982334455",
        email: "diego.ramos@email.com",
        status: "no_show",
        payMethod: "card",
        payStatus: "paid",
        cardLast4: "4242",
        cardBrand: "Visa",
        notes: "Não compareceu. Pagamento mantido.",
      },
      now,
    ),
    row(
      {
        code: "LM2H8Q",
        serviceId: degrade.id,
        barberId: helena.id,
        date: past,
        time: "12:30",
        minutes: degrade.minutes,
        priceCents: degrade.priceCents,
        customerName: "Paulo Henrique",
        phone: "11976540021",
        email: "paulo.henrique@email.com",
        status: "cancelled",
        payMethod: "pix",
        payStatus: "refunded",
      },
      now,
    ),
    row(
      {
        code: "LM4K1D",
        serviceId: corte.id,
        barberId: rafael.id,
        date: today,
        time: "11:00",
        minutes: corte.minutes,
        priceCents: corte.priceCents,
        customerName: "Miguel Andrade",
        phone: "11987651234",
        email: "miguel.andrade@email.com",
        status: "confirmed",
        payMethod: "pix",
        payStatus: "paid",
      },
      now,
    ),
    row(
      {
        code: "LM8N3W",
        serviceId: combo.id,
        barberId: rafael.id,
        date: today,
        time: "14:00",
        minutes: combo.minutes,
        priceCents: combo.priceCents,
        customerName: "Lucas Ferreira",
        phone: "11991228800",
        email: "lucas.ferreira@email.com",
        status: "pending",
        payMethod: "shop",
        payStatus: "pending",
        notes: "Primeira vez. Prefere tesoura.",
      },
      now,
    ),
    row(
      {
        code: "LM5T6B",
        serviceId: barba.id,
        barberId: caio.id,
        date: today,
        time: "12:30",
        minutes: barba.minutes,
        priceCents: barba.priceCents,
        customerName: "Pedro Nunes",
        phone: "11999887766",
        email: "pedro.nunes@email.com",
        status: "confirmed",
        payMethod: "card",
        payStatus: "paid",
        cardLast4: "1881",
        cardBrand: "Mastercard",
      },
      now,
    ),
    row(
      {
        code: "LM1R9F",
        serviceId: navalha.id,
        barberId: helena.id,
        date: today,
        time: "11:30",
        minutes: navalha.minutes,
        priceCents: navalha.priceCents,
        customerName: "Thiago Mendes",
        phone: "11993445566",
        email: "thiago.mendes@email.com",
        status: "completed",
        payMethod: "card",
        payStatus: "paid",
        cardLast4: "4242",
        cardBrand: "Visa",
      },
      now,
    ),
    row(
      {
        code: "LM6Y2M",
        serviceId: degrade.id,
        barberId: helena.id,
        date: today,
        time: "14:30",
        minutes: degrade.minutes,
        priceCents: degrade.priceCents,
        customerName: "João Vieira",
        phone: "11984561209",
        email: "joao.vieira@email.com",
        status: "confirmed",
        payMethod: "pix",
        payStatus: "paid",
      },
      now,
    ),
    row(
      {
        code: "LM3P7C",
        serviceId: barba.id,
        barberId: rafael.id,
        date: next,
        time: "11:00",
        minutes: barba.minutes,
        priceCents: barba.priceCents,
        customerName: "André Luz",
        phone: "11981112233",
        email: "andre.luz@email.com",
        status: "confirmed",
        payMethod: "pix",
        payStatus: "paid",
      },
      now,
    ),
    row(
      {
        code: "LM0D5H",
        serviceId: combo.id,
        barberId: caio.id,
        date: next,
        time: "13:00",
        minutes: combo.minutes,
        priceCents: combo.priceCents,
        customerName: "Bruno Castro",
        phone: "11990011224",
        email: "bruno.castro@email.com",
        status: "pending",
        payMethod: "shop",
        payStatus: "pending",
      },
      now,
    ),
    row(
      {
        code: "LM2W8L",
        serviceId: corte.id,
        barberId: helena.id,
        date: next,
        time: "15:00",
        minutes: corte.minutes,
        priceCents: corte.priceCents,
        customerName: "Renato Pires",
        phone: "11997776655",
        email: "renato.pires@email.com",
        status: "confirmed",
        payMethod: "card",
        payStatus: "paid",
        cardLast4: "0010",
        cardBrand: "Visa",
      },
      now,
    ),
    row(
      {
        code: "LM9Q1S",
        serviceId: degrade.id,
        barberId: rafael.id,
        date: later,
        time: "12:00",
        minutes: degrade.minutes,
        priceCents: degrade.priceCents,
        customerName: "Felipe Costa",
        phone: "11983216745",
        email: "felipe.costa@email.com",
        status: "confirmed",
        payMethod: "pix",
        payStatus: "paid",
      },
      now,
    ),
    row(
      {
        code: "LM4B6N",
        serviceId: corte.id,
        barberId: caio.id,
        date: later,
        time: "11:00",
        minutes: corte.minutes,
        priceCents: corte.priceCents,
        customerName: "Gustavo Lima",
        phone: "11985647382",
        email: "gustavo.lima@email.com",
        status: "confirmed",
        payMethod: "pix",
        payStatus: "pending",
      },
      now,
    ),
  ];
}

function parseDaySafe(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1);
}
