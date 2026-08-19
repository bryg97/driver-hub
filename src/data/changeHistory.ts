import type { ChangeHistoryEntry } from "./types";
import { drivers } from "./drivers";

const DAY = 86_400_000;

const templates: Array<{
  fieldName: string;
  oldValue: string;
  newValue: string;
  source: ChangeHistoryEntry["source"];
}> = [
  { fieldName: "bgcStatus", oldValue: "pendiente", newValue: "en_revision", source: "sync_uber" },
  { fieldName: "bgcStatus", oldValue: "en_revision", newValue: "aprobado", source: "sync_uber" },
  { fieldName: "accountStatus", oldValue: "no_creada", newValue: "activa", source: "sync_uber" },
  { fieldName: "onboardingStage", oldValue: "registrado", newValue: "contactado", source: "agente" },
  { fieldName: "mobile", oldValue: "+52 55 0000 0000", newValue: "actualizado", source: "agente" },
  { fieldName: "assignedAgentId", oldValue: "AG-02", newValue: "AG-03", source: "agente" },
];

function build(): ChangeHistoryEntry[] {
  const list: ChangeHistoryEntry[] = [];
  let n = 0;
  drivers.forEach((d, idx) => {
    const count = (idx % 3) + 1;
    for (let i = 0; i < count; i++) {
      const t = templates[(idx + i) % templates.length]!;
      n++;
      list.push({
        id: `CH-${String(n).padStart(4, "0")}`,
        driverId: d.id,
        fieldName: t.fieldName,
        oldValue: t.oldValue,
        newValue: t.fieldName === "mobile" ? d.mobile : t.newValue,
        changedAt: new Date(Date.now() - ((idx % 20) + i * 3 + 1) * DAY).toISOString(),
        source: t.source,
      });
    }
  });
  return list.sort((a, b) => b.changedAt.localeCompare(a.changedAt));
}

export const changeHistory: ChangeHistoryEntry[] = build();
