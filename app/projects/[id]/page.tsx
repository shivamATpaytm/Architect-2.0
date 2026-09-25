"use client";

import { Suspense, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/chrome/AuthGate";
import { AppHeader } from "@/components/chrome/AppHeader";
import { StudioNav } from "@/components/chrome/StudioNav";
import { PhaseRibbon } from "@/components/chrome/PhaseRibbon";
import { ChatPanel } from "@/components/build/ChatPanel";
import { PreviewStage } from "@/components/build/PreviewStage";
import { AgentCanvas } from "@/components/agents/AgentCanvas";
import { BlueprintView } from "@/components/blueprint/BlueprintView";
import { CodeView } from "@/components/code/CodeView";
import { DeployPanel } from "@/components/ship/DeployPanel";
import { useApp } from "@/components/providers/AppProvider";
import type { StudioView } from "@/lib/types";

const VIEWS: StudioView[] = [
  "build",
  "blueprint",
  "agents",
  "code",
  "ship",
  "data",
  "integrations",
];

export default function ProjectStudioPage() {
  return (
    <AuthGate>
      <Suspense
        fallback={
          <div className="blueprint-grid min-h-screen flex items-center justify-center">
            <p className="mono text-sm" style={{ color: "var(--ink-muted)" }}>
              Loading studio…
            </p>
          </div>
        }
      >
        <StudioInner />
      </Suspense>
    </AuthGate>
  );
}

function StudioInner() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id);
  const viewParam = (search.get("view") || "build") as StudioView;
  const view = VIEWS.includes(viewParam) ? viewParam : "build";
  const { getProject, ready, prefs } = useApp();
  const router = useRouter();
  const project = getProject(id);

  const crewCount = useMemo(
    () => project?.agents.filter((a) => a.id.startsWith("agent-")).length ?? 0,
    [project]
  );

  if (!ready) {
    return (
      <div className="blueprint-grid min-h-screen flex items-center justify-center">
        <p className="mono text-sm" style={{ color: "var(--ink-muted)" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-6 blueprint-grid">
          <div className="sketch-empty max-w-md">
            <p className="display text-xl m-0 mb-2">Project not found</p>
            <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
              It may have been cleared from local storage. Open Home and use the seed project.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => router.push("/home")}>
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--bg)" }}>
      <AppHeader
        projectName={project.name}
        deployHref={`/projects/${project.id}?view=ship`}
      />
      <div
        className="px-4 py-2 border-b flex items-center justify-between gap-3 flex-wrap shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <PhaseRibbon phase={project.phase} />
        <div className="flex items-center gap-2">
          {project.status === "live" && <span className="live-pill">LIVE</span>}
          <span className="mono text-xs" style={{ color: "var(--ink-muted)" }}>
            {project.deployUrl || "not deployed"}
          </span>
          <span className="chip hidden sm:inline-flex">
            {prefs.mode === "builder" ? "Outcome density" : "Wiring density"}
          </span>
        </div>
      </div>
      <StudioNav projectId={project.id} view={view} crewCount={crewCount} />

      <div className="flex-1 min-h-0 overflow-hidden">
        {view === "build" && (
          <div className="grid h-full min-h-0 lg:grid-cols-[minmax(320px,38%)_minmax(0,62%)]">
            <div
              className="min-h-0 border-r"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <ChatPanel project={project} />
            </div>
            <div className="min-h-0" style={{ background: "var(--bg)" }}>
              <PreviewStage project={project} />
            </div>
          </div>
        )}
        {view === "blueprint" && <BlueprintView project={project} />}
        {view === "agents" && <AgentCanvas project={project} />}
        {view === "code" && <CodeView project={project} />}
        {view === "ship" && <DeployPanel project={project} />}
        {view === "data" && (
          <StubView
            title="Data & knowledge"
            body="Attach PDFs and CSVs to the crew knowledge base. This demo already seeds icp-guide.pdf and pricing.csv on Lead Nurture Crew — open Agents to see attachments per node."
            ctaLabel="Open Agents"
            onCta={() => router.push(`/projects/${project.id}?view=agents`)}
          />
        )}
        {view === "integrations" && (
          <StubView
            title="Integrations"
            body="Connectors for Gmail, HubSpot, Slack, and web search. Toggle wiring from the Agents inspector in this demo — no real OAuth."
            ctaLabel="Open Agents"
            onCta={() => router.push(`/projects/${project.id}?view=agents`)}
          />
        )}
      </div>
    </div>
  );
}

function StubView({
  title,
  body,
  ctaLabel,
  onCta,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div className="h-full flex items-center justify-center p-6 blueprint-grid">
      <div className="sketch-empty max-w-lg">
        <p className="display text-2xl m-0 mb-2">{title}</p>
        <p className="m-0 text-sm mb-4">{body}</p>
        <button type="button" className="btn btn-primary" onClick={onCta}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
