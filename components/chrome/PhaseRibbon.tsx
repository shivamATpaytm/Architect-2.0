"use client";

import type { Phase } from "@/lib/types";

const PHASES: Phase[] = ["consulting", "blueprint", "crew", "stage"];

const LABELS: Record<Phase, string> = {
  consulting: "Consulting",
  blueprint: "Blueprint",
  crew: "Crew",
  stage: "Stage",
};

export function PhaseRibbon({ phase }: { phase: Phase }) {
  const idx = PHASES.indexOf(phase);
  return (
    <div className="phase-ribbon" aria-label="Build phase">
      {PHASES.map((p, i) => {
        const cls =
          i < idx ? "phase-step done" : i === idx ? "phase-step active" : "phase-step";
        return (
          <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <span className="phase-connector" aria-hidden />}
            <span className={cls}>
              {i < idx ? "✓" : i === idx ? "●" : "○"} {LABELS[p]}
            </span>
          </span>
        );
      })}
    </div>
  );
}
