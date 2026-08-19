import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { AgentRole } from "@/data/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administración de usuarios | Onboarding" },
      {
        name: "description",
        content: "Alta, edición y baja de usuarios administradores y agentes de onboarding.",
      },
      { property: "og:title", content: "Administración de usuarios" },
      {
        property: "og:description",
        content: "Gestión de usuarios y roles de la plataforma de onboarding.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { agents, createAgent, updateAgent, deleteAgent } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AgentRole>("agente");

  function reset() {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("agente");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Nombre y correo son obligatorios.");
      return;
    }
    if (editingId) {
      updateAgent(editingId, { name, email, role });
      toast.success("Usuario actualizado.");
    } else {
      createAgent({ name, email, role });
      toast.success("Usuario creado.");
    }
    reset();
  }

  return (
    <AppLayout title="Administración" description="Usuarios y roles de la plataforma" requireAdmin>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                    <TableCell>
                      <StatusBadge tone={a.role === "admin" ? "success" : "primary"}>
                        {a.role === "admin" ? "Admin" : "Agente"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(a.id);
                          setName(a.name);
                          setEmail(a.email);
                          setRole(a.role);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Contraseña restablecida para ${a.name}.`)}
                      >
                        <KeyRound className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          deleteAgent(a.id);
                          toast.success("Usuario eliminado.");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? "Editar usuario" : "Nuevo usuario"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AgentRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agente">Agente</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? "Guardar cambios" : "Crear usuario"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={reset}>
                    Cancelar
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
