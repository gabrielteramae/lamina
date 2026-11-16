import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PayPill, StatusPill } from "@/components/booking/status";
import { Button, chipClass } from "@/components/ui/button";
import { TextInput } from "@/components/ui/field";
import { formatDayChip, formatMoney } from "@/lib/shop/format";
import { METHOD_LABEL } from "@/lib/shop/labels";
import { dayKey } from "@/lib/shop/schedule";
import { useShop } from "@/lib/shop/store";
import type { Booking, PayMethod } from "@/lib/shop/types";

export const Route = createFileRoute("/equipe/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Lâmina" }] }),
  component: AgendaPage,
});

type When = "open" | "today" | "all";
type StatusFilter = "all" | Booking["status"];

function AgendaPage() {
  const hydrated = useShop((s) => s.hydrated);
  const bookings = useShop((s) => s.bookings);
  const services = useShop((s) => s.services);
  const barbers = useShop((s) => s.barbers);
  const setBookingStatus = useShop((s) => s.setBookingStatus);
  const cancelBooking = useShop((s) => s.cancelBooking);
  const registerPayment = useShop((s) => s.registerPayment);
  const [query, setQuery] = useState("");
  const [when, setWhen] = useState<When>("open");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const today = dayKey(new Date());

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return bookings
      .filter((b) => {
        if (when === "today" && b.date !== today) return false;
        if (when === "open" && (b.date < today || b.status === "cancelled" || b.status === "completed")) {
          return false;
        }
        if (status !== "all" && b.status !== status) return false;
        if (!q) return true;
        const barber = barbers.find((item) => item.id === b.barberId)?.name.toLowerCase() ?? "";
        const service = services.find((item) => item.id === b.serviceId)?.name.toLowerCase() ?? "";
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          barber.includes(q) ||
          service.includes(q) ||
          (digits.length >= 3 && b.phone.includes(digits))
        );
      })
      .slice()
      .sort((a, b) => (when === "all" ? b.date + b.time : a.date + a.time).localeCompare(when === "all" ? a.date + a.time : b.date + b.time));
  }, [barbers, bookings, query, services, status, today, when]);

  if (!hydrated) return <p className="text-muted">Abrindo a agenda…</p>;

  return (
    <div>
      <h1 className="font-display text-4xl text-fg">Agenda</h1>
      <p className="mt-3 text-sm text-muted">{rows.length} reservas neste filtro.</p>

      <div className="mt-6 grid gap-3">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome, e-mail, telefone, profissional ou código"
          aria-label="Buscar na agenda"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["open", "Em aberto"],
              ["today", "Hoje"],
              ["all", "Todas"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className={chipClass(when === id)} onClick={() => setWhen(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Status"],
              ["pending", "A confirmar"],
              ["confirmed", "Confirmadas"],
              ["completed", "Concluídas"],
              ["no_show", "Faltas"],
              ["cancelled", "Canceladas"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className={chipClass(status === id)} onClick={() => setStatus(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {rows.length === 0 ? (
          <li className="py-6 text-sm text-muted">Nenhum horário com esse filtro.</li>
        ) : (
          rows.map((booking) => {
            const service = services.find((s) => s.id === booking.serviceId);
            const barber = barbers.find((b) => b.id === booking.barberId);
            const wasPaid = booking.payStatus === "paid";
            return (
              <li key={booking.id} className="grid gap-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-fg">{booking.customerName}</p>
                    <p className="text-sm text-muted">
                      {formatDayChip(booking.date)} · {booking.time} · {service?.name ?? "Serviço"} ·{" "}
                      {barber?.name ?? "Profissional"}
                    </p>
                    <p className="mt-1 text-sm text-faint">
                      {booking.code} · {booking.email} · {METHOD_LABEL[booking.payMethod]} ·{" "}
                      {formatMoney(booking.priceCents)}
                    </p>
                    {booking.notes ? <p className="mt-1 text-sm text-muted">{booking.notes}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill status={booking.status} />
                    <PayPill status={booking.payStatus} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {booking.status === "pending" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setBookingStatus(booking.id, "confirmed");
                        toast("Reserva confirmada");
                      }}
                    >
                      Confirmar
                    </Button>
                  ) : null}
                  {booking.status === "confirmed" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setBookingStatus(booking.id, "completed");
                          toast(
                            booking.payStatus === "pending"
                              ? "Concluída. Pagamento segue pendente."
                              : "Atendimento concluído",
                          );
                        }}
                      >
                        Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="line"
                        onClick={() => {
                          setBookingStatus(booking.id, "no_show");
                          toast("Marcada como falta");
                        }}
                      >
                        Falta
                      </Button>
                    </>
                  ) : null}
                  {booking.payStatus === "pending" && booking.status !== "cancelled" ? (
                    <>
                      <Button size="sm" variant="line" onClick={() => pay(booking.id, "pix")}>
                        Receber Pix
                      </Button>
                      <Button size="sm" variant="line" onClick={() => pay(booking.id, "card")}>
                        Receber cartão
                      </Button>
                      <Button size="sm" variant="line" onClick={() => pay(booking.id, "shop")}>
                        Receber na cadeira
                      </Button>
                    </>
                  ) : null}
                  {booking.status !== "cancelled" && booking.status !== "completed" ? (
                    <Button size="sm" variant="danger" onClick={() => setCancelId(booking.id)}>
                      Cancelar
                    </Button>
                  ) : null}
                </div>

                {cancelId === booking.id ? (
                  <div className="rounded-3xl border border-line bg-surface p-4">
                    <p className="text-sm text-fg">
                      {wasPaid
                        ? "Cancelar e estornar o pagamento simulado?"
                        : "Cancelar esta reserva?"}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          cancelBooking(booking.id);
                          setCancelId(null);
                          toast(wasPaid ? "Reserva cancelada e pagamento estornado." : "Reserva cancelada.");
                        }}
                      >
                        Confirmar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setCancelId(null)}>
                        Voltar
                      </Button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );

  function pay(id: string, method: PayMethod) {
    registerPayment(id, method, method === "card" ? { last4: "4242", brand: "Visa" } : undefined);
    toast(`Pagamento registrado · ${METHOD_LABEL[method]}`);
  }
}
