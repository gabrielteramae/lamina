import { Link, createFileRoute } from "@tanstack/react-router";
import { ServiceList } from "@/components/site/service-list";
import { SiteShell } from "@/components/site/shell";
import { btnClass } from "@/components/ui/button";
import { SHOP } from "@/lib/shop/catalog";
import { formatDayLong } from "@/lib/shop/format";
import { WEEKDAYS } from "@/lib/shop/labels";
import { firstOpening } from "@/lib/shop/schedule";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Lâmina — barbearia em Pinheiros" }],
  }),
  component: Home,
});

function Home() {
  const services = useShop((s) => s.services);
  const barbers = useShop((s) => s.barbers);
  const hours = useShop((s) => s.hours);
  const bookings = useShop((s) => s.bookings);
  const slotMinutes = useShop((s) => s.slotMinutes);
  const hydrated = useShop((s) => s.hydrated);
  const corte = services.find((s) => s.id === "corte" && s.active) ?? services.find((s) => s.active);
  const opening =
    hydrated && corte
      ? firstOpening({
          hours,
          slotMinutes,
          bookings,
          barbers,
          service: corte,
          now: new Date(),
        })
      : null;

  return (
    <SiteShell>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-7">
            <p className="text-sm text-muted">
              {SHOP.neighborhood}, {SHOP.city}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight text-fg md:text-6xl">
              Hora marcada. Corte certo.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Escolha serviço, profissional e horário. Feche com Pix, cartão ou pague só quando sentar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/agendar" className={btnClass()}>
                Agendar
              </Link>
              <Link to="/servicos" className={btnClass("line")}>
                Ver serviços
              </Link>
            </div>
          </div>
          <aside className="rounded-3xl border border-line bg-surface p-4 md:col-span-5">
            <p className="text-sm text-muted">Próximo horário livre</p>
            {!hydrated ? (
              <p className="mt-4 text-fg">Consultando a agenda…</p>
            ) : opening && corte ? (
              <>
                <p className="mt-3 font-display text-4xl tabular-nums text-fg">{opening.time}</p>
                <p className="mt-1 capitalize text-muted">{formatDayLong(opening.date)}</p>
                <p className="mt-1 text-sm text-faint">{corte.name} · qualquer profissional</p>
                <Link to="/agendar" search={{ servico: corte.id }} className={btnClass("solid", "md", "mt-6")}>
                  Agendar {corte.name.toLowerCase()}
                </Link>
              </>
            ) : (
              <p className="mt-4 text-fg">Agenda cheia nos próximos dias.</p>
            )}
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-fg">Carta</h2>
          <Link to="/servicos" className="text-sm text-muted hover:text-fg">
            Detalhes
          </Link>
        </div>
        <ServiceList services={services} />
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-display text-3xl text-fg">Quem atende</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {barbers
                .filter((b) => b.active)
                .map((barber) => (
                  <li key={barber.id} className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4">
                    <span className="flex size-11 items-center justify-center rounded-lg border border-line font-display text-lg">
                      {barber.name.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-fg">{barber.name}</span>
                      <span className="block text-sm text-muted">{barber.role}</span>
                    </span>
                  </li>
                ))}
            </ul>
            <a href={SHOP.maps} className="mt-6 inline-flex text-sm text-fg underline-offset-4 hover:underline">
              {SHOP.address} · {SHOP.neighborhood}
            </a>
          </div>
          <div className="md:col-span-5">
            <h2 className="font-display text-3xl text-fg">Expediente</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {WEEKDAYS.map((day) => {
                const row = hours.find((h) => h.day === day.day);
                return (
                  <li key={day.day} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="text-muted">{day.long}</span>
                    <span className="tabular-nums text-fg">
                      {!row || row.closed ? "Fechado" : `${row.open}–${row.close}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

