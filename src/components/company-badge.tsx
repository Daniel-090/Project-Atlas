/* eslint-disable @next/next/no-img-element */
export function CompanyBadge({ name, logoUrl, code, compact = false }: { name: string; logoUrl: string | null; code: string; compact?: boolean }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex items-center gap-3">
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="h-10 w-10 rounded-xl border border-border object-cover" />
      ) : (
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
          style={{ background: "var(--atlas-primary)", color: "var(--atlas-on-primary)" }}
        >
          {initials || "A"}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        {!compact ? <p className="truncate font-mono text-[11px] text-muted">{code}</p> : null}
      </div>
    </div>
  );
}
