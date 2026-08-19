import type { AccountStatus, BgcStatus, Driver, OnboardingStage } from "./types";
import { companyConfig } from "@/config/company";

const NOW = Date.now();
const DAY = 86_400_000;

function daysAgo(n: number): string {
  return new Date(NOW - n * DAY).toISOString();
}

/** PRNG determinista para que los datos mock no cambien entre renders. */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rng = makeRng(20260819);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)] as T;
const between = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

const nombres = [
  "José", "María", "Luis", "Guadalupe", "Juan", "Ana", "Miguel", "Fernanda",
  "Ricardo", "Paola", "Jorge", "Karla", "Alejandro", "Brenda", "Héctor",
  "Verónica", "Raúl", "Itzel", "Óscar", "Cecilia", "Fernando", "Nayeli",
];
const apellidos = [
  "Hernández", "García", "Martínez", "López", "González", "Pérez", "Sánchez",
  "Ramírez", "Cruz", "Flores", "Gómez", "Vázquez", "Jiménez", "Reyes",
  "Morales", "Ortiz", "Guerrero", "Domínguez", "Castillo", "Aguilar",
];
const marcas: Array<[string, string[]]> = [
  ["Nissan", ["Versa", "March", "Sentra"]],
  ["Chevrolet", ["Aveo", "Beat", "Onix"]],
  ["Toyota", ["Yaris", "Corolla", "Avanza"]],
  ["Volkswagen", ["Vento", "Virtus", "Jetta"]],
  ["Kia", ["Rio", "Forte", "Soul"]],
];
const colores = ["Blanco", "Plata", "Gris Oxford", "Negro", "Rojo", "Azul"];
const companias = ["MX TAXI Flotilla", "Socio Independiente", "Flotilla Norte"];

const stages: OnboardingStage[] = [
  "registrado", "registrado", "registrado",
  "contactado", "contactado", "contactado",
  "app_instalada", "app_instalada",
  "cuenta_validada", "cuenta_validada",
  "primer_viaje", "primer_viaje",
  "seguimiento_activo", "seguimiento_activo", "seguimiento_activo",
  "rescate", "rescate",
  "baja",
];

function bgcFor(stage: OnboardingStage): BgcStatus {
  switch (stage) {
    case "registrado":
      return pick<BgcStatus>(["pendiente", "pendiente", "en_revision", "cancelado"]);
    case "contactado":
      return pick<BgcStatus>(["en_revision", "en_revision", "pendiente", "rechazado"]);
    case "app_instalada":
      return pick<BgcStatus>(["en_revision", "aprobado"]);
    case "baja":
      return pick<BgcStatus>(["cancelado", "rechazado"]);
    default:
      return "aprobado";
  }
}

function accountFor(stage: OnboardingStage): AccountStatus {
  if (stage === "registrado" || stage === "contactado") return "no_creada";
  if (stage === "app_instalada") return "inactiva";
  if (stage === "baja") return "suspendida";
  return "activa";
}

function curp(name: string, surname: string, i: number): string {
  const letras = (surname.slice(0, 2) + name.slice(0, 2))
    .normalize("NFD")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .padEnd(4, "X");
  return `${letras}${String(80 + (i % 20))}${String(1 + (i % 12)).padStart(2, "0")}${String(
    1 + (i % 28),
  ).padStart(2, "0")}HDF${String(100 + i).slice(-3)}${String(i).padStart(2, "0")}`;
}

function plates(i: number): string {
  return `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(
    65 + ((i * 7) % 26),
  )}${String.fromCharCode(65 + ((i * 3) % 26))}-${String(100 + ((i * 13) % 900))}-${
    String.fromCharCode(65 + ((i * 5) % 26))
  }`;
}

function buildDrivers(count: number): Driver[] {
  const list: Driver[] = [];
  for (let i = 0; i < count; i++) {
    const name = pick(nombres);
    const surname = `${pick(apellidos)} ${pick(apellidos)}`;
    const stage = stages[i % stages.length] as OnboardingStage;
    const [make, models] = pick(marcas) as [string, string[]];
    const city = companyConfig.cities[i % companyConfig.cities.length] as string;
    const registro = between(3, 90);
    const hasTrips = ["primer_viaje", "seguimiento_activo", "rescate"].includes(stage);
    const tripsCompleted =
      stage === "seguimiento_activo"
        ? between(12, 180)
        : stage === "primer_viaje"
          ? between(1, 8)
          : stage === "rescate"
            ? between(0, 3)
            : 0;
    const lastTripDays =
      stage === "seguimiento_activo"
        ? between(0, 4)
        : stage === "rescate"
          ? between(12, 40)
          : stage === "primer_viaje"
            ? between(1, 10)
            : null;

    list.push({
      id: `DRV-${String(i + 1).padStart(3, "0")}`,
      curp: curp(name, surname, i),
      driverCallsign: `${city === "CDMX" ? "MX" : "EM"}-${String(1000 + i * 7)}`,
      name,
      surname,
      email: `${name.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}.${surname
        .split(" ")[0]!
        .toLowerCase()
        .normalize("NFD")
        .replace(/[^a-z]/g, "")}${i}@correo.mx`,
      mobile: `+52 55 ${String(1000 + ((i * 137) % 8999))} ${String(1000 + ((i * 311) % 8999))}`,
      city,
      company: pick(companias),
      bgcStatus: bgcFor(stage),
      accountStatus: accountFor(stage),
      completedTrip: hasTrips && tripsCompleted > 0,
      dateLastTrip: lastTripDays === null ? null : daysAgo(lastTripDays),
      firstSeenAt: daysAgo(registro + between(0, 3)),
      fechaRegistroReal: daysAgo(registro),
      vehicle: {
        make,
        model: pick(models),
        plates: plates(i),
        color: pick(colores),
        year: between(2015, 2024),
      },
      onboardingStage: stage,
      assignedAgentId: `AG-0${(i % 4) + 1}`,
      tripsCompleted,
      tripsRejected: hasTrips ? between(0, 12) : 0,
    });
  }
  return list;
}

export const drivers: Driver[] = buildDrivers(44);

export const driverFullName = (d: Driver) => `${d.name} ${d.surname}`;
