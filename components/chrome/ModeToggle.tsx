"use client";

import { useApp } from "@/components/providers/AppProvider";

export function ModeToggle() {
  const { prefs, setMode } = useApp();
  return (
    <div
      className="inline-flex rounded-[6px] border p-[2px]"
      style={{ borderColor: "var(--border-strong)", background: "var(--surface-2)" }}
      role="group"
      aria-label="Audience mode"
    >
      {(["builder", "architect"] as const).map((m) => (
        <button
          key={m}
          type="button"
          className="btn"
          style={{
            border: "none",
            borderRadius: 4,
            padding: "0.3rem 0.65rem",
            background: prefs.mode === m ? "var(--surface)" : "transparent",
            color: prefs.mode === m ? "var(--ink)" : "var(--ink-muted)",
            fontWeight: prefs.mode === m ? 600 : 400,
            boxShadow: prefs.mode === m ? "var(--shadow)" : "none",
          }}
          onClick={() => setMode(m)}
        >
          {m === "builder" ? "Builder" : "Architect"}
        </button>
      ))}
    </div>
  );
}
