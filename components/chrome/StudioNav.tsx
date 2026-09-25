"use client";

import Link from "next/link";
import type { StudioView } from "@/lib/types";

const NAV: { view: StudioView; label: string }[] = [
  { view: "build", label: "Build" },
  { view: "blueprint", label: "Blueprint" },
  { view: "agents", label: "Agents" },
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
      className="flex items-end gap-0.5 px-3 pt-1 border-b overflow-x-auto"
      style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
      aria-label="Studio views"
    >
      {NAV.map((item) => {
        const active = view === item.view;
        const badge = item.view === "agents" ? crewCount : undefined;
        return (
          <Link
            key={item.view}
            href={`/projects/${projectId}?view=${item.view}`}
            className={`studio-tab ${active ? "active" : ""}`}
          >
            {item.label}
            {typeof badge === "number" && badge > 0 && (
              <span className="chip chip-accent" style={{ padding: "0.05rem 0.4rem" }}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
      <span className="mx-2 self-center" style={{ color: "var(--border-strong)", fontSize: 12 }}>
        ·
      </span>
      {EXTRA.map((item) => {
        const active = view === item.view;
        return (
          <Link
            key={item.view}
            href={`/projects/${projectId}?view=${item.view}`}
            className={`studio-tab ${active ? "active" : ""}`}
            style={{ fontSize: 12.5, opacity: active ? 1 : 0.75 }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
