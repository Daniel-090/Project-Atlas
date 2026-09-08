"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useMemo, useState } from "react";
import { finishOnboarding } from "@/app/actions/panel";
import type { ActionState } from "@/app/actions/auth";
import { buildThemeVars, themeVarsToStyle } from "@/lib/theme";
import { Field, Notice, SubmitButton } from "@/components/ui";

const PRESETS = [
  { name: "Oro clásico", primary: "#c9a227", secondary: "#1f2937", background: "#f6f7f9", theme: "light" },
  { name: "Azul corporativo", primary: "#2563eb", secondary: "#0f172a", background: "#f5f7fb", theme: "light" },
  { name: "Verde sereno", primary: "#059669", secondary: "#134e4a", background: "#f4f8f6", theme: "light" },
  { name: "Cian nocturno", primary: "#19e3e3", secondary: "#facc15", background: "#0b1220", theme: "dark" },
  { name: "Grafito", primary: "#f59e0b", secondary: "#e5e7eb", background: "#111111", theme: "dark" },
];

export function ThemePreview({ primary, secondary, background, theme, name, logoUrl }: { primary: string; secondary: string; background: string; theme: string; name: string; logoUrl?: string }) {
  const vars = useMemo(() => buildThemeVars({ primaryColor: primary, secondaryColor: secondary, backgroundColor: background, theme }), [primary, secondary, background, theme]);
  return (
    <div className="overflow-hidden rounded-2xl border border-border" style={themeVarsToStyle(vars)}>
      <div className="flex" style={{ background: "var(--atlas-background)", color: "var(--atlas-text)" }}>
        <div className="w-28 shrink-0 p-3" style={{ background: "var(--atlas-sidebar)", borderRight: "1px solid var(--atlas-border)" }}>
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-6 w-6 rounded-md bg-white object-contain p-0.5" />
            ) : (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold" style={{ background: "var(--atlas-primary)", color: "var(--atlas-on-primary)" }}>
                {name.slice(0, 1).toUpperCase() || "A"}
              </span>
            )}
            <span className="truncate text-[10px] font-semibold">{name || "Tu gestoría"}</span>
          </div>
          <div className="mt-3 grid gap-1 text-[10px]">
            {["Resumen", "Incidencias", "Comunidades"].map((l, i) => (
              <div key={l} className="rounded-md px-2 py-1" style={i === 0 ? { background: "var(--atlas-primary-soft)" } : { color: "var(--atlas-text-secondary)" }}>
                {l}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--atlas-primary)" }}>
            Resumen
          </p>
          <p className="text-sm font-semibold">Hola, gestor</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {["Incidencias", "Comunidades"].map((l) => (
              <div key={l} className="rounded-lg p-2" style={{ background: "var(--atlas-surface)", border: "1px solid var(--atlas-border)" }}>
                <p className="text-[9px]" style={{ color: "var(--atlas-text-secondary)" }}>
                  {l}
                </p>
                <p className="text-base font-semibold">12</p>
              </div>
            ))}
          </div>
          <button type="button" className="mt-3 rounded-lg px-3 py-1.5 text-[10px] font-semibold" style={{ background: "var(--atlas-primary)", color: "var(--atlas-on-primary)" }}>
            Botón principal
          </button>
        </div>
      </div>
    </div>
  );
}

