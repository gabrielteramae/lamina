import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/equipe", label: "Painel", exact: true },
  { to: "/equipe/agenda", label: "Agenda", exact: false },
  { to: "/equipe/pagamentos", label: "Pagamentos", exact: false },
  { to: "/equipe/servicos", label: "Serviços", exact: false },
  { to: "/equipe/horario", label: "Expediente", exact: false },
] as const;

export function EquipeFrame() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/equipe" className="font-display text-2xl italic text-fg">
            Lâmina
          </Link>
          <Link to="/" className="text-sm text-muted hover:text-fg">
            Ver o site
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-5 pb-3">
          {LINKS.map((link) => {
            const on = link.exact ? path === link.to : path.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-3 text-sm",
                  on ? "bg-bone text-ink" : "text-muted hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 pb-24">
        <Outlet />
      </div>
    </div>
  );
}
