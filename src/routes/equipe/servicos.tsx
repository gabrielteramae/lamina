import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { formatMoney, parseReais } from "@/lib/shop/format";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/equipe/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Lâmina" }] }),
  component: ServicosEquipePage,
});

function ServicosEquipePage() {
  const hydrated = useShop((s) => s.hydrated);
  const services = useShop((s) => s.services);
  const updateService = useShop((s) => s.updateService);
  const addService = useShop((s) => s.addService);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [price, setPrice] = useState("70");

  if (!hydrated) return <p className="text-muted">Abrindo os serviços…</p>;

  return (
    <div>
      <h1 className="font-display text-4xl text-fg">Serviços</h1>
      <p className="mt-3 text-sm text-muted">Preço e duração valem para reservas novas. As antigas guardam o valor da época.</p>

      <ul className="mt-8 grid gap-4">
        {services.map((service) => (
          <li key={service.id} className="grid gap-3 rounded-3xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-fg">{service.name}</p>
                <p className="text-sm text-muted">{service.detail}</p>
              </div>
              <p className="font-display text-xl tabular-nums">{formatMoney(service.priceCents)}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Minutos">
                <TextInput
                  inputMode="numeric"
                  defaultValue={String(service.minutes)}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n) || n < 10 || n > 240) return;
                    updateService(service.id, { minutes: Math.round(n) });
                  }}
                />
              </Field>
              <Field label="Preço (R$)">
                <TextInput
                  inputMode="decimal"
                  defaultValue={(service.priceCents / 100).toFixed(2).replace(".", ",")}
                  onBlur={(e) => {
                    const cents = parseReais(e.target.value);
                    if (cents == null) return;
                    updateService(service.id, { priceCents: cents });
                  }}
                />
              </Field>
              <div className="flex items-end">
                <Button
                  variant={service.active ? "line" : "solid"}
                  className="w-full"
                  onClick={() => updateService(service.id, { active: !service.active })}
                >
                  {service.active ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form
        className="mt-10 grid gap-4 rounded-3xl border border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const cents = parseReais(price);
          const mins = Number(minutes);
          if (name.trim().length < 2 || !detail.trim() || cents == null || mins < 10 || mins > 240) {
            toast("Preencha nome, detalhe, duração e preço.");
            return;
          }
          addService({
            name: name.trim(),
            detail: detail.trim(),
            minutes: Math.round(mins),
            priceCents: cents,
          });
          setName("");
          setDetail("");
          setMinutes("30");
          setPrice("70");
          toast("Serviço adicionado");
        }}
      >
        <h2 className="font-display text-2xl text-fg">Novo serviço</h2>
        <Field label="Nome">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Detalhe">
          <TextInput value={detail} onChange={(e) => setDetail(e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Minutos">
            <TextInput inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </Field>
          <Field label="Preço (R$)">
            <TextInput inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
        </div>
        <Button type="submit">Adicionar</Button>
      </form>
    </div>
  );
}
