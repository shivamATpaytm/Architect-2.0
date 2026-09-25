"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import {
  createLeadNurtureProject,
  DEFAULT_INTEGRATIONS,
  TEMPLATES,
} from "@/lib/mock/seed";

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
  deployProject: (id: string) => string | null;
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
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});

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
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        setPrefs((prev) => {
          const mode: Mode = prev.mode === "builder" ? "architect" : "builder";
          const next = { ...prev, mode };
          savePrefs(next);
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      Object.values(map).forEach((list) => list.forEach(clearTimeout));
    };
  }, []);

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

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) => {
      const next = prev.map((p) =>
        p.id === id
          ? { ...p, ...patch, updatedAt: new Date().toISOString() }
          : p
      );
      saveProjects(next);
      return next;
    });
  }, []);

  const scheduleBuildLifecycle = useCallback(
    (projectId: string) => {
      const existing = timers.current[projectId] || [];
      existing.forEach(clearTimeout);
      const list: ReturnType<typeof setTimeout>[] = [];

      const patch = (partial: Partial<Project>) => {
        setProjects((prev) => {
          const next = prev.map((p) =>
            p.id === projectId
              ? { ...p, ...partial, updatedAt: new Date().toISOString() }
              : p
          );
          saveProjects(next);
          return next;
        });
      };

      list.push(
        setTimeout(() => {
          patch({
            status: "building",
            buildProgress: {
              state: "building",
              stepLabel: "Scaffolding Blueprint & Crew",
              etaLabel: "~35s remaining",
              startedAt: new Date().toISOString(),
              percent: 35,
            },
          });
        }, 900)
      );
      list.push(
        setTimeout(() => {
          patch({
            status: "building",
            phase: "blueprint",
            buildProgress: {
              state: "building",
              stepLabel: "Wiring agents & tools",
              etaLabel: "~18s remaining",
              startedAt: new Date().toISOString(),
              percent: 65,
            },
          });
        }, 2200)
      );
      list.push(
        setTimeout(() => {
          patch({
            status: "ready",
            phase: "stage",
            previewReady: true,
            buildProgress: {
              state: "ready",
              stepLabel: "Ready on Stage",
              etaLabel: "Done",
              startedAt: new Date().toISOString(),
              percent: 100,
            },
          });
          setToast("Project ready — open Stage to preview");
        }, 4000)
      );

      timers.current[projectId] = list;
    },
    []
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const deployProject = useCallback(
    (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) return null;
      const url =
        project.deployUrl ||
        `${project.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}.architect.new`;
      updateProject(id, {
        status: "live",
        deployUrl: url,
        phase: "stage",
        previewReady: true,
        buildProgress: {
          state: "ready",
          stepLabel: "Live on Stage",
          etaLabel: "Done",
          startedAt: new Date().toISOString(),
          percent: 100,
        },
      });
      showToast(`Deployed · ${url}`);
      return url;
    },
    [projects, updateProject, showToast]
  );

  const createFromIntent = useCallback(
    (intent: string, templateId?: string) => {
      const base = createLeadNurtureProject();
      const tpl = TEMPLATES.find((t) => t.id === templateId);
      const now = new Date().toISOString();
      const project: Project = {
        ...base,
        id: uid("proj"),
        name: tpl?.name || deriveName(intent),
        pitch: tpl?.pitch || intent.slice(0, 120),
        status: "queued",
        phase: "consulting",
        deployUrl: undefined,
        previewReady: false,
        githubConnected: false,
        githubRepo: undefined,
        lastSync: undefined,
        pullRequests: [],
        template: templateId,
        createdAt: now,
        updatedAt: now,
        buildProgress: {
          state: "queued",
          stepLabel: "Queued for build",
          etaLabel: "~45s",
          startedAt: now,
          percent: 5,
        },
        outreach: {
          status: "idle",
          counts: { leads: 0, drafts: 0, crm: 0 },
          logs: [],
        },
        dataAssets: [],
        integrations: DEFAULT_INTEGRATIONS.map((c) => ({
          ...c,
          connected: false,
        })),
        chat: [
          {
            id: uid("msg"),
            role: "system",
            phase: "consulting",
            content: "Consulting phase started — project queued.",
            timestamp: now,
          },
          {
            id: uid("msg"),
            role: "user",
            content: intent || `Build ${tpl?.name || "an agentic app"}`,
            timestamp: now,
          },
          {
            id: uid("msg"),
            role: "assistant",
            phase: "consulting",
            content:
              "I'll shape this into a Blueprint → Crew → Stage flow. Build progress is running — hit Generate in Build to advance the narrative.",
            timestamp: now,
            chips: ["Make casual", "Add auth", "Add citations"],
          },
        ],
      };
      setProjects((prev) => {
        const next = [project, ...prev];
        saveProjects(next);
        return next;
      });
      scheduleBuildLifecycle(project.id);
      return project;
    },
    [scheduleBuildLifecycle]
  );

  const createFromImport = useCallback(
    (source: string, label: string) => {
      const base = createLeadNurtureProject();
      const now = new Date().toISOString();
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
        pullRequests: [],
        createdAt: now,
        updatedAt: now,
        buildProgress: {
          state: "building",
          stepLabel: "Hydrating import",
          etaLabel: "~12s",
          startedAt: now,
          percent: 55,
        },
        chat: [
          {
            id: uid("msg"),
            role: "system",
            phase: "crew",
            content: `Imported ${label} via ${source}.`,
            timestamp: now,
          },
          {
            id: uid("msg"),
            role: "assistant",
            content:
              "Import complete. Crew graph hydrated from the source artifact. Continue in Build or inspect Agents.",
            timestamp: now,
            chips: ["Open Agents", "Open Code", "Deploy"],
          },
        ],
      };
      setProjects((prev) => {
        const next = [project, ...prev];
        saveProjects(next);
        return next;
      });
      setTimeout(() => {
        setProjects((prev) => {
          const next = prev.map((p) =>
            p.id === project.id
              ? {
                  ...p,
                  status: "ready" as const,
                  buildProgress: {
                    state: "ready" as const,
                    stepLabel: "Ready on Stage",
                    etaLabel: "Done",
                    startedAt: new Date().toISOString(),
                    percent: 100,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : p
          );
          saveProjects(next);
          return next;
        });
      }, 1800);
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
      deployProject,
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
      deployProject,
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
