import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CardFields } from "@/components/booking/pay";
import { Button, chipClass } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { formatDayChip, formatDayLong, formatMoney, formatPhone, validEmail, validPhone } from "@/lib/shop/format";
import { validateCard } from "@/lib/shop/pay";
import { availableTimes, durationLabel, openDates } from "@/lib/shop/schedule";
import { useShop } from "@/lib/shop/store";
import type { PayMethod } from "@/lib/shop/types";

const STEPS = ["Serviço", "Profissional", "Horário", "Dados", "Pagamento"];

export function Wizard({ initialServiceId }: { initialServiceId?: string }) {
  const hydrated = useShop((s) => s.hydrated);
  const services = useShop((s) => s.services);
  const barbers = useShop((s) => s.barbers);
  const hours = useShop((s) => s.hours);
  const slotMinutes = useShop((s) => s.slotMinutes);
  const bookings = useShop((s) => s.bookings);
  const book = useShop((s) => s.book);
  const navigate = useNavigate();

  const activeServices = services.filter((s) => s.active);
  const activeBarbers = barbers.filter((b) => b.active);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(
    initialServiceId && activeServices.some((s) => s.id === initialServiceId) ? initialServiceId : null,
  );
  const [barberId, setBarberId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [number, setNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const service = activeServices.find((s) => s.id === serviceId) ?? null;
  const now = new Date();
  const dates = useMemo(() => (hydrated ? openDates(hours, new Date(), 10) : []), [hydrated, hours]);
  const times = useMemo(() => {
    if (!hydrated || !service || !date) return [];
    return availableTimes({
      hours,
      slotMinutes,
      bookings,
      barbers,
      service,
      date,
      barberId,
      now: new Date(),
    });
  }, [hydrated, service, date, hours, slotMinutes, bookings, barbers, barberId]);

  if (!hydrated) {
    return <p className="text-muted">Abrindo a agenda…</p>;
  }

  function go(next: number) {
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  async function finish() {
    if (!service || !date || !time || !method) return;
    setError(null);
    let payStatus: "pending" | "paid" = method === "shop" || method === "pix" ? "pending" : "paid";
    let cardLast4: string | undefined;
    let cardBrand: string | undefined;
    if (method === "card") {
      const check = validateCard({ number, name: cardName || name, expiry, cvv });
      if (!check.ok) {
        setError(check.error);
        return;
      }
      setBusy(true);
      await new Promise((r) => setTimeout(r, 700));
      payStatus = "paid";
      cardLast4 = check.last4;
      cardBrand = check.brand;
    }
    const result = book({
      serviceId: service.id,
      barberId,
      date,
      time,
      customerName: name,
      phone,
      email,
      notes,
      payMethod: method,
      payStatus,
      cardLast4,
      cardBrand,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast(method === "card" ? "Pagamento aprovado" : "Horário reservado");
    void navigate({ to: "/reserva/$code", params: { code: result.booking.code } });
  }

  function next() {
    setError(null);
    if (step === 0 && !service) {
      setError("Escolha um serviço.");
      return;
    }
    if (step === 2 && (!date || !time)) {
      setError("Escolha o dia e o horário.");
      return;
    }
    if (step === 3) {
      if (name.trim().length < 2) {
        setError("Informe seu nome.");
        return;
      }
      if (!validPhone(phone)) {
        setError("Telefone com DDD, só números.");
        return;
      }
      if (!validEmail(email)) {
        setError("E-mail inválido.");
        return;
      }
    }
    if (step === 4) {
      if (!method) {
        setError("Escolha como pagar.");
        return;
      }
      void finish();
      return;
    }
    go(step + 1);
  }

  const barberLabel = barberId ? (activeBarbers.find((b) => b.id === barberId)?.name ?? "Profissional") : "Sem preferência";

  return (
    <div className="grid items-start gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="text-sm text-muted md:hidden">
          Passo {step + 1} de {STEPS.length} · {STEPS[step]}
        </p>
        <ol className="hidden gap-5 text-sm md:flex">
          {STEPS.map((label, i) => (
            <li key={label} className={cn("tabular-nums", i === step ? "text-fg" : "text-faint")}>
              {i + 1} {label}
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-3">
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          {step === 0
            ? activeServices.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={serviceId === item.id}
                  onClick={() => {
                    setServiceId(item.id);
                    setTime(null);
                    setError(null);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 rounded-3xl border px-4 py-4 text-left",
                    serviceId === item.id ? "border-bone bg-raised" : "border-line bg-surface",
                  )}
                >
                  <span>
                    <span className="block text-fg">{item.name}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {item.detail} · {durationLabel(item.minutes)}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-xl tabular-nums text-fg">
                    {formatMoney(item.priceCents)}
                  </span>
                </button>
              ))
            : null}

          {step === 1 ? (
            <div className="grid gap-3">
              <button
                type="button"
                aria-pressed={barberId === null}
                onClick={() => {
                  setBarberId(null);
                  setTime(null);
                }}
                className={cn(
                  "rounded-3xl border px-4 py-4 text-left",
                  barberId === null ? "border-bone bg-raised" : "border-line bg-surface",
                )}
              >
                <span className="block text-fg">Sem preferência</span>
                <span className="mt-1 block text-sm text-muted">Quem estiver livre nesse horário.</span>
              </button>
              {activeBarbers.map((barber) => (
                <button
                  key={barber.id}
                  type="button"
                  aria-pressed={barberId === barber.id}
                  onClick={() => {
                    setBarberId(barber.id);
                    setTime(null);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-3xl border px-4 py-4 text-left",
                    barberId === barber.id ? "border-bone bg-raised" : "border-line bg-surface",
                  )}
                >
                  <span className="flex size-11 items-center justify-center rounded-lg border border-line font-display text-lg">
                    {barber.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-fg">{barber.name}</span>
                    <span className="block text-sm text-muted">{barber.role}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 && service ? (
            <div className="grid gap-5">
              <div className="flex flex-wrap gap-2">
                {dates.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={date === key}
                    className={chipClass(date === key, "capitalize")}
                    onClick={() => {
                      setDate(key);
                      setTime(null);
                      setError(null);
                    }}
                  >
                    {formatDayChip(key)}
                  </button>
                ))}
              </div>
              {date ? (
                times.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {times.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={time === slot}
                        className={chipClass(time === slot, "justify-center tabular-nums")}
                        onClick={() => {
                          setTime(slot);
                          setError(null);
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Nenhum horário livre neste dia.</p>
                )
              ) : (
                <p className="text-sm text-muted">Escolha um dia aberto.</p>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              <Field label="Nome">
                <TextInput autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Telefone" hint="Com DDD">
                <TextInput
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="11987651234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                />
              </Field>
              <Field label="E-mail">
                <TextInput
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Observação" hint="Opcional">
                <TextArea value={notes} maxLength={240} onChange={(e) => setNotes(e.target.value)} />
              </Field>
            </div>
          ) : null}

          {step === 4 && service ? (
            <div className="grid gap-4">
              <p className="text-sm text-faint">Simulação. Nenhum valor é cobrado.</p>
              {(
                [
                  ["pix", "Pix", "Gera uma cobrança e você confirma na reserva."],
                  ["card", "Cartão", "Aprovação imediata, só neste navegador."],
                  ["shop", "Na cadeira", "O horário fica pendente até a equipe receber."],
                ] as const
              ).map(([id, label, detail]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={method === id}
                  onClick={() => {
                    setMethod(id);
                    setError(null);
                  }}
                  className={cn(
                    "rounded-3xl border px-4 py-4 text-left",
                    method === id ? "border-bone bg-raised" : "border-line bg-surface",
                  )}
                >
                  <span className="block text-fg">{label}</span>
                  <span className="mt-1 block text-sm text-muted">{detail}</span>
                </button>
              ))}
              {method === "card" ? (
                <CardFields
                  number={number}
                  name={cardName}
                  expiry={expiry}
                  cvv={cvv}
                  onNumber={setNumber}
                  onName={setCardName}
                  onExpiry={setExpiry}
                  onCvv={setCvv}
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex gap-3">
          {step > 0 ? (
            <Button variant="line" onClick={() => go(step - 1)} disabled={busy}>
              Voltar
            </Button>
          ) : null}
          <Button onClick={next} disabled={busy}>
            {busy
              ? "Processando…"
              : step < 4
                ? "Continuar"
                : method === "card"
                  ? `Pagar ${service ? formatMoney(service.priceCents) : ""}`
                  : method === "pix"
                    ? "Gerar Pix e reservar"
                    : method === "shop"
                      ? "Reservar"
                      : "Continuar"}
          </Button>
        </div>
      </div>

      <aside className="rounded-3xl border border-line bg-surface p-4 lg:sticky lg:top-24 lg:col-span-5">
        <p className="text-sm text-muted">Sua reserva</p>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Serviço</dt>
            <dd className="text-right text-fg">{service ? service.name : "A escolher"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Profissional</dt>
            <dd className="text-right text-fg">{step > 0 || barberId ? barberLabel : "A escolher"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Quando</dt>
            <dd className="text-right capitalize text-fg">
              {date && time ? `${formatDayLong(date)} · ${time}` : "A escolher"}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">Total</span>
          <span className="font-display text-3xl tabular-nums text-fg">
            {service ? formatMoney(service.priceCents) : "—"}
          </span>
        </div>
        {phone ? <p className="mt-3 text-sm text-faint">{formatPhone(phone)}</p> : null}
        <p className="mt-4 text-xs text-faint">Horário de referência: {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
      </aside>
    </div>
  );
}
