"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { getVertical, type VerticalKey } from "@/verticals";

export function MobileNav({ vertical, unread: initial }: { vertical: VerticalKey; unread: number }) {
  const pathname = usePathname();
  const unread = useUnreadCount(initial);
  const [open, setOpen] = useState(false);
  const ITEMS = getVertical(vertical).nav;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground"
      >
        <span className="sr-only">
          {open ? "Cerrar menú" : "Abrir menú"}
        </span>

        <span className="flex w-5 flex-col gap-1">
          <span className="block h-0.5 w-full rounded-full bg-current" />
          <span className="block h-0.5 w-full rounded-full bg-current" />
          <span className="block h-0.5 w-full rounded-full bg-current" />
        </span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 z-50 border-b border-border bg-sidebar shadow-lg">
          <nav className="mx-auto max-w-[1400px] px-4 py-3">
            <div className="grid gap-1">
              {ITEMS.map((it) => {
                const active =
                  it.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(it.href);

                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="atlas-nav-link"
                    data-active={active}
                  >
                    <span className="atlas-nav-dot" />
                    <span className="flex-1">{it.label}</span>

                    {it.href === "/app/bandeja" && unread > 0 ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: "var(--atlas-primary)",
                          color: "var(--atlas-on-primary)",
                        }}
                      >
                        {unread}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
