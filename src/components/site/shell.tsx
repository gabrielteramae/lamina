import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { btnClass } from "@/components/ui/button";
import { SHOP } from "@/lib/shop/catalog";
import { cn } from "@/lib/cn";

const LINKS = [
  { to: "/servicos", label: "Serviços" },
  { to: "/agendar", label: "Agendar" },
  { to: "/reservas", label: "Reservas" },
  { to: "/equipe", label: "Equipe" },
] as const;

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 23V9h2.2v12.2H23V23H11z" fill="currentColor" />
    </svg>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Link to="/" className="flex items-center gap-2 text-fg">
          <Mark className="size-8" />
          <span className="font-display text-2xl italic tracking-tight">Lâmina</span>
        </Link>
        <nav className="ml-6 hidden items-center gap-5 md:flex">
          {LINKS.map((link) => {
            const on = path === link.to || path.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn("text-sm", on ? "text-fg" : "text-muted hover:text-fg")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link to="/agendar" className={cn(btnClass("solid", "sm"), "ml-auto hidden md:inline-flex")}>
          Agendar
        </Link>
        <button
          type="button"
          className="ml-auto flex size-11 items-center justify-center text-fg md:hidden"
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line px-5 py-2 md:hidden">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="flex h-11 items-center text-fg">
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-2xl italic text-fg">Lâmina</p>
          <p className="mt-2 text-sm text-muted">
            {SHOP.address}
            <br />
            {SHOP.neighborhood}, {SHOP.city}
          </p>
          <a href={SHOP.phoneHref} className="mt-2 inline-flex h-11 items-center text-sm text-fg">
            {SHOP.phone}
          </a>
        </div>
        <div className="text-sm text-faint">
          <p>Pagamentos desta demonstração não cobram valor real.</p>
          <p className="mt-1">A agenda fica salva neste navegador.</p>
        </div>
      </div>
    </footer>
  );
}
