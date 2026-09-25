"use client";

import { AuthGate } from "@/components/chrome/AuthGate";
import { AppHeader } from "@/components/chrome/AppHeader";
import { IntentComposer } from "@/components/home/IntentComposer";
import { SimpleChat } from "@/components/home/SimpleChat";
import { ProjectGrid } from "@/components/home/ProjectGrid";
import { ConsultantPanel } from "@/components/home/ConsultantPanel";
import { useApp } from "@/components/providers/AppProvider";
import { TEMPLATES } from "@/lib/mock/seed";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  return (
    <AuthGate>
      <HomeInner />
    </AuthGate>
  );
}

function HomeInner() {
  const { prefs, createFromIntent, projects, session, setHomeMode } = useApp();
  const router = useRouter();
  const liveCount = projects.filter((p) => p.status === "live").length;
  const homeMode = prefs.homeMode || "build";

  return (
    <div className="min-h-screen flex flex-col blueprint-grid">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-caps m-0 mb-1">
              {session?.name ? `Hi, ${session.name}` : "Workspace"}
            </p>
            <h1 className="display text-[32px] m-0 leading-tight">
              {homeMode === "chat"
                ? "Simple chat"
                : prefs.mode === "builder"
                  ? "Build agentic apps"
                  : "Engineer agent systems"}
            </h1>
            <p className="mt-1.5 mb-0 text-sm" style={{ color: "var(--ink-muted)" }}>
              {homeMode === "chat"
                ? "Converse freely — promote any idea into a full docs + UI project when ready."
                : prefs.mode === "builder"
                  ? "One prompt builds Blueprint docs and Stage UI together — plus a crew."
                  : "Repos, multi-screen Stage, agents, diffs — same synthesizer, denser chrome."}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="seg">
              <button
                type="button"
                className={`seg-item ${homeMode === "build" ? "active" : ""}`}
                onClick={() => setHomeMode("build")}
              >
                Build project
              </button>
              <button
                type="button"
                className={`seg-item ${homeMode === "chat" ? "active" : ""}`}
                onClick={() => setHomeMode("chat")}
              >
                Simple chat
              </button>
            </div>
            <div className="card px-3 py-2 text-center min-w-[72px]">
              <div className="display text-xl leading-none">{projects.length}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
                Projects
              </div>
            </div>
            <div className="card px-3 py-2 text-center min-w-[72px]">
              <div className="display text-xl leading-none" style={{ color: "var(--signal)" }}>
                {liveCount}
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
                Live
              </div>
            </div>
          </div>
        </div>

        {homeMode === "build" ? (
          <div className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr] mb-8">
            <IntentComposer />
            <ConsultantPanel />
          </div>
        ) : (
          <div className="mb-8 max-w-3xl">
            <SimpleChat />
          </div>
        )}

        <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
          <h2 className="m-0 label-caps">Recent projects</h2>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.slice(0, 3).map((t) => (
              <button
                key={t.id}
                type="button"
                className="chip"
                onClick={() => {
                  const p = createFromIntent(`Build ${t.name}: ${t.pitch}`, t.id);
                  router.push(`/projects/${p.id}?view=build`);
                }}
              >
                + {t.name}
              </button>
            ))}
            <Link href="/projects/new" className="chip chip-accent">
              All templates
            </Link>
          </div>
        </div>
        <ProjectGrid />

        <div className="mt-8 card p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-sm">Judge walkthrough</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
              Home → novel prompt → watch docs+UI generate → Agents → or switch Simple chat → promote
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                const p = createFromIntent(
                  "Lead nurture for SaaS SDRs with email + Slack"
                );
                router.push(`/projects/${p.id}?view=build`);
              }}
            >
              Try novel prompt
            </button>
            <Link href="/projects/proj-lead-nurture?view=build" className="btn btn-primary btn-sm">
              Open seed project
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
