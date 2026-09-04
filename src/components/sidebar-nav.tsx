"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/app", label: "Resumen" },
  { href: "/app/incidencias", label: "Incidencias" },
  { href: "/app/comunidades", label: "Comunidades" },
  { href: "/app/residentes", label: "Residentes" },
  { href: "/app/bandeja", label: "Bandeja" },
  { href: "/app/configuracion", label: "Configuración" },
];

export function SidebarNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1">
      {ITEMS.map((it) => {
        const active = it.href === "/app" ? pathname === "/app" : pathname.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className="atlas-nav-link" data-active={active}>
            <span className="atlas-nav-dot" />
            <span className="flex-1">{it.label}</span>
            {it.href === "/app/bandeja" && unread > 0 ? (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--atlas-primary)", color: "var(--atlas-on-primary)" }}>
                {unread}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
