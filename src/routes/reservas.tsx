import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PayPill, StatusPill } from "@/components/booking/status";
import { SiteShell } from "@/components/site/shell";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import { formatDayLong, formatMoney, formatPhone } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/reservas")({
  head: () => ({ meta: [{ title: "Reservas — Lâmina" }] }),
  component: ReservasPage,
});

function ReservasPage() {
  const hydrated = useShop((s) => s.hydrated);
  const bookings = useShop((s) => s.bookings);
  const services = useShop((s) => s.services);
  const barbers = useShop((s) => s.barbers);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return bookings
      .filter((b) => {
        if (!q) return true;
        const phone = b.phone.replace(/\D/g, "");
        return (
          b.code.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          (digits.length >= 3 && phone.includes(digits))
        );
      })
      .slice()
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [bookings, query]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <p className="text-sm text-muted">Consulta</p>
        <h1 className="mt-2 font-display text-4xl text-fg md:text-5xl">Suas reservas</h1>
        <p className="mt-4 text-muted">Busque pelo código, nome, e-mail ou telefone usados na marcação.</p>
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Código ou telefone"
            aria-label="Buscar reserva"
          />
          <Button type="submit" variant="line">
            Buscar
          </Button>
        </form>

        {!hydrated ? (
          <p className="mt-8 text-muted">Abrindo a agenda…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-muted">Nenhuma reserva com esse filtro neste navegador.</p>
        ) : (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {filtered.map((booking) => {
              const service = services.find((s) => s.id === booking.serviceId);
              const barber = barbers.find((b) => b.id === booking.barberId);
              return (
                <li key={booking.id} className="py-4">
                  <Link to="/reserva/$code" params={{ code: booking.code }} className="block">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-fg">{booking.customerName}</span>
                      <span className="tabular-nums text-fg">{formatMoney(booking.priceCents)}</span>
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {service?.name ?? "Serviço"} · {barber?.name ?? "Profissional"} · {booking.time}
                    </span>
                    <span className="mt-1 block text-sm capitalize text-faint">{formatDayLong(booking.date)}</span>
                    <span className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted">{booking.code}</span>
                      <StatusPill status={booking.status} />
                      <PayPill status={booking.payStatus} />
                      <span className="text-xs text-faint">{formatPhone(booking.phone)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}
