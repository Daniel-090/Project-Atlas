import type { ReactNode } from "react";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireGestor } from "@/lib/session";
import { buildThemeVars, themeVarsToStyle } from "@/lib/theme";
import { SidebarNav } from "@/components/sidebar-nav";
import { logout } from "@/app/actions/auth";
import { CompanyBadge } from "@/components/company-badge";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user, company } = await requireGestor();
  const vars = buildThemeVars(company);
  const [{ value: unread }] = await db
    .select({ value: count() })
    .from(messages)
    .where(and(eq(messages.companyId, company.id), eq(messages.isRead, false)));

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ ...themeVarsToStyle(vars), colorScheme: vars["--atlas-scheme"] as "light" | "dark" }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
          <CompanyBadge name={company.name} logoUrl={company.logoUrl} code={company.code} />
          <div className="mt-8 flex-1">
            <SidebarNav unread={unread} />
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
          <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 lg:hidden">
            <CompanyBadge name={company.name} logoUrl={company.logoUrl} code={company.code} compact />
            <form action={logout}>
              <button className="atlas-btn atlas-btn-secondary !py-2 text-xs">Salir</button>
            </form>
          </header>
          <div className="border-b border-border px-4 py-2 lg:hidden">
            <SidebarNav unread={unread} />
          </div>
          <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
