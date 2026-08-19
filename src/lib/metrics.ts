import type { Alert, ContactLog, Driver, OnboardingStage } from "@/data/types";
import { funnelStages, stageOrder } from "@/data/labels";

const DAY = 86_400_000;

/** Días estimados entre el registro y el primer viaje del conductor. */
export function daysToFirstTrip(driver: Driver): number | null {
  if (!driver.completedTrip || !driver.dateLastTrip) return null;
  const registro = new Date(driver.fechaRegistroReal).getTime();
  const last = new Date(driver.dateLastTrip).getTime();
  const span = (last - registro) / DAY;
  if (span <= 0) return null;
  // Aproximación: el primer viaje ocurre al inicio del periodo de actividad.
  const estimated = driver.tripsCompleted > 10 ? span * 0.25 : span * 0.6;
  return Math.max(1, Math.round(estimated));
}

export function averageDaysToFirstTrip(drivers: Driver[]): number | null {
  const values = drivers.map(daysToFirstTrip).filter((v): v is number => v !== null);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

const reachedIndex = (stage: OnboardingStage): number => {
  if (stage === "baja") return 0;
  if (stage === "rescate") return stageOrder.indexOf("primer_viaje");
  const idx = stageOrder.indexOf(stage);
  return idx < 0 ? 0 : idx;
};

export interface FunnelStep {
  stage: OnboardingStage;
  count: number;
  conversion: number;
  dropoff: number;
}

export function buildFunnel(drivers: Driver[]): FunnelStep[] {
  const counts = funnelStages.map(
    (stage) => drivers.filter((d) => reachedIndex(d.onboardingStage) >= funnelStages.indexOf(stage)).length,
  );
  return funnelStages.map((stage, i) => {
    const count = counts[i] ?? 0;
    const prev = i === 0 ? count : (counts[i - 1] ?? 0);
    return {
      stage,
      count,
      conversion: counts[0] ? (count / counts[0]) * 100 : 0,
      dropoff: prev ? ((prev - count) / prev) * 100 : 0,
    };
  });
}

export interface AgentStats {
  agentId: string;
  assigned: number;
  openAlerts: number;
  contacts: number;
  byChannel: Record<string, number>;
  successRate: number;
  activationRate: number;
  avgDaysToFirstTrip: number | null;
  rescueSuccessRate: number;
}

export function buildAgentStats(
  agentId: string,
  drivers: Driver[],
  logs: ContactLog[],
  alerts: Alert[],
): AgentStats {
  const mine = drivers.filter((d) => d.assignedAgentId === agentId);
  const myIds = new Set(mine.map((d) => d.id));
  const myLogs = logs.filter((l) => l.agentId === agentId);
  const byChannel = myLogs.reduce<Record<string, number>>((acc, l) => {
    acc[l.canal] = (acc[l.canal] ?? 0) + 1;
    return acc;
  }, {});
  const success = myLogs.filter((l) => l.resultado === "contactado_exitoso").length;
  const activated = mine.filter((d) => d.completedTrip).length;
  const rescues = mine.filter((d) => d.onboardingStage === "rescate");
  const rescued = rescues.filter((d) => d.tripsCompleted > 0).length;

  return {
    agentId,
    assigned: mine.length,
    openAlerts: alerts.filter((a) => a.status === "abierta" && myIds.has(a.driverId)).length,
    contacts: myLogs.length,
    byChannel,
    successRate: myLogs.length ? (success / myLogs.length) * 100 : 0,
    activationRate: mine.length ? (activated / mine.length) * 100 : 0,
    avgDaysToFirstTrip: averageDaysToFirstTrip(mine),
    rescueSuccessRate: rescues.length ? (rescued / rescues.length) * 100 : 0,
  };
}

export function pct(part: number, total: number): number {
  return total ? (part / total) * 100 : 0;
}
