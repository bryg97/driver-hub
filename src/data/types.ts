export type BgcStatus =
  | "pendiente"
  | "en_revision"
  | "aprobado"
  | "rechazado"
  | "cancelado";

export type AccountStatus = "activa" | "inactiva" | "suspendida" | "no_creada";

export type OnboardingStage =
  | "registrado"
  | "contactado"
  | "app_instalada"
  | "cuenta_validada"
  | "primer_viaje"
  | "seguimiento_activo"
  | "rescate"
  | "baja";

export interface Vehicle {
  make: string;
  model: string;
  plates: string;
  color: string;
  year: number;
}

export interface Driver {
  id: string;
  curp: string;
  driverCallsign: string;
  name: string;
  surname: string;
  email: string;
  mobile: string;
  city: string;
  company: string;
  bgcStatus: BgcStatus;
  accountStatus: AccountStatus;
  completedTrip: boolean;
  dateLastTrip: string | null;
  firstSeenAt: string;
  fechaRegistroReal: string;
  vehicle: Vehicle;
  onboardingStage: OnboardingStage;
  assignedAgentId: string;
  tripsCompleted: number;
  tripsRejected: number;
}

export type ContactChannel = "llamada" | "whatsapp" | "presencial" | "correo";

export type ContactResult =
  | "contactado_exitoso"
  | "no_contesta"
  | "buzon_voz"
  | "numero_equivocado"
  | "rechazo_seguir";

export interface ContactLog {
  id: string;
  driverId: string;
  agentId: string;
  fecha: string;
  canal: ContactChannel;
  resultado: ContactResult;
  comentario?: string;
}

export type AlertType = "sin_abordar" | "rescate" | "riesgo_baja";

export interface Alert {
  id: string;
  driverId: string;
  tipo: AlertType;
  diasUmbral: number;
  triggeredAt: string;
  status: "abierta" | "resuelta";
}

export type AgentRole = "admin" | "agente";

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
}

export interface ChangeHistoryEntry {
  id: string;
  driverId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
  source: "sync_uber" | "agente";
}

export interface AlertThresholds {
  sin_abordar: number;
  rescate: number;
  riesgo_baja: number;
}
