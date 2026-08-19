import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
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
import { channelLabels } from "@/data/labels";
import type { ContactChannel } from "@/data/types";
import { formatPercent, toDateInputValue } from "@/lib/datetime";
import { buildAgentStats } from "@/lib/metrics";

export const Route = createFileRoute("/dashboard/agentes")({
  head: () => ({
    meta: [
      { title: "Dashboard Agentes | Desempeño del equipo" },
      {
        name: "description",
        content:
          "Ranking de agentes por contactos, tasa de contacto exitoso, activaciones y rescates de conductores.",
      },
      { property: "og:title", content: "Dashboard Agentes" },
      {
        property: "og:description",
        content: "Ranking de desempeño del equipo de onboarding de conductores.",
      },
    ],
  }),
  component: AgentsDashboard,
});

const channels: ContactChannel[] = ["llamada", "whatsapp", "presencial", "correo"];

function AgentsDashboard() {
  const { agents, drivers, contactLogs, alerts } = useApp();
  const [from, setFrom] = useState(
    toDateInputValue(new Date(Date.now() - 45 * 86_400_000).toISOString()),
  );
  const [to, setTo] = useState(toDateInputValue());

  const filteredLogs = useMemo(
    () =>
      contactLogs.filter((l) => {
        const day = l.fecha.slice(0, 10);
        return day >= from && day <= to;
      }),
    [contactLogs, from, to],
  );

  const rows = useMemo(
    () =>
      agents
        .map((a) => ({
          agent: a,
          stats: buildAgentStats(a.id, drivers, filteredLogs, alerts),
        }))
        .sort((x, y) => y.stats.activationRate - x.stats.activationRate),
    [agents, drivers, filteredLogs, alerts],
  );

  return (
    <AppLayout title="Dashboard Agentes" description="Desempeño del equipo de onboarding">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Rango de fechas de contactos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">Desde</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Hasta</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredLogs.length} contactos en el rango seleccionado
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Ranking de agentes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead className="text-right">Asignados</TableHead>
                <TableHead className="text-right">Alertas abiertas</TableHead>
                <TableHead>Contactos por canal</TableHead>
                <TableHead className="text-right">% contacto exitoso</TableHead>
                <TableHead className="text-right">% activación</TableHead>
                <TableHead className="text-right">Prom. a 1er viaje</TableHead>
                <TableHead className="text-right">% rescate exitoso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ agent, stats }) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.email}</div>
                  </TableCell>
                  <TableCell className="text-right">{stats.assigned}</TableCell>
                  <TableCell className="text-right">
                    <StatusBadge tone={stats.openAlerts > 3 ? "danger" : "neutral"}>
                      {stats.openAlerts}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {channels.map((c) => (
                        <StatusBadge key={c} tone="primary">
                          {channelLabels[c]}: {stats.byChannel[c] ?? 0}
                        </StatusBadge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(stats.successRate, 1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(stats.activationRate, 1)}
                  </TableCell>
                  <TableCell className="text-right">
                    {stats.avgDaysToFirstTrip ? `${stats.avgDaysToFirstTrip.toFixed(1)} d` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(stats.rescueSuccessRate, 1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
