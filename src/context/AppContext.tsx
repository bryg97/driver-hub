import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { agents as seedAgents } from "@/data/agents";
import { drivers as seedDrivers } from "@/data/drivers";
import { contactLogs as seedLogs } from "@/data/contactLogs";
import { alerts as seedAlerts, defaultThresholds } from "@/data/alerts";
import { changeHistory as seedHistory } from "@/data/changeHistory";
import type {
  Agent,
  Alert,
  AlertThresholds,
  ChangeHistoryEntry,
  ContactLog,
  Driver,
} from "@/data/types";

interface AppState {
  currentUser: Agent | null;
  login: (email: string) => boolean;
  logout: () => void;
  drivers: Driver[];
  agents: Agent[];
  contactLogs: ContactLog[];
  alerts: Alert[];
  changeHistory: ChangeHistoryEntry[];
  thresholds: AlertThresholds;
  setThreshold: (key: keyof AlertThresholds, value: number) => void;
  addContactLog: (log: Omit<ContactLog, "id">) => void;
  resolveAlert: (alertId: string) => void;
  createAgent: (agent: Omit<Agent, "id">) => void;
  updateAgent: (id: string, patch: Partial<Omit<Agent, "id">>) => void;
  deleteAgent: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>(seedAgents);
  const [contactLogsState, setContactLogs] = useState<ContactLog[]>(seedLogs);
  const [alertsState, setAlerts] = useState<Alert[]>(seedAlerts);
  const [thresholds, setThresholds] = useState<AlertThresholds>(defaultThresholds);

  const login = useCallback(
    (email: string) => {
      const found = agents.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
      const user = found ?? agents[0] ?? null;
      setCurrentUser(user);
      return Boolean(user);
    },
    [agents],
  );

  const logout = useCallback(() => setCurrentUser(null), []);

  const addContactLog = useCallback((log: Omit<ContactLog, "id">) => {
    setContactLogs((prev) => [
      { ...log, id: `CL-${Date.now()}` },
      ...prev,
    ]);
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "resuelta" as const } : a)),
    );
  }, []);

  const setThreshold = useCallback((key: keyof AlertThresholds, value: number) => {
    setThresholds((prev) => ({ ...prev, [key]: value }));
  }, []);

  const createAgent = useCallback((agent: Omit<Agent, "id">) => {
    setAgents((prev) => [...prev, { ...agent, id: `AG-${String(prev.length + 1).padStart(2, "0")}` }]);
  }, []);

  const updateAgent = useCallback((id: string, patch: Partial<Omit<Agent, "id">>) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const deleteAgent = useCallback((id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      login,
      logout,
      drivers: seedDrivers,
      agents,
      contactLogs: contactLogsState,
      alerts: alertsState,
      changeHistory: seedHistory,
      thresholds,
      setThreshold,
      addContactLog,
      resolveAlert,
      createAgent,
      updateAgent,
      deleteAgent,
    }),
    [
      currentUser,
      login,
      logout,
      agents,
      contactLogsState,
      alertsState,
      thresholds,
      setThreshold,
      addContactLog,
      resolveAlert,
      createAgent,
      updateAgent,
      deleteAgent,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
