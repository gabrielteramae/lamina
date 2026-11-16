import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { formatMoney } from "@/lib/shop/format";
import { METHOD_LABEL } from "@/lib/shop/labels";
import { groupCard, maskExpiry, pixPayload, validateCard } from "@/lib/shop/pay";
import { useShop } from "@/lib/shop/store";
import type { Booking } from "@/lib/shop/types";

export function PixSlip({ code, cents }: { code: string; cents: number }) {
  const payload = pixPayload(code, cents);
  return (
    <div className="rounded-3xl border border-dashed border-line bg-bg p-4">
      <p className="text-sm text-muted">Cobrança Pix · simulação</p>
      <p className="mt-2 font-display text-4xl tabular-nums text-fg">{formatMoney(cents)}</p>
      <p className="mt-1 text-sm text-muted">Lâmina Barbearia · {code}</p>
      <p className="mt-4 break-all font-mono text-xs leading-relaxed text-faint">{payload}</p>
      <button
        type="button"
        className="mt-3 text-sm text-fg underline-offset-4 hover:underline"
        onClick={() => {
          void navigator.clipboard?.writeText(payload).then(
            () => toast("Código copiado"),
            () => toast("Não foi possível copiar"),
          );
        }}
      >
        Copiar código
      </button>
    </div>
  );
}

export function CardFields({
  number,
  name,
  expiry,
  cvv,
  onNumber,
  onName,
  onExpiry,
  onCvv,
  error,
}: {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  onNumber: (v: string) => void;
  onName: (v: string) => void;
  onExpiry: (v: string) => void;
  onCvv: (v: string) => void;
  error?: string | null;
}) {
  return (
    <div className="grid gap-4">
      <Field label="Número do cartão" error={error ?? undefined}>
        <TextInput
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={number}
          onChange={(e) => onNumber(groupCard(e.target.value))}
        />
      </Field>
      <Field label="Nome impresso">
        <TextInput
          autoComplete="cc-name"
          placeholder="Como no cartão"
          value={name}
          onChange={(e) => onName(e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Validade">
          <TextInput
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={expiry}
            onChange={(e) => onExpiry(maskExpiry(e.target.value))}
          />
        </Field>
        <Field label="CVV">
          <TextInput
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={cvv}
            onChange={(e) => onCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </Field>
      </div>
      <p className="text-sm text-faint">
        Teste: 4242 4242 4242 4242 aprova. 4000 0000 0000 0002 é recusado. Nada é cobrado.
      </p>
    </div>
  );
}

export function SettlePayment({ booking }: { booking: Booking }) {
  const registerPayment = useShop((s) => s.registerPayment);
  const [mode, setMode] = useState<"pix" | "card">(booking.payMethod === "card" ? "card" : "pix");
  const [number, setNumber] = useState("");
  const [name, setName] = useState(booking.customerName);
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (booking.payStatus === "paid") {
    const tail =
      booking.payMethod === "card" && booking.cardLast4
        ? ` · ${booking.cardBrand ?? "Cartão"} final ${booking.cardLast4}`
        : "";
    return (
      <p className="text-sm text-ok">
        Pago com {METHOD_LABEL[booking.payMethod]}
        {tail}
      </p>
    );
  }
  if (booking.payStatus === "refunded" || booking.status === "cancelled") {
    return <p className="text-sm text-muted">Pagamento estornado nesta simulação.</p>;
  }

  async function confirm() {
    setError(null);
    if (mode === "pix") {
      registerPayment(booking.id, "pix");
      toast("Pix confirmado");
      return;
    }
    const check = validateCard({ number, name, expiry, cvv });
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    registerPayment(booking.id, "card", { last4: check.last4, brand: check.brand });
    setBusy(false);
    toast("Cartão aprovado");
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={mode === "pix" ? "solid" : "line"} onClick={() => setMode("pix")}>
          Pix
        </Button>
        <Button size="sm" variant={mode === "card" ? "solid" : "line"} onClick={() => setMode("card")}>
          Cartão
        </Button>
      </div>
      {mode === "pix" ? <PixSlip code={booking.code} cents={booking.priceCents} /> : null}
      {mode === "card" ? (
        <CardFields
          number={number}
          name={name}
          expiry={expiry}
          cvv={cvv}
          onNumber={setNumber}
          onName={setName}
          onExpiry={setExpiry}
          onCvv={setCvv}
          error={error}
        />
      ) : null}
      <Button onClick={() => void confirm()} disabled={busy}>
        {busy ? "Processando…" : `Confirmar ${formatMoney(booking.priceCents)}`}
      </Button>
    </div>
  );
}
