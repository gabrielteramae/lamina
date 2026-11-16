import { createFileRoute } from "@tanstack/react-router";
import { Wizard } from "@/components/booking/wizard";
import { SiteShell } from "@/components/site/shell";

type AgendarSearch = { servico?: string };

export const Route = createFileRoute("/agendar")({
  validateSearch: (search: Record<string, unknown>): AgendarSearch => ({
    servico: typeof search.servico === "string" ? search.servico : undefined,
  }),
  head: () => ({ meta: [{ title: "Agendar — Lâmina" }] }),
  component: AgendarPage,
});

function AgendarPage() {
  const { servico } = Route.useSearch();
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <p className="text-sm text-muted">Agendamento</p>
        <h1 className="mt-2 font-display text-4xl text-fg md:text-5xl">Marque seu horário</h1>
        <div className="mt-8">
          <Wizard initialServiceId={servico} />
        </div>
      </div>
    </SiteShell>
  );
}
