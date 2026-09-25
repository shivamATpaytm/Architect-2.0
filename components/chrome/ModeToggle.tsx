"use client";

import { useApp } from "@/components/providers/AppProvider";

export function ModeToggle() {
  const { prefs, setMode } = useApp();
  return (
    <div className="seg" role="group" aria-label="Audience mode" title="Toggle with ⌘.">
      {(["builder", "architect"] as const).map((m) => (
        <button
          key={m}
          type="button"
          className={`seg-item ${prefs.mode === m ? "active" : ""}`}
          onClick={() => setMode(m)}
        >
          {m === "builder" ? "Builder" : "Architect"}
        </button>
      ))}
    </div>
  );
}
