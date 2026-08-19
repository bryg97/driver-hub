import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  BarChart3,
  ClipboardCheck,
  LogOut,
  Settings,
  Users,
  UserCog,
} from "lucide-react";
import { companyConfig } from "@/config/company";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard/uber", label: "Dashboard Uber / BGC", icon: BarChart3 },
  { to: "/dashboard/onboarding", label: "Dashboard Onboarding", icon: ClipboardCheck },
  { to: "/dashboard/agentes", label: "Dashboard Agentes", icon: UserCog },
  { to: "/conductores", label: "Conductores", icon: Users },
  { to: "/admin", label: "Admin", icon: Settings, adminOnly: true },
] as const;

export function AppLayout({
  title,
  description,
  children,
  requireAdmin = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!currentUser) navigate({ to: "/" });
    else if (requireAdmin && currentUser.role !== "admin") navigate({ to: "/dashboard/uber" });
  }, [currentUser, requireAdmin, navigate]);

  if (!currentUser) return null;
  if (requireAdmin && currentUser.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <img src={companyConfig.logoUrl} alt="" className="size-8 rounded-md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{companyConfig.companyName}</p>
            <p className="text-xs text-sidebar-foreground/60">Onboarding de conductores</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems
            .filter((item) => !("adminOnly" in item) || currentUser.role === "admin")
            .map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/60">
          {companyConfig.cities.join(" · ")} · {companyConfig.timezone}
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card/90 px-6 py-4 backdrop-blur">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="truncate text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="size-4" /> Salir
            </Button>
          </div>
        </header>
        <main className="flex-1 space-y-6 p-6">{children}</main>
      </div>
    </div>
  );
}
