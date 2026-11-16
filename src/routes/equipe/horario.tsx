import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button, chipClass } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { buildSeedBookings } from "@/lib/shop/seed";
import { WEEKDAYS } from "@/lib/shop/labels";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/equipe/horario")({
  head: () => ({ meta: [{ title: "Expediente — Lâmina" }] }),
  component: HorarioPage,
});

function HorarioPage() {
  const hydrated = useShop((s) => s.hydrated);
  const hours = useShop((s) => s.hours);
  const barbers = useShop((s) => s.barbers);
  const slotMinutes = useShop((s) => s.slotMinutes);
  const updateHours = useShop((s) => s.updateHours);
  const updateBarber = useShop((s) => s.updateBarber);
  const setSlotMinutes = useShop((s) => s.setSlotMinutes);
  const resetDemo = useShop((s) => s.resetDemo);
  const [arm, setArm] = useState(false);

  if (!hydrated) return <p className="text-muted">Abrindo o expediente…</p>;

  return (
    <div>
      <h1 className="font-display text-4xl text-fg">Expediente</h1>
      <p className="mt-3 text-sm text-muted">Segunda fica fechada na amostra. O intervalo define os horários oferecidos.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[15, 30, 45].map((n) => (
          <button key={n} type="button" className={chipClass(slotMinutes === n)} onClick={() => setSlotMinutes(n)}>
            A cada {n} min
          </button>
        ))}
      </div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {WEEKDAYS.map((day) => {
          const row = hours.find((h) => h.day === day.day);
          if (!row) return null;
          return (
            <li key={day.day} className="grid items-center gap-3 py-4 sm:grid-cols-[8rem_1fr_1fr_auto]">
              <p className="text-fg">{day.long}</p>
              <Field label="Abre">
                <TextInput
                  type="time"
                  value={row.open}
                  disabled={row.closed}
                  onChange={(e) => updateHours(day.day, { open: e.target.value })}
                />
              </Field>
              <Field label="Fecha">
                <TextInput
                  type="time"
                  value={row.close}
                  disabled={row.closed}
                  onChange={(e) => updateHours(day.day, { close: e.target.value })}
                />
              </Field>
              <Button
                variant={row.closed ? "solid" : "line"}
                onClick={() => updateHours(day.day, { closed: !row.closed })}
              >
                {row.closed ? "Fechado" : "Aberto"}
              </Button>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-12 font-display text-2xl text-fg">Profissionais</h2>
      <ul className="mt-4 grid gap-4">
        {barbers.map((barber) => (
          <li key={barber.id} className="grid gap-3 rounded-3xl border border-line bg-surface p-4 sm:grid-cols-3">
            <Field label="Nome">
              <TextInput
                defaultValue={barber.name}
                onBlur={(e) => {
                  const name = e.target.value.trim();
                  if (name.length < 2) return;
                  updateBarber(barber.id, { name });
                }}
              />
            </Field>
            <Field label="Função">
              <TextInput
                defaultValue={barber.role}
                onBlur={(e) => updateBarber(barber.id, { role: e.target.value.trim() || barber.role })}
              />
            </Field>
            <div className="flex items-end">
              <Button
                className="w-full"
                variant={barber.active ? "line" : "solid"}
                onClick={() => updateBarber(barber.id, { active: !barber.active })}
              >
                {barber.active ? "Na agenda" : "Fora da agenda"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12">
        {arm ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              onClick={() => {
                resetDemo(buildSeedBookings(new Date()));
                setArm(false);
                toast("Exemplo restaurado");
              }}
            >
              Restaurar agora
            </Button>
            <Button variant="ghost" onClick={() => setArm(false)}>
              Voltar
            </Button>
          </div>
        ) : (
          <Button variant="line" onClick={() => setArm(true)}>
            Restaurar dados de exemplo
          </Button>
        )}
      </div>
    </div>
  );
}
