"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  building: "Building",
  live: "Live",
};

export function ProjectGrid() {
  const { projects } = useApp();

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
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}?view=build`}
          className="card p-4 block hover:border-[var(--accent)] transition-colors"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="m-0 text-[15px] font-semibold leading-snug">{p.name}</h3>
            {p.status === "live" ? (
              <span className="live-pill">LIVE</span>
            ) : (
              <span className="chip">{STATUS_LABEL[p.status]}</span>
            )}
          </div>
          <p className="m-0 text-sm" style={{ color: "var(--ink-muted)" }}>
            {p.pitch}
          </p>
          {p.deployUrl && (
            <p className="mono text-xs mt-3 mb-0" style={{ color: "var(--accent)" }}>
              {p.deployUrl}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
