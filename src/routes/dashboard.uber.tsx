import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { bgcLabels } from "@/data/labels";
import type { BgcStatus } from "@/data/types";
import { formatPercent } from "@/lib/datetime";
import { pct } from "@/lib/metrics";
import { companyConfig } from "@/config/company";

export const Route = createFileRoute("/dashboard/uber")({
  head: () => ({
    meta: [
      { title: "Dashboard Uber / BGC | Onboarding de conductores" },
      {
        name: "description",
        content:
          "Estado de verificaciones BGC, distribución de conductores por ciudad y embudo de aprobación.",
      },
      { property: "og:title", content: "Dashboard Uber / BGC" },
      {
        property: "og:description",
        content: "Estado de verificaciones BGC y distribución de conductores por ciudad.",
      },
    ],
  }),
  component: UberDashboard,
});

const bgcOrder: BgcStatus[] = ["pendiente", "en_revision", "aprobado", "rechazado", "cancelado"];
const bgcColors: Record<BgcStatus, string> = {
  pendiente: "oklch(0.75 0.14 85)",
  en_revision: "oklch(0.7 0.16 55)",
  aprobado: "oklch(0.6 0.14 155)",
  rechazado: "oklch(0.6 0.19 27)",
  cancelado: "oklch(0.68 0.02 220)",
};

function UberDashboard() {
  const { drivers } = useApp();
  const [city, setCity] = useState("todas");
  const [company, setCompany] = useState("todas");

  const companies = useMemo(
    () => Array.from(new Set(drivers.map((d) => d.company))).sort(),
    [drivers],
  );

  const filtered = useMemo(
    () =>
      drivers.filter(
        (d) => (city === "todas" || d.city === city) && (company === "todas" || d.company === company),
      ),
    [drivers, city, company],
  );

  const total = filtered.length;
  const counts = bgcOrder.map((status) => ({
    status,
    label: bgcLabels[status],
    count: filtered.filter((d) => d.bgcStatus === status).length,
  }));

  const byCity = companyConfig.cities.map((c) => ({
    city: c,
    conductores: filtered.filter((d) => d.city === c).length,
  }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <AppLayout
      title="Dashboard Uber / BGC"
      description="Verificación de antecedentes y estado de cuentas"
    >
      <div className="flex flex-wrap gap-3">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-48 bg-card">
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
          <SelectTrigger className="w-60 bg-card">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total conductores" value={total} hint="Registros en el periodo" />
        {counts.map((c) => (
          <StatCard
            key={c.status}
            label={c.label}
            value={formatPercent(pct(c.count, total), 1)}
            hint={`${c.count} conductores`}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Conductores por ciudad</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.01 220)" />
                <XAxis dataKey="city" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: "oklch(0.95 0.01 220)" }} />
                <Bar dataKey="conductores" radius={[6, 6, 0, 0]} fill="oklch(0.55 0.1 195)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Embudo de estados BGC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {counts.map((c) => (
              <div key={c.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <StatusBadge
                      tone={
                        c.status === "aprobado"
                          ? "success"
                          : c.status === "pendiente"
                            ? "warning"
                            : c.status === "en_revision"
                              ? "info"
                              : c.status === "rechazado"
                                ? "danger"
                                : "neutral"
                      }
                    >
                      {c.label}
                    </StatusBadge>
                  </span>
                  <span className="text-muted-foreground">
                    {c.count} · {formatPercent(pct(c.count, total), 1)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(c.count / maxCount) * 100}%`,
                      backgroundColor: bgcColors[c.status],
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="hidden">
        <Cell />
      </div>
    </AppLayout>
  );
}
