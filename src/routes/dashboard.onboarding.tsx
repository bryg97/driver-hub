import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, LifeBuoy, TimerReset, UserX } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/context/AppContext";
import { alertLabels, stageLabels } from "@/data/labels";
import type { AlertThresholds, AlertType } from "@/data/types";
import { formatDateTime, formatPercent } from "@/lib/datetime";
import { averageDaysToFirstTrip, buildFunnel, pct } from "@/lib/metrics";

export const Route = createFileRoute("/dashboard/onboarding")({
  head: () => ({
    meta: [
      { title: "Dashboard Onboarding | Gestión de conductores" },
      {
        name: "description",
        content:
          "Embudo de onboarding, alertas activas por tipo y configuración de umbrales de seguimiento.",
      },
      { property: "og:title", content: "Dashboard Onboarding" },
      {
        property: "og:description",
        content: "Embudo de onboarding, alertas activas y umbrales de seguimiento.",
      },
    ],
  }),
  component: OnboardingDashboard,
});

const alertTones: Record<AlertType, "warning" | "info" | "danger"> = {
  sin_abordar: "warning",
  rescate: "info",
  riesgo_baja: "danger",
};

function OnboardingDashboard() {
  const { drivers, alerts, thresholds, setThreshold, agents, resolveAlert } = useApp();
  const navigate = useNavigate();

  const activos = drivers.filter(
    (d) => !["baja", "seguimiento_activo"].includes(d.onboardingStage),
  ).length;
  const openAlerts = alerts.filter((a) => a.status === "abierta");
  const funnel = useMemo(() => buildFunnel(drivers), [drivers]);
  const avgFirstTrip = averageDaysToFirstTrip(drivers);
  const activados = drivers.filter((d) => d.accountStatus === "activa");
  const sinViajes = activados.filter((d) => d.tripsCompleted === 0).length;

  const driverById = useMemo(
    () => new Map(drivers.map((d) => [d.id, d] as const)),
    [drivers],
  );
  const agentById = useMemo(() => new Map(agents.map((a) => [a.id, a] as const)), [agents]);

  return (
    <AppLayout title="Dashboard Onboarding" description="Avance del embudo y alertas de seguimiento">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="En proceso activo"
          value={activos}
          hint="Conductores aún en onboarding"
          icon={<TimerReset className="size-4" />}
        />
        <StatCard
          label="Alertas abiertas"
          value={openAlerts.length}
          icon={<AlertTriangle className="size-4" />}
          hint={
            <span className="flex flex-wrap gap-1">
              {(Object.keys(alertLabels) as AlertType[]).map((tipo) => (
                <StatusBadge key={tipo} tone={alertTones[tipo]}>
                  {alertLabels[tipo]}: {openAlerts.filter((a) => a.tipo === tipo).length}
                </StatusBadge>
              ))}
            </span>
          }
        />
        <StatCard
          label="Tiempo prom. a primer viaje"
          value={avgFirstTrip ? `${avgFirstTrip.toFixed(1)} d` : "—"}
          hint="Desde la fecha de registro"
          icon={<LifeBuoy className="size-4" />}
        />
        <StatCard
          label="0 viajes tras activación"
          value={formatPercent(pct(sinViajes, activados.length), 1)}
          hint={`${sinViajes} de ${activados.length} cuentas activas`}
          icon={<UserX className="size-4" />}
        />
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Embudo de etapas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {funnel.map((step, i) => (
            <div key={step.stage}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{stageLabels[step.stage]}</span>
                <span className="text-muted-foreground">
                  {step.count} · {formatPercent(step.conversion, 1)} del total
                  {i > 0 ? (
                    <span className="ml-2 text-danger-foreground">
                      caída {formatPercent(step.dropoff, 1)}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${step.conversion}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Alertas activas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[420px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Disparada</TableHead>
                    <TableHead>Agente</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openAlerts.map((a) => {
                    const d = driverById.get(a.driverId);
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {d ? `${d.name} ${d.surname}` : a.driverId}
                          <div className="text-xs text-muted-foreground">{d?.driverCallsign}</div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge tone={alertTones[a.tipo]}>{alertLabels[a.tipo]}</StatusBadge>
                          <div className="mt-1 text-xs text-muted-foreground">
                            umbral {a.diasUmbral} días
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(a.triggeredAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {d ? (agentById.get(d.assignedAgentId)?.name ?? "—") : "—"}
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate({ to: "/conductores/$id", params: { id: a.driverId } })
                            }
                          >
                            Ver conductor
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => resolveAlert(a.id)}>
                            Resolver
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {openAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No hay alertas abiertas.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Umbrales de alerta (días)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(alertLabels) as AlertType[]).map((tipo) => (
              <div key={tipo} className="space-y-2">
                <Label htmlFor={`th-${tipo}`}>{alertLabels[tipo]}</Label>
                <Input
                  id={`th-${tipo}`}
                  type="number"
                  min={1}
                  value={thresholds[tipo as keyof AlertThresholds]}
                  onChange={(e) =>
                    setThreshold(tipo as keyof AlertThresholds, Number(e.target.value) || 1)
                  }
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Los umbrales definen cuántos días deben pasar antes de disparar cada alerta.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
