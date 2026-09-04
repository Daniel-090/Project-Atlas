import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="atlas-eyebrow">{eyebrow}</p>
        <h1 className="atlas-title mt-1.5">{title}</h1>
        {subtitle ? <p className="atlas-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    abierta: { label: "Abierta", style: { background: "var(--atlas-primary-soft)", color: "var(--atlas-text)" } },
    en_curso: { label: "En curso", style: { background: "var(--atlas-secondary-soft)", color: "var(--atlas-text)" } },
    resuelta: { label: "Resuelta", style: { background: "var(--atlas-surface-soft)", color: "var(--atlas-text-secondary)" } },
  };
  const s = map[status] ?? map.abierta;
  return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={s.style}>
      {s.label}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: string }) {
  const label = priority === "alta" ? "Alta" : priority === "baja" ? "Baja" : "Media";
  const dot = priority === "alta" ? "var(--atlas-primary)" : priority === "baja" ? "var(--atlas-border)" : "var(--atlas-secondary)";
  return (
    <span className="atlas-chip">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
      {label}
    </span>
  );
}

export function ChannelChip({ channel }: { channel: string }) {
  const icon = channel === "email" ? "✉" : channel === "whatsapp" ? "◉" : "☏";
  const label = channel === "email" ? "Email" : channel === "whatsapp" ? "WhatsApp" : "Llamada";
  return (
    <span className="atlas-chip atlas-chip-primary">
      <span aria-hidden>{icon}</span> {label}
    </span>
  );
}

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}
