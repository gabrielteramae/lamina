import { durationLabel } from "@/lib/shop/schedule";
import { formatMoney } from "@/lib/shop/format";
import type { Service } from "@/lib/shop/types";

export function ServiceList({ services }: { services: Service[] }) {
  const visible = services.filter((s) => s.active);
  if (visible.length === 0) {
    return <p className="text-muted">Nenhum serviço disponível no momento.</p>;
  }
  return (
    <ul className="divide-y divide-line border-y border-line">
      {visible.map((service) => (
        <li key={service.id} className="flex items-baseline justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="text-fg">{service.name}</p>
            <p className="text-sm text-muted">
              {service.detail} · {durationLabel(service.minutes)}
            </p>
          </div>
          <p className="shrink-0 font-display text-xl tabular-nums text-fg">
            {formatMoney(service.priceCents)}
          </p>
        </li>
      ))}
    </ul>
  );
}
