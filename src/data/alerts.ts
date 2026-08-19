import type { Alert, AlertThresholds } from "./types";
import { drivers } from "./drivers";
import { daysSince } from "@/lib/datetime";

export const defaultThresholds: AlertThresholds = {
  sin_abordar: 3,
  rescate: 10,
  riesgo_baja: 21,
};

function build(): Alert[] {
  const list: Alert[] = [];
  let n = 0;
  drivers.forEach((d) => {
    const desdeRegistro = daysSince(d.fechaRegistroReal) ?? 0;
    const desdeUltimoViaje = daysSince(d.dateLastTrip);

    if (d.onboardingStage === "registrado" && desdeRegistro >= defaultThresholds.sin_abordar) {
      n++;
      list.push({
        id: `ALT-${String(n).padStart(4, "0")}`,
        driverId: d.id,
        tipo: "sin_abordar",
        diasUmbral: defaultThresholds.sin_abordar,
        triggeredAt: new Date(
          new Date(d.fechaRegistroReal).getTime() + defaultThresholds.sin_abordar * 86_400_000,
        ).toISOString(),
        status: "abierta",
      });
    }

    if (d.onboardingStage === "rescate") {
      n++;
      list.push({
        id: `ALT-${String(n).padStart(4, "0")}`,
        driverId: d.id,
        tipo: "rescate",
        diasUmbral: defaultThresholds.rescate,
        triggeredAt: new Date(Date.now() - (desdeUltimoViaje ?? 12) * 43_200_000).toISOString(),
        status: "abierta",
      });
    }

    if (
      (d.onboardingStage === "cuenta_validada" || d.onboardingStage === "app_instalada") &&
      desdeRegistro >= defaultThresholds.riesgo_baja
    ) {
      n++;
      list.push({
        id: `ALT-${String(n).padStart(4, "0")}`,
        driverId: d.id,
        tipo: "riesgo_baja",
        diasUmbral: defaultThresholds.riesgo_baja,
        triggeredAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
        status: "abierta",
      });
    }

    if (d.onboardingStage === "seguimiento_activo" && d.tripsCompleted > 100) {
      n++;
      list.push({
        id: `ALT-${String(n).padStart(4, "0")}`,
        driverId: d.id,
        tipo: "rescate",
        diasUmbral: defaultThresholds.rescate,
        triggeredAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
        status: "resuelta",
      });
    }
  });
  return list;
}

export const alerts: Alert[] = build();
