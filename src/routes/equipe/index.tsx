import { Link, createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { PayPill, StatusPill } from "@/components/booking/status";
import { formatDayChip, formatMoney } from "@/lib/shop/format";
import { dayKey } from "@/lib/shop/schedule";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/equipe/")({
  head: () => ({ meta: [{ title: "Painel — Lâmina" }] }),
  component: PainelPage,
});

function PainelPage() {
  const hydrated = useShop((s) => s.hydrated);
  const bookings = useShop((s) => s.bookings);
  const services = useShop((s) => s.services);
  const barbers = useShop((s) => s.barbers);

  if (!hydrated) return <p className="text-muted">Abrindo a agenda…</p>;

  const now = new Date();
  const today = dayKey(now);
  const todayRows = bookings.filter((b) => b.date === today && b.status !== "cancelled");
  const pending = bookings.filter((b) => b.status === "pending");
  const received = bookings
    .filter((b) => b.date === today && b.payStatus === "paid")
    .reduce((sum, b) => sum + b.priceCents, 0);
  const due = bookings
    .filter((b) => b.payStatus === "pending" && b.status !== "cancelled")
    .reduce((sum, b) => sum + b.priceCents, 0);

  const chart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
    const key = dayKey(d);
    const cents = bookings
      .filter((b) => b.date === key && b.payStatus === "paid")
      .reduce((sum, b) => sum + b.priceCents, 0);
    return { label: formatDayChip(key).slice(0, 3), cents };
  });

  const upcoming = bookings
    .filter((b) => b.date >= today && b.status !== "cancelled")
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);

  return (
    <div>
      <p className="text-sm text-muted">Equipe</p>
      <h1 className="mt-2 font-display text-4xl text-fg">Hoje na Lâmina</h1>
      <p className="mt-3 max-w-xl text-sm text-faint">
        Demonstração neste navegador. Pix e cartão não cobram valor real.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Horários hoje" value={String(todayRows.length)} />
        <Stat label="A confirmar" value={String(pending.length)} />
        <Stat label="Recebido hoje" value={formatMoney(received)} />
        <Stat label="A receber" value={formatMoney(due)} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-fg">Recebido na semana</h2>
        <div className="mt-4 h-52 w-full min-w-0" aria-label="Recebidos nos últimos 7 dias">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-faint)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--color-raised)" }}
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 12,
                  color: "var(--color-fg)",
                }}
                formatter={(value) => [formatMoney(Number(value ?? 0)), "Recebido"]}
              />
              <Bar dataKey="cents" fill="var(--color-bone)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-fg">Próximos</h2>
          <Link to="/equipe/agenda" className="text-sm text-muted hover:text-fg">
            Agenda
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {upcoming.length === 0 ? (
            <li className="py-4 text-sm text-muted">Nada marcado.</li>
          ) : (
            upcoming.map((booking) => {
              const service = services.find((s) => s.id === booking.serviceId);
              const barber = barbers.find((b) => b.id === booking.barberId);
              return (
                <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="text-fg">{booking.customerName}</p>
                    <p className="text-sm text-muted">
                      {formatDayChip(booking.date)} · {booking.time} · {service?.name} · {barber?.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill status={booking.status} />
                    <PayPill status={booking.payStatus} />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums text-fg">{value}</p>
    </div>
  );
}
