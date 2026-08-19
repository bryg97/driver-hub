import type {
  AccountStatus,
  AlertType,
  BgcStatus,
  ContactChannel,
  ContactResult,
  OnboardingStage,
} from "./types";

export const bgcLabels: Record<BgcStatus, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
};

export const bgcTone: Record<BgcStatus, string> = {
  pendiente: "warning",
  en_revision: "info",
  aprobado: "success",
  rechazado: "danger",
  cancelado: "neutral",
};

export const accountLabels: Record<AccountStatus, string> = {
  activa: "Activa",
  inactiva: "Inactiva",
  suspendida: "Suspendida",
  no_creada: "No creada",
};

export const stageLabels: Record<OnboardingStage, string> = {
  registrado: "Registrado",
  contactado: "Contactado",
  app_instalada: "App instalada",
  cuenta_validada: "Cuenta validada",
  primer_viaje: "Primer viaje",
  seguimiento_activo: "Seguimiento activo",
  rescate: "Rescate",
  baja: "Baja",
};

export const funnelStages: OnboardingStage[] = [
  "registrado",
  "contactado",
  "app_instalada",
  "cuenta_validada",
  "primer_viaje",
];

/** Orden de progreso para calcular avance acumulado. */
export const stageOrder: OnboardingStage[] = [
  "registrado",
  "contactado",
  "app_instalada",
  "cuenta_validada",
  "primer_viaje",
  "seguimiento_activo",
];

export const channelLabels: Record<ContactChannel, string> = {
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  presencial: "Presencial",
  correo: "Correo",
};

export const resultLabels: Record<ContactResult, string> = {
  contactado_exitoso: "Contactado exitoso",
  no_contesta: "No contesta",
  buzon_voz: "Buzón de voz",
  numero_equivocado: "Número equivocado",
  rechazo_seguir: "Rechazó seguir",
};

export const alertLabels: Record<AlertType, string> = {
  sin_abordar: "Sin abordar",
  rescate: "Rescate",
  riesgo_baja: "Riesgo de baja",
};
