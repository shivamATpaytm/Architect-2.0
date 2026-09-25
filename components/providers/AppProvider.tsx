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
  GenerationCheckpoint,
  HomeMode,
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
import {
  applyRefine,
  emptyProjectShell,
  phaseArtifacts,
  synthesizeFromPrompt,
} from "@/lib/synthesizer";

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
  setHomeMode: (homeMode: HomeMode) => void;
  upsertProject: (project: Project) => void;
  getProject: (id: string) => Project | undefined;
  createFromIntent: (intent: string, templateId?: string) => Project;
  createFromImport: (source: string, label: string) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deployProject: (id: string) => string | null;
  refineProject: (id: string, instruction: string) => void;
  checkpointProject: (id: string, label?: string) => void;
  restoreCheckpoint: (id: string, checkpointId: string) => void;
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
  const synthCache = useRef<Record<string, ReturnType<typeof synthesizeFromPrompt>>>({});

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

  const login = useCallback((email: string, provider: UserSession["provider"]) => {
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
  }, []);

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
  const setHomeMode = useCallback(
    (homeMode: HomeMode) => persistPrefs({ ...prefs, homeMode }),
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
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
      );
      saveProjects(next);
      return next;
    });
  }, []);

  const patchProject = useCallback((projectId: string, partial: Partial<Project>) => {
    setProjects((prev) => {
      const next = prev.map((p) =>
        p.id === projectId
          ? { ...p, ...partial, updatedAt: new Date().toISOString() }
          : p
      );
      saveProjects(next);
      return next;
    });
  }, []);

  const scheduleBuildLifecycle = useCallback(
    (projectId: string, prompt: string, templateId?: string) => {
      const existing = timers.current[projectId] || [];
      existing.forEach(clearTimeout);
      const list: ReturnType<typeof setTimeout>[] = [];
      const synth = synthesizeFromPrompt(prompt, templateId);
      synthCache.current[projectId] = synth;

      const appendChat = (
        role: "assistant" | "system",
        content: string,
        phase?: Project["phase"],
        chips?: string[]
      ) => {
        setProjects((prev) => {
          const next = prev.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              chat: [
                ...p.chat,
                {
                  id: uid("msg"),
                  role,
                  phase,
                  content,
                  timestamp: new Date().toISOString(),
                  chips,
                },
              ],
              updatedAt: new Date().toISOString(),
            };
          });
          saveProjects(next);
          return next;
        });
      };

      // Understanding
      list.push(
        setTimeout(() => {
          patchProject(projectId, {
            status: "building",
            phase: "consulting",
            buildProgress: {
              state: "building",
              stepLabel: "Understanding prompt",
              etaLabel: "~32s remaining",
              startedAt: new Date().toISOString(),
              percent: 18,
              step: "understanding",
            },
          });
          appendChat(
            "system",
            "Understanding — parsing domain, audience, and channels",
            "consulting"
          );
        }, 500)
      );

      // Spec / docs
      list.push(
        setTimeout(() => {
          const arts = phaseArtifacts(synth, "spec");
          patchProject(projectId, {
            status: "building",
            ...arts,
            buildProgress: {
              state: "building",
              stepLabel: "Writing Blueprint / docs",
              etaLabel: "~24s remaining",
              startedAt: new Date().toISOString(),
              percent: 40,
              step: "spec",
            },
          });
          appendChat(
            "assistant",
            `Blueprint drafted — ${synth.blueprint.length} sections (goals, users, flows, metrics, data model) reflecting “${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}”.`,
            "blueprint",
            ["Open Blueprint", "Make denser"]
          );
        }, 1600)
      );

      // UI screens (partial)
      list.push(
        setTimeout(() => {
          const arts = phaseArtifacts(synth, "ui");
          patchProject(projectId, {
            status: "building",
            ...arts,
            buildProgress: {
              state: "building",
              stepLabel: "Generating UI screens",
              etaLabel: "~14s remaining",
              startedAt: new Date().toISOString(),
              percent: 65,
              step: "ui",
            },
          });
          appendChat(
            "assistant",
            `Stage preview live — ${arts.screens?.length || 0} screens appearing (${synth.screens.map((s) => s.name).slice(0, 3).join(", ")}…).`,
            "stage",
            ["Dark dashboard", "Add auth"]
          );
        }, 3000)
      );

      // Agents
      list.push(
        setTimeout(() => {
          const arts = phaseArtifacts(synth, "agents");
          patchProject(projectId, {
            status: "building",
            ...arts,
            buildProgress: {
              state: "building",
              stepLabel: "Assembling agent crew",
              etaLabel: "~6s remaining",
              startedAt: new Date().toISOString(),
              percent: 85,
              step: "agents",
            },
          });
          appendChat(
            "assistant",
            `Crew ready — ${synth.agents.filter((a) => a.id.startsWith("agent-")).length} agents with tools for ${synth.channels.join(", ")}.`,
            "crew",
            ["Open Agents", "Make denser"]
          );
        }, 4200)
      );

      // Ready + checkpoint
      list.push(
        setTimeout(() => {
          const arts = phaseArtifacts(synth, "ready");
          const checkpoint: GenerationCheckpoint = {
            id: uid("ckpt"),
            label: "v1 · initial build",
            createdAt: new Date().toISOString(),
            prompt,
            blueprint: synth.blueprint,
            screens: synth.screens,
            agents: synth.agents,
            files: synth.files,
          };
          patchProject(projectId, {
            ...arts,
            name: synth.name,
            pitch: synth.pitch,
            domain: synth.domain,
            checkpoints: [checkpoint],
            buildProgress: {
              state: "ready",
              stepLabel: "Ready on Stage",
              etaLabel: "Done",
              startedAt: new Date().toISOString(),
              percent: 100,
              step: "ready",
            },
          });
          appendChat(
            "assistant",
            `Ready — docs, ${synth.screens.length} UI screens, crew, and code stubs are in sync. Refine with chips or chat (“make denser”, “add auth”). Checkpoint v1 saved.`,
            "stage",
            ["Make denser", "Add auth", "Dark dashboard", "Open Agents", "Deploy"]
          );
          setToast("Project ready — docs + UI generated together");
        }, 5400)
      );

      timers.current[projectId] = list;
    },
    [patchProject]
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
          step: "ready",
        },
      });
      showToast(`Deployed · ${url}`);
      return url;
    },
    [projects, updateProject, showToast]
  );

  const createFromIntent = useCallback(
    (intent: string, templateId?: string) => {
      const tpl = TEMPLATES.find((t) => t.id === templateId);
      const prompt = intent.trim() || (tpl ? `Build ${tpl.name}: ${tpl.pitch}` : "Agentic workspace");
      const synth = synthesizeFromPrompt(prompt, templateId);
      const project = emptyProjectShell(synth, prompt, { templateId });
      // Keep name from template if explicitly chosen
      if (tpl) {
        project.name = tpl.name;
        project.pitch = tpl.pitch;
        project.template = tpl.id;
      }
      setProjects((prev) => {
        const next = [project, ...prev];
        saveProjects(next);
        return next;
      });
      scheduleBuildLifecycle(project.id, prompt, templateId);
      return project;
    },
    [scheduleBuildLifecycle]
  );

  const refineProject = useCallback(
    (id: string, instruction: string) => {
      setProjects((prev) => {
        const project = prev.find((p) => p.id === id);
        if (!project) return prev;
        const patch = applyRefine(project, instruction);
        const ckpt: GenerationCheckpoint = {
          id: uid("ckpt"),
          label: `v${(project.generationVersion || 1) + 1} · ${instruction.slice(0, 32)}`,
          createdAt: new Date().toISOString(),
          prompt: instruction,
          blueprint: (patch.blueprint as Project["blueprint"]) || project.blueprint,
          screens: (patch.screens as Project["screens"]) || project.screens,
          agents: project.agents,
          files: project.files,
        };
        const next = prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...patch,
                checkpoints: [...(p.checkpoints || []), ckpt].slice(-8),
                chat: [
                  ...p.chat,
                  {
                    id: uid("msg"),
                    role: "user" as const,
                    content: instruction,
                    timestamp: new Date().toISOString(),
                  },
                  {
                    id: uid("msg"),
                    role: "assistant" as const,
                    content: `Applied “${instruction}” — Stage UI and Blueprint updated (v${(p.generationVersion || 1) + 1}). Checkpoint saved.`,
                    timestamp: new Date().toISOString(),
                    phase: "stage" as const,
                    chips: ["Make denser", "Add auth", "Dark dashboard", "Open Blueprint"],
                  },
                ],
              }
            : p
        );
        saveProjects(next);
        return next;
      });
      showToast("Refined — Stage + docs updated");
    },
    [showToast]
  );

  const checkpointProject = useCallback(
    (id: string, label?: string) => {
      setProjects((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          const ckpt: GenerationCheckpoint = {
            id: uid("ckpt"),
            label: label || `v${p.generationVersion || 1} · checkpoint`,
            createdAt: new Date().toISOString(),
            prompt: p.prompt || p.pitch,
            blueprint: p.blueprint,
            screens: p.screens,
            agents: p.agents,
            files: p.files,
          };
          return { ...p, checkpoints: [...(p.checkpoints || []), ckpt].slice(-8) };
        });
        saveProjects(next);
        return next;
      });
      showToast("Checkpoint saved");
    },
    [showToast]
  );

  const restoreCheckpoint = useCallback(
    (id: string, checkpointId: string) => {
      setProjects((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          const ckpt = (p.checkpoints || []).find((c) => c.id === checkpointId);
          if (!ckpt) return p;
          return {
            ...p,
            blueprint: ckpt.blueprint,
            screens: ckpt.screens,
            agents: ckpt.agents,
            files: ckpt.files,
            activeScreenId: ckpt.screens[0]?.id,
            generationVersion: (p.generationVersion || 1) + 1,
            updatedAt: new Date().toISOString(),
            chat: [
              ...p.chat,
              {
                id: uid("msg"),
                role: "system" as const,
                content: `Restored checkpoint “${ckpt.label}”`,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        });
        saveProjects(next);
        return next;
      });
      showToast("Checkpoint restored");
    },
    [showToast]
  );

  const createFromImport = useCallback((source: string, label: string) => {
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
                  step: "ready" as const,
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
  }, []);

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
      setHomeMode,
      upsertProject,
      getProject,
      createFromIntent,
      createFromImport,
      updateProject,
      deployProject,
      refineProject,
      checkpointProject,
      restoreCheckpoint,
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
      setHomeMode,
      upsertProject,
      getProject,
      createFromIntent,
      createFromImport,
      updateProject,
      deployProject,
      refineProject,
      checkpointProject,
      restoreCheckpoint,
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

