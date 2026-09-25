"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  building: "Building",
  live: "Live",
};

export function ProjectGrid() {
  const { projects, prefs } = useApp();

  if (!projects.length) {
    return (
      <div className="sketch-empty">
        <p className="display text-xl m-0 mb-2">No projects yet</p>
        <p className="m-0 text-sm">Compose an intent or open a template to begin.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => {
        const crew = p.agents.filter((a) => a.id.startsWith("agent-")).length;
        return (
          <Link
            key={p.id}
            href={`/projects/${p.id}?view=build`}
            className="card card-hover p-4 block fade-in"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="m-0 text-[15px] font-semibold leading-snug">{p.name}</h3>
              {p.status === "live" ? (
                <span className="live-pill">LIVE</span>
              ) : (
                <span className="chip">{STATUS_LABEL[p.status]}</span>
              )}
            </div>
            <p className="m-0 text-sm line-clamp-2" style={{ color: "var(--ink-muted)" }}>
              {p.pitch}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="chip">{crew} agents</span>
              <span className="chip">{p.phase}</span>
              {prefs.mode === "architect" && p.githubConnected && (
                <span className="chip chip-accent">GitHub</span>
              )}
            </div>
            {p.deployUrl && (
              <p className="mono text-xs mt-3 mb-0" style={{ color: "var(--accent)" }}>
                {p.deployUrl}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
