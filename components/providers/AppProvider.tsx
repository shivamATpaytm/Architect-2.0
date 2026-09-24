"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppPreferences,
  Mode,
  Project,
  Theme,
  UserSession,
} from "@/lib/types";
import {
  defaultPrefs,
  loadPrefs,
  loadProjects,
  loadSession,
  savePrefs,
  saveProjects,
  saveSession,
  uid,
} from "@/lib/storage";
import { createLeadNurtureProject, TEMPLATES } from "@/lib/mock/seed";

interface AppContextValue {
  ready: boolean;
  session: UserSession | null;
  prefs: AppPreferences;
  projects: Project[];
  login: (email: string, provider: UserSession["provider"]) => void;
  logout: () => void;
  setMode: (mode: Mode) => void;
  setTheme: (theme: Theme) => void;
  setDefaultMode: (mode: Mode) => void;
  upsertProject: (project: Project) => void;
  getProject: (id: string) => Project | undefined;
  createFromIntent: (intent: string, templateId?: string) => Project;
  createFromImport: (source: string, label: string) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [prefs, setPrefs] = useState<AppPreferences>(defaultPrefs);
  const [projects, setProjects] = useState<Project[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSession(loadSession());
    setPrefs(loadPrefs());
    setProjects(loadProjects());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute("data-theme", prefs.theme);
  }, [prefs.theme, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const login = useCallback(
    (email: string, provider: UserSession["provider"]) => {
      const s: UserSession = {
        email,
        name: email.split("@")[0] || "Builder",
        provider,
        createdAt: new Date().toISOString(),
      };
      setSession(s);
      saveSession(s);
      const p = loadPrefs();
      setPrefs(p);
    },
    []
  );

  const logout = useCallback(() => {
    setSession(null);
    saveSession(null);
  }, []);

  const persistPrefs = useCallback((next: AppPreferences) => {
    setPrefs(next);
    savePrefs(next);
  }, []);

  const setMode = useCallback(
    (mode: Mode) => persistPrefs({ ...prefs, mode }),
    [persistPrefs, prefs]
  );
  const setTheme = useCallback(
    (theme: Theme) => persistPrefs({ ...prefs, theme }),
    [persistPrefs, prefs]
  );
  const setDefaultMode = useCallback(
    (defaultMode: Mode) => persistPrefs({ ...prefs, defaultMode, mode: defaultMode }),
    [persistPrefs, prefs]
  );

  const persistProjects = useCallback((next: Project[]) => {
    setProjects(next);
    saveProjects(next);
  }, []);

  const upsertProject = useCallback(
    (project: Project) => {
      persistProjects(
        (() => {
          const idx = projects.findIndex((p) => p.id === project.id);
          if (idx === -1) return [project, ...projects];
          const copy = [...projects];
          copy[idx] = project;
          return copy;
        })()
      );
    },
    [persistProjects, projects]
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) => {
      setProjects((prev) => {
        const next = prev.map((p) =>
          p.id === id
            ? { ...p, ...patch, updatedAt: new Date().toISOString() }
            : p
        );
        saveProjects(next);
        return next;
      });
    },
    []
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const createFromIntent = useCallback(
    (intent: string, templateId?: string) => {
      const base = createLeadNurtureProject();
      const tpl = TEMPLATES.find((t) => t.id === templateId);
      const project: Project = {
        ...base,
        id: uid("proj"),
        name: tpl?.name || deriveName(intent),
        pitch: tpl?.pitch || intent.slice(0, 120),
        status: "building",
        phase: "consulting",
        deployUrl: undefined,
        previewReady: false,
        githubConnected: false,
        githubRepo: undefined,
        lastSync: undefined,
        template: templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chat: [
          {
            id: uid("msg"),
            role: "system",
            phase: "consulting",
            content: "Consulting phase started.",
            timestamp: new Date().toISOString(),
          },
          {
            id: uid("msg"),
            role: "user",
            content: intent || `Build ${tpl?.name || "an agentic app"}`,
            timestamp: new Date().toISOString(),
          },
          {
            id: uid("msg"),
            role: "assistant",
            phase: "consulting",
            content:
              "I'll shape this into a Blueprint → Crew → Stage flow. Hit Generate in Build to simulate the phases.",
            timestamp: new Date().toISOString(),
            chips: ["Make casual", "Add auth", "Add citations"],
          },
        ],
      };
      setProjects((prev) => {
        const next = [project, ...prev];
        saveProjects(next);
        return next;
      });
      return project;
    },
    []
  );

  const createFromImport = useCallback(
    (source: string, label: string) => {
      const base = createLeadNurtureProject();
      const project: Project = {
        ...base,
        id: uid("proj"),
        name: label,
        pitch: `Imported via ${source}`,
        status: "building",
        phase: "crew",
        deployUrl: undefined,
        previewReady: true,
        githubConnected: source === "GitHub",
        githubRepo: source === "GitHub" ? label : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chat: [
          {
            id: uid("msg"),
            role: "system",
            phase: "crew",
            content: `Imported ${label} via ${source}.`,
            timestamp: new Date().toISOString(),
          },
          {
            id: uid("msg"),
            role: "assistant",
            content:
              "Import complete. Crew graph hydrated from the source artifact. Continue in Build or inspect Agents.",
            timestamp: new Date().toISOString(),
            chips: ["Open Agents", "Open Code", "Deploy"],
          },
        ],
      };
      setProjects((prev) => {
        const next = [project, ...prev];
        saveProjects(next);
        return next;
      });
      return project;
    },
    []
  );

  const value = useMemo(
    () => ({
      ready,
      session,
      prefs,
      projects,
      login,
      logout,
      setMode,
      setTheme,
      setDefaultMode,
      upsertProject,
      getProject,
      createFromIntent,
      createFromImport,
      updateProject,
      toast,
      showToast,
    }),
    [
      ready,
      session,
      prefs,
      projects,
      login,
      logout,
      setMode,
      setTheme,
      setDefaultMode,
      upsertProject,
      getProject,
      createFromIntent,
      createFromImport,
      updateProject,
      toast,
      showToast,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function deriveName(intent: string) {
  const words = intent.trim().split(/\s+/).slice(0, 4).join(" ");
  return words ? words.replace(/^./, (c) => c.toUpperCase()) : "Untitled Crew";
}