export function OnboardingWizard({ companyName }: { companyName: string }) {
  const [step, setStep] = useState(0);
  const [primary, setPrimary] = useState(PRESETS[0].primary);
  const [secondary, setSecondary] = useState(PRESETS[0].secondary);
  const [background, setBackground] = useState(PRESETS[0].background);
  const [theme, setTheme] = useState(PRESETS[0].theme);
  const [logoUrl, setLogoUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [emails, setEmails] = useState("");
  const [state, action] = useActionState<ActionState, FormData>(finishOnboarding, undefined);

  const steps = ["Colores", "Logo", "Contactos"];

  return (
    <form action={action} className="grid gap-6">
      <ol className="flex items-center gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
              style={i <= step ? { background: "var(--atlas-primary)", color: "var(--atlas-on-primary)" } : { background: "var(--atlas-surface-soft)", color: "var(--atlas-text-secondary)" }}
            >
              {i + 1}
            </span>
            <span className={i === step ? "font-semibold text-foreground" : "text-muted"}>{s}</span>
            {i < steps.length - 1 ? <span className="mx-1 h-px w-6 bg-border" /> : null}
          </li>
        ))}
      </ol>

      {/* Campos siempre presentes para que el envío final tenga todo */}
      <input type="hidden" name="primaryColor" value={primary} />
      <input type="hidden" name="secondaryColor" value={secondary} />
      <input type="hidden" name="backgroundColor" value={background} />
      <input type="hidden" name="theme" value={theme} />
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <input type="hidden" name="whatsapp" value={whatsapp} />
      <input type="hidden" name="emails" value={emails} />

      {step === 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid gap-4">
            <div>
              <span className="atlas-label">Plantillas</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setPrimary(p.primary);
                      setSecondary(p.secondary);
                      setBackground(p.background);
                      setTheme(p.theme);
                    }}
                    className="atlas-chip !py-1.5 hover:border-primary"
                  >
                    <span className="h-3 w-3 rounded-full" style={{ background: p.primary }} /> {p.name}
                  </button>
                ))}
              </div>
            </div>
            <ColorField label="Color principal" value={primary} onChange={setPrimary} />
            <ColorField label="Color secundario" value={secondary} onChange={setSecondary} />
            <ColorField label="Fondo" value={background} onChange={setBackground} />
            <div>
              <span className="atlas-label">Tema</span>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-soft p-1 text-center text-xs font-semibold">
                {(["light", "dark"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTheme(t)} className={`rounded-lg py-2 ${theme === t ? "bg-surface text-foreground" : "text-muted"}`}>
                    {t === "light" ? "Claro" : "Oscuro"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <span className="atlas-label">Vista previa en vivo</span>
            <ThemePreview primary={primary} secondary={secondary} background={background} theme={theme} name={companyName} logoUrl={logoUrl} />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <Field label="URL del logo (opcional)" hint="Enlace público a una imagen PNG/JPG/SVG. Si lo dejas vacío usaremos tus iniciales.">
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="atlas-input" placeholder="https://tu-web.es/logo.png" />
          </Field>
          <div>
            <span className="atlas-label">Vista previa</span>
            <ThemePreview primary={primary} secondary={secondary} background={background} theme={theme} name={companyName} logoUrl={logoUrl || undefined} />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp de atención" hint="Uno por línea. Los verán tus vecinos en su portal.">
            <textarea value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} rows={4} className="atlas-input" placeholder={"+34 600 000 000\n+34 611 111 111"} />
          </Field>
          <Field label="Emails de contacto" hint="Uno por línea.">
            <textarea value={emails} onChange={(e) => setEmails(e.target.value)} rows={4} className="atlas-input" placeholder={"info@gestoria.es\nincidencias@gestoria.es"} />
          </Field>
          <div className="sm:col-span-2">
            <ChipPreview items={[...splitList(whatsapp).map((v) => `◉ ${v}`), ...splitList(emails).map((v) => `✉ ${v}`)]} />
          </div>
        </div>
      ) : null}

      <Notice message={state?.error} />

      <div className="flex items-center justify-between border-t border-border pt-5">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className="atlas-btn atlas-btn-secondary" disabled={step === 0}>
          Atrás
        </button>
        {step < 2 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="atlas-btn atlas-btn-primary">
            Continuar
          </button>
        ) : (
          <SubmitButton pendingText="Preparando tu panel…">Entrar a mi panel</SubmitButton>
        )}
      </div>
    </form>
  );
}

function splitList(raw: string) {
  return raw.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
}

function ChipPreview({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span key={i} className="atlas-chip atlas-chip-primary">
          {i}
        </span>
      ))}
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="atlas-label">{label}</span>
      <span className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-transparent p-1" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="atlas-input font-mono" maxLength={7} />
      </span>
    </label>
  );
}
