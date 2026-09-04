// Motor de personalización por gestoría (equivalente a ATLAS-MOTOR-V2).
// Deriva TODAS las superficies/textos/bordes a partir de primario, secundario,
// fondo y tema, y calcula el auto-contraste de texto sobre botones.

type RGB = [number, number, number];

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(input: string | null | undefined, fallback: string): string {
  if (!input) return fallback;
  const m = input.trim().match(HEX_RE);
  if (!m) return fallback;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `#${h.toLowerCase()}`;
}

function hexToRgb(hex: string): RGB {
  const h = normalizeHex(hex, "#000000").slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

export function atlasLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Mezcla `a` con `b` en proporción `t` (0 → a, 1 → b). */
export function atlasMix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
}

export function onColor(hex: string): string {
  return atlasLuminance(hex) > 0.35 ? "#111111" : "#ffffff";
}

export interface ThemeInput {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  theme: string; // light | dark
}

export interface ThemeVars {
  [key: `--atlas-${string}`]: string;
}

export function buildThemeVars(input: ThemeInput): ThemeVars {
  const primary = normalizeHex(input.primaryColor, "#c9a227");
  const secondary = normalizeHex(input.secondaryColor, "#1f2937");
  const bgRaw = normalizeHex(input.backgroundColor, input.theme === "dark" ? "#0f1115" : "#f6f7f9");

  // El tema elegido manda; si el fondo es oscuro, la UI es oscura aunque el tema sea "light".
  const effectiveDark = input.theme === "dark" || atlasLuminance(bgRaw) < 0.2;
  const white = "#ffffff";
  const black = "#000000";

  const background = bgRaw;
  const surface = effectiveDark ? atlasMix(background, white, 0.06) : atlasMix(background, white, 0.85);
  const surfaceSoft = effectiveDark ? atlasMix(background, white, 0.1) : atlasMix(background, black, 0.03);
  const text = effectiveDark ? atlasMix(white, background, 0.05) : atlasMix(black, background, 0.12);
  const textSecondary = effectiveDark ? atlasMix(white, background, 0.4) : atlasMix(black, background, 0.5);
  const border = effectiveDark ? atlasMix(background, white, 0.16) : atlasMix(background, black, 0.1);
  const primaryHover = effectiveDark ? atlasMix(primary, white, 0.12) : atlasMix(primary, black, 0.12);
  const primarySoft = atlasMix(surface, primary, effectiveDark ? 0.22 : 0.12);
  const secondarySoft = atlasMix(surface, secondary, effectiveDark ? 0.22 : 0.12);
  const sidebar = effectiveDark ? atlasMix(background, black, 0.25) : atlasMix(background, secondary, 0.04);

  return {
    "--atlas-primary": primary,
    "--atlas-primary-hover": primaryHover,
    "--atlas-on-primary": onColor(primary),
    "--atlas-secondary": secondary,
    "--atlas-on-secondary": onColor(secondary),
    "--atlas-background": background,
    "--atlas-surface": surface,
    "--atlas-surface-soft": surfaceSoft,
    "--atlas-sidebar": sidebar,
    "--atlas-text": text,
    "--atlas-text-secondary": textSecondary,
    "--atlas-border": border,
    "--atlas-primary-soft": primarySoft,
    "--atlas-secondary-soft": secondarySoft,
    "--atlas-scheme": effectiveDark ? "dark" : "light",
  };
}

export function themeVarsToStyle(vars: ThemeVars): React.CSSProperties {
  return vars as unknown as React.CSSProperties;
}
