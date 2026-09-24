"use client";

import { AuthGate } from "@/components/chrome/AuthGate";
import { AppHeader } from "@/components/chrome/AppHeader";
import { IntentComposer } from "@/components/home/IntentComposer";
import { ProjectGrid } from "@/components/home/ProjectGrid";
import { ConsultantPanel } from "@/components/home/ConsultantPanel";
import { useApp } from "@/components/providers/AppProvider";
import { TEMPLATES } from "@/lib/mock/seed";
import { useRouter } from "next/navigation";

export default function HomePage() {
  return (
    <AuthGate>
      <HomeInner />
    </AuthGate>
  );
}

function HomeInner() {
  const { prefs, createFromIntent } = useApp();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col blueprint-grid">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto">
        <div className="mb-5">
          <h1 className="display text-3xl m-0">
            {prefs.mode === "builder" ? "Workspace" : "Engineering workspace"}
          </h1>
          <p className="mt-1 mb-0" style={{ color: "var(--ink-muted)" }}>
            {prefs.mode === "builder"
              ? "Outcomes first — templates, consultant ideas, and your live crews."
              : "Repos, agents, diffs, and scaffolds — same projects, denser chrome."}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr] mb-6">
          <IntentComposer />
          <ConsultantPanel />
        </div>

        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="m-0 text-sm uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
            Projects
          </h2>
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
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <ProjectGrid />
      </main>
    </div>
  );
}
