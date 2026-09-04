import Link from "next/link";
import type { ReactNode } from "react";
import { AtlasMark, PublicThemeToggle } from "@/components/ui";

export function PublicShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="atlas-hero-bg flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <AtlasMark size={36} />
          <span className="text-sm font-semibold tracking-[0.3em] text-primary">ATLAS</span>
        </Link>
        <PublicThemeToggle />
      </header>
      <section className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:px-6">
        <div className={`atlas-card w-full ${wide ? "max-w-2xl" : "max-w-md"} p-7 sm:p-9`} style={{ boxShadow: "var(--atlas-shadow)" }}>
          <p className="atlas-eyebrow">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-muted">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-7 border-t border-border pt-5 text-center text-xs text-muted">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
