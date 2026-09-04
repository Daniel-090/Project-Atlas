"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "atlas-btn atlas-btn-primary",
  pendingText = "Guardando…",
  name,
  value,
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} name={name} value={value}>
      {pending ? pendingText : children}
    </button>
  );
}

export function AtlasMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl border border-primary/50"
      style={{ width: size, height: size, background: "var(--atlas-primary-soft)" }}
      aria-hidden
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="var(--atlas-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 3 20h18L12 3Z" />
        <path d="M8.5 14.5h7" />
      </svg>
    </span>
  );
}

export function PublicThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    if (t === "light" || t === "dark") setTheme(t);
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("atlas-public-theme", next);
    } catch {
      /* ignore */
    }
  };
  return (
    <button type="button" onClick={toggle} className="atlas-btn atlas-btn-secondary !px-3 !py-2 text-xs" aria-label="Cambiar tema">
      {theme === "dark" ? "☀︎ Tema claro" : "☾ Tema oscuro"}
    </button>
  );
}

export function Notice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="atlas-alert" role="status">
      {message}
    </p>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="atlas-label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
