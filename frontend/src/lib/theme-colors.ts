/**
 * Reads the active theme's CSS custom properties (Tailwind v4 oklch tokens)
 * and converts them to hex colors for the three.js scene materials.
 * OKLab → linear-sRGB conversion per Björn Ottosson's reference constants.
 */

export interface SceneColors {
  background: string;
  foreground: string;
  primary: string;
  surface: string;
  border: string;
  mutedForeground: string;
  isDark: boolean;
}

function srgbTransfer(value: number): number {
  return value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function toHexByte(value: number): string {
  const byte = Math.round(clamp01(value) * 255);
  return byte.toString(16).padStart(2, "0");
}

function oklchToHex(l: number, c: number, h: number): string {
  const hueRad = (h * Math.PI) / 180;
  const a = Math.cos(hueRad) * c;
  const b = Math.sin(hueRad) * c;

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L = l_ * l_ * l_;
  const M = m_ * m_ * m_;
  const S = s_ * s_ * s_;

  const r = srgbTransfer(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S);
  const g = srgbTransfer(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S);
  const bl = srgbTransfer(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S);

  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(bl)}`;
}

/** Parses any CSS color string the design system can emit into #rrggbb. */
export function cssColorToHex(value: string): string | null {
  const trimmed = value.trim();
  const oklch = /^oklch\(\s*([\d.]+)%?\s+([\d.]+)%?\s+([\d.]+)/.exec(trimmed);
  if (oklch) {
    const [, l, c, h] = oklch;
    if (l === undefined || c === undefined || h === undefined) return null;
    return oklchToHex(Number(l), Number(c), Number(h));
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(trimmed);
  if (hex) return `#${hex[1]!.toLowerCase()}`;
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(trimmed);
  if (rgb) {
    const [, r, g, b] = rgb;
    if (r === undefined || g === undefined || b === undefined) return null;
    return `#${toHexByte(Number(r) / 255)}${toHexByte(Number(g) / 255)}${toHexByte(Number(b) / 255)}`;
  }
  return null;
}

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return cssColorToHex(raw) ?? fallback;
}

export function readSceneColors(): SceneColors {
  const isDark =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  return {
    background: readVar("--background", isDark ? "#12121a" : "#f4f2ea"),
    foreground: readVar("--foreground", isDark ? "#efece2" : "#2b2924"),
    primary: readVar("--primary", isDark ? "#7f8fe0" : "#4338ca"),
    surface: readVar("--surface", isDark ? "#1d1d28" : "#eae7dc"),
    border: readVar("--border", isDark ? "#3a3a4a" : "#c9c4b4"),
    mutedForeground: readVar("--muted-foreground", isDark ? "#a8a49a" : "#6f6a5e"),
    isDark,
  };
}
