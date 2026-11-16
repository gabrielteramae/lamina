import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { SettlePayment } from "@/components/booking/pay";
import { PayPill, StatusPill } from "@/components/booking/status";
import { SiteShell } from "@/components/site/shell";
import { btnClass } from "@/components/ui/button";
import { SHOP } from "@/lib/shop/catalog";
import { formatDayLong, formatMoney, formatPhone } from "@/lib/shop/format";
import { METHOD_LABEL } from "@/lib/shop/labels";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/reserva/$code")({
  head: () => ({ meta: [{ title: "Reserva — Lâmina" }] }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { code } = Route.useParams();
  const hydrated = useShop((s) => s.hydrated);
  const booking = useShop((s) => s.bookings.find((b) => b.code.toLowerCase() === code.toLowerCase()));
  const service = useShop((s) => s.services.find((item) => item.id === booking?.serviceId));
  const barber = useShop((s) => s.barbers.find((item) => item.id === booking?.barberId));

  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-5 py-10 md:py-14">
        {!hydrated ? (
          <p className="text-muted">Abrindo a reserva…</p>
        ) : !booking ? (
          <div>
            <h1 className="font-display text-4xl text-fg">Reserva não encontrada</h1>
            <p className="mt-4 text-muted">Esse código não está salvo neste navegador.</p>
            <Link to="/reservas" className={btnClass("solid", "md", "mt-6")}>
              Buscar reserva
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted">Reserva</p>
            <div className="mt-4 rounded-3xl border border-dashed border-line bg-surface p-5">
              <p className="text-sm text-muted">Código</p>
              <p className="mt-1 font-display text-4xl tracking-wide text-fg">{booking.code}</p>
              <button
                type="button"
                className="mt-2 text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
                onClick={() => {
                  void navigator.clipboard?.writeText(booking.code).then(
                    () => toast("Código copiado"),
                    () => toast("Não foi possível copiar"),
                  );
                }}
              >
                Copiar
              </button>
            </div>

            <dl className="mt-6 grid gap-3 text-sm">
              <Row label="Cliente" value={booking.customerName} />
              <Row label="Contato" value={`${formatPhone(booking.phone)} · ${booking.email}`} />
              <Row label="Serviço" value={service?.name ?? "Serviço"} />
              <Row label="Profissional" value={barber?.name ?? "Profissional"} />
              <Row label="Quando" value={`${formatDayLong(booking.date)} · ${booking.time}`} />
              <Row label="Onde" value={`${SHOP.address}, ${SHOP.neighborhood}`} />
              <Row label="Forma" value={METHOD_LABEL[booking.payMethod]} />
            </dl>
            {booking.notes ? <p className="mt-4 text-sm text-muted">{booking.notes}</p> : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill status={booking.status} />
              <PayPill status={booking.payStatus} />
            </div>

            <p className="mt-6 font-display text-4xl tabular-nums text-fg">{formatMoney(booking.priceCents)}</p>

            <div className="mt-6">
              <SettlePayment booking={booking} />
            </div>

            <Link to="/reservas" className="mt-8 inline-flex text-sm text-muted hover:text-fg">
              Todas as reservas
            </Link>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-fg">{value}</dd>
    </div>
  );
}
