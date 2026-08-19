import { companyConfig } from "@/config/company";

const TZ = companyConfig.timezone;

function build(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-MX", { timeZone: TZ, ...options });
}

const dateFmt = build({ day: "2-digit", month: "short", year: "numeric" });
const dateTimeFmt = build({
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fecha corta en la zona horaria de la empresa. */
export function formatDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? dateFmt.format(d) : "—";
}

/** Fecha y hora en la zona horaria de la empresa. */
export function formatDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? dateTimeFmt.format(d) : "—";
}

/** Días transcurridos desde la fecha dada hasta hoy. */
export function daysSince(value: string | Date | null | undefined): number | null {
  const d = toDate(value);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

/** Formato relativo simple, ej. "hace 3 días". */
export function formatRelative(value: string | Date | null | undefined): string {
  const days = daysSince(value);
  if (days === null) return "—";
  if (days <= 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}

export function formatPercent(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

/** Convierte una fecha a valor para <input type="date"> en la zona de la empresa. */
export function toDateInputValue(value: string | Date = new Date()): string {
  const d = toDate(value) ?? new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return parts;
}
