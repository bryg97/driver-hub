import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, type Tone } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/context/AppContext";
import { bgcLabels, bgcTone, stageLabels } from "@/data/labels";
import type { BgcStatus, OnboardingStage } from "@/data/types";
import { formatDate } from "@/lib/datetime";
import { companyConfig } from "@/config/company";

export const Route = createFileRoute("/conductores/")({
  head: () => ({
    meta: [
      { title: "Conductores | Base de onboarding" },
      {
        name: "description",
        content:
          "Consulta y filtra la base de conductores por ciudad, compañía, estado BGC, etapa de onboarding y agente asignado.",
      },
      { property: "og:title", content: "Conductores" },
      {
        property: "og:description",
        content: "Base filtrable de conductores en proceso de onboarding.",
      },
    ],
  }),
  component: DriversPage,
});

function DriversPage() {
  const { drivers, agents } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("todas");
  const [company, setCompany] = useState("todas");
  const [bgc, setBgc] = useState("todos");
  const [stage, setStage] = useState("todas");
  const [agent, setAgent] = useState("todos");

  const companies = useMemo(
    () => Array.from(new Set(drivers.map((d) => d.company))).sort(),
    [drivers],
  );
  const agentById = useMemo(() => new Map(agents.map((a) => [a.id, a] as const)), [agents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drivers.filter((d) => {
      if (city !== "todas" && d.city !== city) return false;
      if (company !== "todas" && d.company !== company) return false;
      if (bgc !== "todos" && d.bgcStatus !== bgc) return false;
      if (stage !== "todas" && d.onboardingStage !== stage) return false;
      if (agent !== "todos" && d.assignedAgentId !== agent) return false;
      if (!q) return true;
      return (
        `${d.name} ${d.surname}`.toLowerCase().includes(q) ||
        d.curp.toLowerCase().includes(q) ||
        d.driverCallsign.toLowerCase().includes(q)
      );
    });
  }, [drivers, query, city, company, bgc, stage, agent]);

  return (
    <AppLayout title="Conductores" description={`${filtered.length} de ${drivers.length} conductores`}>
      <Card className="border-border/70">
        <CardContent className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="relative md:col-span-3 xl:col-span-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre, CURP o callsign"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las ciudades</SelectItem>
              {companyConfig.cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger>
              <SelectValue placeholder="Compañía" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las compañías</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bgc} onValueChange={setBgc}>
            <SelectTrigger>
              <SelectValue placeholder="Estado BGC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los BGC</SelectItem>
              {(Object.keys(bgcLabels) as BgcStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {bgcLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger>
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las etapas</SelectItem>
              {(Object.keys(stageLabels) as OnboardingStage[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {stageLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={agent} onValueChange={setAgent}>
            <SelectTrigger>
              <SelectValue placeholder="Agente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los agentes</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conductor</TableHead>
                <TableHead>Callsign</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Compañía</TableHead>
                <TableHead>BGC</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead className="text-right">Viajes</TableHead>
                <TableHead>Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow
                  key={d.id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: "/conductores/$id", params: { id: d.id } })}
                >
                  <TableCell>
                    <div className="font-medium">
                      {d.name} {d.surname}
                    </div>
                    <div className="text-xs text-muted-foreground">{d.curp}</div>
                  </TableCell>
                  <TableCell className="text-sm">{d.driverCallsign}</TableCell>
                  <TableCell className="text-sm">{d.city}</TableCell>
                  <TableCell className="text-sm">{d.company}</TableCell>
                  <TableCell>
                    <StatusBadge tone={bgcTone[d.bgcStatus] as Tone}>
                      {bgcLabels[d.bgcStatus]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone="primary">{stageLabels[d.onboardingStage]}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {agentById.get(d.assignedAgentId)?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">{d.tripsCompleted}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(d.fechaRegistroReal)}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    Sin resultados para los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
