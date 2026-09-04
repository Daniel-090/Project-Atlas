import Link from "next/link";
import type { ReactNode } from "react";
import { requireResident } from "@/lib/session";
import { buildThemeVars, themeVarsToStyle } from "@/lib/theme";
import { logoutResident } from "@/app/actions/auth";
import { CompanyBadge } from "@/components/company-badge";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { resident, community, company } = await requireResident();
  const vars = buildThemeVars(company);
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ ...themeVarsToStyle(vars), colorScheme: vars["--atlas-scheme"] as "light" | "dark" }}>
      <header className="border-b border-border bg-sidebar">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/vecino/portal">
            <CompanyBadge name={company.name} logoUrl={company.logoUrl} code={community.name} />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {resident.name}
              {resident.unit ? ` · ${resident.unit}` : ""}
            </span>
            <form action={logoutResident}>
              <button className="atlas-btn atlas-btn-secondary !py-2 text-xs">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
