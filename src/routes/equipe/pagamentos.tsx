import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PayPill } from "@/components/booking/status";
import { chipClass } from "@/components/ui/button";
import { formatDayChip, formatMoney } from "@/lib/shop/format";
import { METHOD_LABEL } from "@/lib/shop/labels";
import { useShop } from "@/lib/shop/store";
import type { PayStatus } from "@/lib/shop/types";

export const Route = createFileRoute("/equipe/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamentos — Lâmina" }] }),
  component: PagamentosPage,
});

type Filter = "all" | PayStatus;

function PagamentosPage() {
  const hydrated = useShop((s) => s.hydrated);
  const bookings = useShop((s) => s.bookings);
  const services = useShop((s) => s.services);
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    return bookings
      .filter((b) => (filter === "all" ? true : b.payStatus === filter))
      .slice()
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [bookings, filter]);

  if (!hydrated) return <p className="text-muted">Abrindo os pagamentos…</p>;

  const sum = (status: PayStatus) =>
    bookings.filter((b) => b.payStatus === status).reduce((total, b) => total + b.priceCents, 0);

  return (
    <div>
      <h1 className="font-display text-4xl text-fg">Pagamentos</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Livro-caixa da demonstração. Nada sai da conta de ninguém.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Recebido" value={formatMoney(sum("paid"))} />
        <Stat label="A receber" value={formatMoney(sum("pending"))} />
        <Stat label="Estornado" value={formatMoney(sum("refunded"))} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "Todos"],
            ["paid", "Pagos"],
            ["pending", "Pendentes"],
            ["refunded", "Estornados"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={chipClass(filter === id)} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {rows.length === 0 ? (
          <li className="py-6 text-sm text-muted">Nenhum pagamento nesse filtro.</li>
        ) : (
          rows.map((booking) => (
            <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="text-fg">{booking.customerName}</p>
                <p className="text-sm text-muted">
                  {formatDayChip(booking.date)} · {booking.code} · {METHOD_LABEL[booking.payMethod]}
                  {booking.cardLast4 ? ` · final ${booking.cardLast4}` : ""} ·{" "}
                  {services.find((s) => s.id === booking.serviceId)?.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <PayPill status={booking.payStatus} />
                <p className="tabular-nums text-fg">{formatMoney(booking.priceCents)}</p>
              </div>
            </li>
          ))
        )}
      </ul>
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
