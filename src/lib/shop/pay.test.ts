import assert from "node:assert/strict";
import test from "node:test";
import { luhnOk, validateCard } from "./pay.ts";
import { availableTimes, isFree } from "./schedule.ts";
import { BARBERS, HOURS, SERVICES } from "./catalog.ts";
import type { Booking } from "./types.ts";

test("luhn accepts the demo card and rejects a short number", () => {
  assert.equal(luhnOk("4242424242424242"), true);
  assert.equal(luhnOk("4242424242424243"), false);
});

test("decline card is refused even when the number is valid", () => {
  const result = validateCard(
    { number: "4000000000000002", name: "Ana Luz", expiry: "12/30", cvv: "123" },
    new Date(2026, 10, 16),
  );
  assert.equal(result.ok, false);
});

test("a booking blocks only that barber's overlapping start", () => {
  const corte = SERVICES[0];
  assert.ok(corte);
  const booking: Booking = {
    id: "bk_test",
    code: "TEST01",
    serviceId: corte.id,
    barberId: "rafael",
    date: "2026-11-17",
    time: "11:00",
    minutes: corte.minutes,
    priceCents: corte.priceCents,
    customerName: "Teste",
    phone: "11999999999",
    email: "t@email.com",
    notes: "",
    status: "confirmed",
    payMethod: "pix",
    payStatus: "paid",
    createdAt: "2026-11-16T12:00:00.000Z",
  };
  assert.equal(isFree([booking], "rafael", "2026-11-17", 11 * 60, 45), false);
  assert.equal(isFree([booking], "caio", "2026-11-17", 11 * 60, 45), true);
  const times = availableTimes({
    hours: HOURS,
    slotMinutes: 30,
    bookings: [booking],
    barbers: BARBERS,
    service: corte,
    date: "2026-11-17",
    barberId: "rafael",
    now: new Date(2026, 10, 16, 9, 0),
  });
  assert.equal(times.includes("11:00"), false);
  assert.equal(times.includes("12:00"), true);
});
