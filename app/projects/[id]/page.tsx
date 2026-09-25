"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
import { DataPanel } from "@/components/data/DataPanel";
import { IntegrationsPanel } from "@/components/integrations/IntegrationsPanel";
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
  const panelParam = search.get("panel");
  const { getProject, ready, prefs, deployProject } = useApp();
  const router = useRouter();
  const project = getProject(id);

  const crewCount = useMemo(
    () => project?.agents.filter((a) => a.id.startsWith("agent-")).length ?? 0,
    [project]
  );

  // Mobile/stacked: Chat | Preview tabs. Default Preview so Stage is never buried.
  const [mobilePane, setMobilePane] = useState<"chat" | "preview">(() =>
    panelParam === "chat" ? "chat" : "preview"
  );

  const buildStep = project?.buildProgress?.step;
  const previewReady = project?.previewReady;

  // Once UI generation starts (or ready), focus Preview on small screens.
  useEffect(() => {
    if (
      buildStep === "ui" ||
      buildStep === "agents" ||
      buildStep === "ready" ||
      previewReady
    ) {
      setMobilePane("preview");
    }
  }, [buildStep, previewReady]);

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
        onDeploy={() => deployProject(project.id)}
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
          <div className="flex flex-col h-full min-h-0">
            {/* Mobile / stacked: Chat | Preview toggle */}
            <div
              className="flex md:hidden items-center px-3 py-2 border-b shrink-0"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div className="seg w-full" role="tablist" aria-label="Build panels">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobilePane === "chat"}
                  className={`seg-item flex-1 ${mobilePane === "chat" ? "active" : ""}`}
                  onClick={() => setMobilePane("chat")}
                >
                  Chat
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobilePane === "preview"}
                  className={`seg-item flex-1 ${mobilePane === "preview" ? "active" : ""}`}
                  onClick={() => setMobilePane("preview")}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* ≥768px: side-by-side Chat | Stage (Stage ≥55%). Below: one pane fills height. */}
            <div className="grid flex-1 min-h-0 h-full md:grid-cols-[minmax(260px,40%)_minmax(0,60%)]">
              <div
                className={`min-h-0 h-full border-r flex-col ${
                  mobilePane === "chat" ? "flex" : "hidden"
                } md:flex`}
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <ChatPanel
                  project={project}
                  onShowPreview={() => setMobilePane("preview")}
                />
              </div>
              <div
                id="stage-panel"
                className={`h-full min-h-[420px] flex-col ${
                  mobilePane === "preview" ? "flex" : "hidden"
                } md:flex`}
                style={{ background: "var(--bg)" }}
              >
                <PreviewStage project={project} />
              </div>
            </div>
          </div>
        )}
        {view === "blueprint" && <BlueprintView project={project} />}
        {view === "agents" && <AgentCanvas project={project} />}
        {view === "code" && <CodeView project={project} />}
        {view === "ship" && <DeployPanel project={project} />}
        {view === "data" && <DataPanel project={project} />}
        {view === "integrations" && <IntegrationsPanel project={project} />}
      </div>
    </div>
  );
}
