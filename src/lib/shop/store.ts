import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BARBERS, HOURS, SERVICES, SLOT_MINUTES } from "@/lib/shop/catalog";
import { assignBarber, formatMinutes, isFree, minutesOf, parseDay } from "@/lib/shop/schedule";
import type { Barber, BookInput, Booking, BookingStatus, DayHours, PayMethod, Service } from "@/lib/shop/types";

type CardExtra = { last4?: string; brand?: string };

type ShopState = {
  services: Service[];
  barbers: Barber[];
  hours: DayHours[];
  slotMinutes: number;
  bookings: Booking[];
  initialized: boolean;
  hydrated: boolean;
  book: (input: BookInput) => { ok: true; booking: Booking } | { ok: false; error: string };
  setBookingStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string) => void;
  registerPayment: (id: string, method: PayMethod, extra?: CardExtra) => void;
  updateService: (id: string, patch: Partial<Service>) => void;
  addService: (input: Omit<Service, "id" | "active">) => void;
  updateBarber: (id: string, patch: Partial<Barber>) => void;
  updateHours: (day: number, patch: Partial<DayHours>) => void;
  setSlotMinutes: (n: number) => void;
  resetDemo: (bookings: Booking[]) => void;
};

function makeCode(existing: Booking[]) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let n = 0; n < 8; n++) {
    let s = "";
    for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!existing.some((b) => b.code === s)) return s;
  }
  return `L${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      services: SERVICES,
      barbers: BARBERS,
      hours: HOURS,
      slotMinutes: SLOT_MINUTES,
      bookings: [],
      initialized: false,
      hydrated: false,
      book: (input) => {
        const state = get();
        const service = state.services.find((s) => s.id === input.serviceId && s.active);
        if (!service) return { ok: false, error: "Esse serviço não está disponível." };
        const start = minutesOf(input.time);
        const barberId =
          input.barberId ??
          assignBarber(state.barbers, state.bookings, input.date, start, service.minutes);
        if (!barberId) return { ok: false, error: "Esse horário não está mais livre." };
        const barber = state.barbers.find((b) => b.id === barberId && b.active);
        if (!barber) return { ok: false, error: "Profissional indisponível." };
        if (!isFree(state.bookings, barberId, input.date, start, service.minutes)) {
          return { ok: false, error: "Esse horário não está mais livre." };
        }
        const h = state.hours.find((x) => x.day === parseDay(input.date).getDay());
        if (!h || h.closed) return { ok: false, error: "A barbearia está fechada nesse dia." };
        if (start < minutesOf(h.open) || start + service.minutes > minutesOf(h.close)) {
          return { ok: false, error: "Horário fora do expediente." };
        }
        const code = makeCode(state.bookings);
        const booking: Booking = {
          id: `bk_${code.toLowerCase()}`,
          code,
          serviceId: service.id,
          barberId,
          date: input.date,
          time: formatMinutes(start),
          minutes: service.minutes,
          priceCents: service.priceCents,
          customerName: input.customerName.trim(),
          phone: input.phone.replace(/\D/g, ""),
          email: input.email.trim(),
          notes: input.notes.trim().slice(0, 240),
          status: input.payStatus === "paid" ? "confirmed" : "pending",
          payMethod: input.payMethod,
          payStatus: input.payStatus,
          cardLast4: input.cardLast4,
          cardBrand: input.cardBrand,
          createdAt: new Date().toISOString(),
        };
        set({ bookings: [booking, ...state.bookings] });
        return { ok: true, booking };
      },
      setBookingStatus: (id, status) => {
        if (status === "cancelled") return;
        set({
          bookings: get().bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        });
      },
      cancelBooking: (id) => {
        set({
          bookings: get().bookings.map((b) => {
            if (b.id !== id) return b;
            return {
              ...b,
              status: "cancelled",
              payStatus: b.payStatus === "paid" ? "refunded" : b.payStatus,
            };
          }),
        });
      },
      registerPayment: (id, method, extra) => {
        set({
          bookings: get().bookings.map((b) => {
            if (b.id !== id || b.status === "cancelled") return b;
            return {
              ...b,
              payMethod: method,
              payStatus: "paid",
              status: b.status === "pending" ? "confirmed" : b.status,
              cardLast4: method === "card" ? (extra?.last4 ?? b.cardLast4) : undefined,
              cardBrand: method === "card" ? (extra?.brand ?? b.cardBrand) : undefined,
            };
          }),
        });
      },
      updateService: (id, patch) => {
        set({
          services: get().services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        });
      },
      addService: (input) => {
        const id = `srv_${Math.random().toString(36).slice(2, 8)}`;
        set({ services: [...get().services, { ...input, id, active: true }] });
      },
      updateBarber: (id, patch) => {
        set({
          barbers: get().barbers.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        });
      },
      updateHours: (day, patch) => {
        set({
          hours: get().hours.map((h) => (h.day === day ? { ...h, ...patch } : h)),
        });
      },
      setSlotMinutes: (n) => set({ slotMinutes: n }),
      resetDemo: (bookings) =>
        set({
          services: SERVICES,
          barbers: BARBERS,
          hours: HOURS,
          slotMinutes: SLOT_MINUTES,
          bookings,
          initialized: true,
        }),
    }),
    {
      name: "lamina-shop-v1",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : localStorage)),
      partialize: (s) => ({
        services: s.services,
        barbers: s.barbers,
        hours: s.hours,
        slotMinutes: s.slotMinutes,
        bookings: s.bookings,
        initialized: s.initialized,
      }),
    },
  ),
);
