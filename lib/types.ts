export type Mode = "builder" | "architect";
export type Theme = "night" | "day";
export type ProjectStatus = "draft" | "building" | "live";
export type Phase = "consulting" | "blueprint" | "crew" | "stage";
export type StudioView =
  | "build"
  | "blueprint"
  | "agents"
  | "code"
  | "ship"
  | "data"
  | "integrations";

export interface UserSession {
  email: string;
  name: string;
  provider: "email" | "google" | "github";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  phase?: Phase;
  timestamp: string;
  chips?: string[];
}

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  model: string;
  systemPrompt: string;
  tools: string[];
  kb: string[];
  status: "idle" | "running" | "ready";
  x: number;
  y: number;
}

export interface BlueprintSection {
  id: string;
  title: string;
  body: string;
}

export interface CodeFile {
  path: string;
  language: string;
  content: string;
  diff?: string;
}

export interface Project {
  id: string;
  name: string;
  pitch: string;
  status: ProjectStatus;
  phase: Phase;
  deployUrl?: string;
  createdAt: string;
  updatedAt: string;
  template?: string;
  agents: AgentNode[];
  chat: ChatMessage[];
  blueprint: BlueprintSection[];
  files: CodeFile[];
  githubConnected: boolean;
  githubRepo?: string;
  lastSync?: string;
  previewReady: boolean;
}

export interface AppPreferences {
  mode: Mode;
  theme: Theme;
  defaultMode: Mode;
}
