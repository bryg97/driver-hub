import type { ContactChannel, ContactLog, ContactResult } from "./types";
import { drivers } from "./drivers";

const DAY = 86_400_000;
const NOW = Date.now();

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const rng = makeRng(777);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

const canales: ContactChannel[] = ["llamada", "llamada", "whatsapp", "whatsapp", "correo", "presencial"];
const resultados: ContactResult[] = [
  "contactado_exitoso",
  "contactado_exitoso",
  "no_contesta",
  "buzon_voz",
  "numero_equivocado",
  "rechazo_seguir",
];
const comentarios = [
  "Conductor interesado, agenda cita para validación de documentos.",
  "Se le explicó el proceso de instalación de la app.",
  "Pide que le marquen después de las 6 pm.",
  "No responde desde hace varios intentos.",
  "Solicita apoyo con documentos del vehículo.",
  "Mencionó que ya trabaja con otra plataforma.",
];

function build(): ContactLog[] {
  const logs: ContactLog[] = [];
  let n = 0;
  drivers.forEach((d) => {
    if (d.onboardingStage === "registrado" && rng() > 0.4) return;
    const count = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++) {
      n++;
      const resultado = pick(resultados);
      logs.push({
        id: `CL-${String(n).padStart(4, "0")}`,
        driverId: d.id,
        agentId: d.assignedAgentId,
        fecha: new Date(NOW - Math.floor(rng() * 45) * DAY).toISOString(),
        canal: pick(canales),
        resultado,
        comentario: rng() > 0.35 ? pick(comentarios) : undefined,
      });
    }
  });
  return logs.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export const contactLogs: ContactLog[] = build();
