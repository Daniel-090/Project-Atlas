import type { ReactNode } from "react";
import { requireGestor } from "@/lib/session";
import { buildThemeVars, themeVarsToStyle } from "@/lib/theme";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileNav } from "@/components/mobile-nav";
import { logout } from "@/app/actions/auth";
import { CompanyBadge } from "@/components/company-badge";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user, company } = await requireGestor();
  const vars = buildThemeVars(company);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ ...themeVarsToStyle(vars), colorScheme: vars["--atlas-scheme"] as "light" | "dark" }}
    >
      <div className="mx-auto flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
          <CompanyBadge name={company.name} logoUrl={company.logoUrl} code={company.code} />
          <div className="mt-8 flex-1">
            <SidebarNav unread={0} />
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <form action={logout} className="mt-3">
              <button className="atlas-btn atlas-btn-secondary w-full !py-2 text-xs">Cerrar sesión</button>
            </form>
          </div>
        </aside>

        {/* Contenido */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="relative flex items-center justify-between gap-3 border-b border-border bg-sidebar px-4 py-3 sm:px-5 sm:py-4 lg:hidden">
            <CompanyBadge
              name={company.name}
              logoUrl={company.logoUrl}
              code={company.code}
              compact
            />

            <div className="flex items-center gap-2">
              <form action={logout}>
                <button className="atlas-btn atlas-btn-secondary !py-2 text-xs">
                  Salir
                </button>
              </form>
              <MobileNav unread={0} />
            </div>
          </header>
          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
