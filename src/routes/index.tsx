import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { companyConfig } from "@/config/company";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acceso | Onboarding de conductores" },
      {
        name: "description",
        content:
          "Inicia sesión en la plataforma de gestión de onboarding de conductores para empresas de transporte.",
      },
      { property: "og:title", content: "Acceso | Onboarding de conductores" },
      {
        property: "og:description",
        content: "Plataforma de gestión de onboarding de conductores para empresas de transporte.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, agents } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState(agents[0]?.email ?? "");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    if (login(email)) navigate({ to: "/dashboard/uber" });
    else setError("Credenciales no reconocidas.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={companyConfig.logoUrl} alt="" className="size-12 rounded-xl" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{companyConfig.companyName}</h1>
          <p className="text-sm text-muted-foreground">Gestión de onboarding de conductores</p>
        </div>
        <Card className="border-border/70">
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.mx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error ? <p className="text-sm text-danger-foreground">{error}</p> : null}
              <Button type="submit" className="w-full">
                Iniciar sesión
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Demo: usa cualquiera de los correos del equipo, ej. {agents[0]?.email}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
