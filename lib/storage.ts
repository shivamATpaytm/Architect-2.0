import type { AppPreferences, Project, UserSession } from "./types";
import { createLeadNurtureProject } from "./mock/seed";

const KEYS = {
  session: "architect-session",
  prefs: "architect-prefs",
  projects: "architect-projects",
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

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.projects);
    if (!raw) {
      const seed = [createLeadNurtureProject()];
      localStorage.setItem(KEYS.projects, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Project[];
  } catch {
    return [createLeadNurtureProject()];
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.projects, JSON.stringify(projects));
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
