import type { AgentNode, AppPreferences, Project, UserSession } from "./types";
import { createLeadNurtureProject, DEFAULT_INTEGRATIONS } from "./mock/seed";

const KEYS = {
  session: "architect-session",
  prefs: "architect-prefs",
  projects: "architect-projects",
  agentDrafts: "architect-agent-drafts",
} as const;

export const defaultPrefs: AppPreferences = {
  mode: "builder",
  theme: "night",
  defaultMode: "builder",
};

export function loadSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(KEYS.session);
  else localStorage.setItem(KEYS.session, JSON.stringify(session));
}

export function loadPrefs(): AppPreferences {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = localStorage.getItem(KEYS.prefs);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export function savePrefs(prefs: AppPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.prefs, JSON.stringify(prefs));
}

function normalizeProject(p: Project): Project {
  const status =
    (p.status as string) === "draft"
      ? "ready"
      : (p.status as string) === "building" && p.previewReady
        ? "ready"
        : p.status;

  return {
    ...p,
    status: status as Project["status"],
    dataAssets: p.dataAssets ?? [
      {
        id: "asset-icp",
        name: "icp-guide.pdf",
        kind: "pdf" as const,
        sizeLabel: "248 KB",
        addedAt: p.createdAt,
      },
      {
        id: "asset-pricing",
        name: "pricing.csv",
        kind: "csv" as const,
        sizeLabel: "12 KB",
        addedAt: p.createdAt,
      },
    ],
    integrations: p.integrations ?? DEFAULT_INTEGRATIONS.map((c) => ({ ...c })),
    pullRequests: p.pullRequests ?? [],
    outreach: p.outreach ?? {
      status: "idle" as const,
      counts: { leads: 128, drafts: 34, crm: 19 },
      logs: [],
    },
    buildProgress: p.buildProgress ?? {
      state: p.previewReady || p.status === "live" ? ("ready" as const) : ("building" as const),
      stepLabel: p.status === "live" ? "Live on Stage" : p.previewReady ? "Ready" : "Building…",
      etaLabel: p.previewReady || p.status === "live" ? "Done" : "~45s",
      startedAt: p.createdAt,
      percent: p.previewReady || p.status === "live" ? 100 : 40,
    },
  };
}

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.projects);
    if (!raw) {
      const seed = [createLeadNurtureProject()];
      localStorage.setItem(KEYS.projects, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Project[];
    return parsed.map(normalizeProject);
  } catch {
    return [createLeadNurtureProject()];
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.projects, JSON.stringify(projects));
}

export type AgentDraftMap = Record<string, AgentNode>;

export function loadAgentDrafts(projectId: string): AgentDraftMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${KEYS.agentDrafts}:${projectId}`);
    return raw ? (JSON.parse(raw) as AgentDraftMap) : {};
  } catch {
    return {};
  }
}

export function saveAgentDraft(projectId: string, agent: AgentNode) {
  if (typeof window === "undefined") return;
  const all = loadAgentDrafts(projectId);
  all[agent.id] = agent;
  localStorage.setItem(`${KEYS.agentDrafts}:${projectId}`, JSON.stringify(all));
}

export function clearAgentDraft(projectId: string, agentId: string) {
  if (typeof window === "undefined") return;
  const all = loadAgentDrafts(projectId);
  delete all[agentId];
  localStorage.setItem(`${KEYS.agentDrafts}:${projectId}`, JSON.stringify(all));
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
