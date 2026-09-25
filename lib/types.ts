export type Mode = "builder" | "architect";
export type Theme = "night" | "day";
export type ProjectStatus = "queued" | "building" | "ready" | "live" | "failed";
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

export interface DataAsset {
  id: string;
  name: string;
  kind: "pdf" | "csv" | "other";
  sizeLabel: string;
  addedAt: string;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  blurb: string;
  connected: boolean;
  permissions: string;
}

export interface PullRequestStub {
  number: number;
  title: string;
  url: string;
  createdAt: string;
}

export interface BuildProgress {
  state: "queued" | "building" | "ready" | "failed";
  stepLabel: string;
  etaLabel: string;
  startedAt: string;
  percent: number;
}

export interface OutreachRun {
  status: "idle" | "queued" | "running" | "done" | "fail";
  startedAt?: string;
  finishedAt?: string;
  counts: { leads: number; drafts: number; crm: number };
  logs: string[];
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
  dataAssets: DataAsset[];
  integrations: IntegrationConnector[];
  pullRequests: PullRequestStub[];
  buildProgress?: BuildProgress;
  outreach?: OutreachRun;
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
