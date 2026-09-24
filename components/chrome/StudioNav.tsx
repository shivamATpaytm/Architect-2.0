"use client";

import Link from "next/link";
import type { StudioView } from "@/lib/types";

const NAV: { view: StudioView; label: string; badge?: number }[] = [
  { view: "build", label: "Build" },
  { view: "blueprint", label: "Blueprint" },
  { view: "agents", label: "Agents", badge: 4 },
  { view: "code", label: "Code" },
  { view: "ship", label: "Ship" },
];

const EXTRA: { view: StudioView; label: string }[] = [
  { view: "data", label: "Data" },
  { view: "integrations", label: "Integrations" },
];

export function StudioNav({
  projectId,
  view,
  crewCount,
}: {
  projectId: string;
  view: StudioView;
  crewCount?: number;
}) {
  return (
    <nav
      className="flex items-center gap-1 px-3 py-2 border-b overflow-x-auto"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
      aria-label="Studio views"
    >
      {NAV.map((item) => {
        const active = view === item.view;
        const badge = item.view === "agents" ? crewCount : undefined;
        return (
          <Link
            key={item.view}
            href={`/projects/${projectId}?view=${item.view}`}
            className="btn"
            style={{
              background: active ? "var(--accent-soft)" : "transparent",
              borderColor: active ? "transparent" : "transparent",
              color: active ? "var(--accent)" : "var(--ink-muted)",
              fontWeight: active ? 600 : 450,
              padding: "0.4rem 0.75rem",
            }}
          >
            {item.label}
            {typeof badge === "number" && badge > 0 && (
              <span className="chip chip-accent" style={{ marginLeft: 4 }}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
      <span className="mx-1" style={{ color: "var(--border-strong)" }}>
        |
      </span>
      {EXTRA.map((item) => {
        const active = view === item.view;
        return (
          <Link
            key={item.view}
            href={`/projects/${projectId}?view=${item.view}`}
            className="btn btn-ghost"
            style={{
              color: active ? "var(--accent)" : "var(--ink-muted)",
              fontWeight: active ? 600 : 400,
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
