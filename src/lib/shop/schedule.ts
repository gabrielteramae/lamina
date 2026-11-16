import type { Barber, Booking, DayHours, Service } from "@/lib/shop/types";

export function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function minutesOf(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function durationLabel(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return h === 1 ? "1 hora" : `${h} horas`;
  return `${h} h ${m} min`;
}

export function blocksSlot(booking: Booking) {
  return booking.status !== "cancelled" && booking.status !== "no_show";
}

export function isFree(
  bookings: Booking[],
  barberId: string,
  date: string,
  start: number,
  duration: number,
) {
  const end = start + duration;
  return !bookings.some((b) => {
    if (!blocksSlot(b) || b.barberId !== barberId || b.date !== date) return false;
    const bs = minutesOf(b.time);
    const be = bs + b.minutes;
    return start < be && bs < end;
  });
}

export function candidateStarts(open: string, close: string, step: number, duration: number) {
  const a = minutesOf(open);
  const b = minutesOf(close);
  const out: number[] = [];
  if (step <= 0 || b <= a) return out;
  for (let t = a; t + duration <= b; t += step) out.push(t);
  return out;
}

export function openDates(hours: DayHours[], from: Date, count: number) {
  const out: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 28 && out.length < count; i++) {
    const h = hours.find((x) => x.day === cursor.getDay());
    if (h && !h.closed) out.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export function availableTimes(opts: {
  hours: DayHours[];
  slotMinutes: number;
  bookings: Booking[];
  barbers: Barber[];
  service: Service;
  date: string;
  barberId: string | null;
  now: Date;
}) {
  const day = parseDay(opts.date).getDay();
  const h = opts.hours.find((x) => x.day === day);
  if (!h || h.closed) return [];
  const starts = candidateStarts(h.open, h.close, opts.slotMinutes, opts.service.minutes);
  const today = dayKey(opts.now) === opts.date;
  const minStart = today ? opts.now.getHours() * 60 + opts.now.getMinutes() : -1;
  return starts
    .filter((t) => t > minStart)
    .filter((t) => {
      if (opts.barberId) {
        const barber = opts.barbers.find((b) => b.id === opts.barberId);
        if (!barber?.active) return false;
        return isFree(opts.bookings, opts.barberId, opts.date, t, opts.service.minutes);
      }
      return opts.barbers.some(
        (b) => b.active && isFree(opts.bookings, b.id, opts.date, t, opts.service.minutes),
      );
    })
    .map(formatMinutes);
}

export function assignBarber(
  barbers: Barber[],
  bookings: Booking[],
  date: string,
  start: number,
  duration: number,
) {
  const ranked = barbers
    .filter((b) => b.active && isFree(bookings, b.id, date, start, duration))
    .map((b) => ({
      id: b.id,
      n: bookings.filter((x) => x.barberId === b.id && x.date === date && blocksSlot(x)).length,
    }))
    .sort((a, c) => a.n - c.n);
  return ranked[0]?.id ?? null;
}

export function firstOpening(opts: {
  hours: DayHours[];
  slotMinutes: number;
  bookings: Booking[];
  barbers: Barber[];
  service: Service;
  now: Date;
}) {
  for (const date of openDates(opts.hours, opts.now, 12)) {
    const times = availableTimes({ ...opts, date, barberId: null });
    if (times[0]) return { date, time: times[0] };
  }
  return null;
}

export function shiftOpen(from: Date, dir: 1 | -1, steps: number, hours: DayHours[]) {
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let found = 0;
  for (let i = 0; i < 21; i++) {
    cursor.setDate(cursor.getDate() + dir);
    const h = hours.find((x) => x.day === cursor.getDay());
    if (h && !h.closed) {
      found += 1;
      if (found === steps) return dayKey(cursor);
    }
  }
  return dayKey(from);
}

export function todayOrNextOpen(now: Date, hours: DayHours[]) {
  const h = hours.find((x) => x.day === now.getDay());
  if (h && !h.closed) return dayKey(now);
  return shiftOpen(now, 1, 1, hours);
}
