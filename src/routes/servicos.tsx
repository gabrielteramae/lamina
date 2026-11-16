import { Link, createFileRoute } from "@tanstack/react-router";
import { ServiceList } from "@/components/site/service-list";
import { SiteShell } from "@/components/site/shell";
import { btnClass } from "@/components/ui/button";
import { useShop } from "@/lib/shop/store";

export const Route = createFileRoute("/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Lâmina" }] }),
  component: ServicosPage,
});

function ServicosPage() {
  const services = useShop((s) => s.services);
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-sm text-muted">Carta</p>
        <h1 className="mt-2 font-display text-4xl text-fg md:text-5xl">Serviços</h1>
        <p className="mt-4 text-muted">
          O valor é fechado no agendamento. Pix e cartão são simulados; também dá para pagar na cadeira.
        </p>
        <div className="mt-8">
          <ServiceList services={services} />
        </div>
        <Link to="/agendar" className={btnClass("solid", "md", "mt-8")}>
          Agendar
        </Link>
      </div>
    </SiteShell>
  );
}
