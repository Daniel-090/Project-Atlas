"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { getVertical, type VerticalKey } from "@/verticals";

export function SidebarNav({ vertical, unread: initial }: { vertical: VerticalKey; unread: number }) {
  const pathname = usePathname();
  const unread = useUnreadCount(initial);
  const ITEMS = getVertical(vertical).nav;

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
      {ITEMS.map((it) => {
        const active =
          it.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(it.href);

        return (
          <Link
            key={it.href}
            href={it.href}
            className="atlas-nav-link shrink-0 whitespace-nowrap"
            data-active={active}
          >
            <span className="atlas-nav-dot" />
            <span>{it.label}</span>

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
    </nav>
  );
}
