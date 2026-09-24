"use client";

import { AuthGate } from "@/components/chrome/AuthGate";
import { AppHeader } from "@/components/chrome/AppHeader";
import { useApp } from "@/components/providers/AppProvider";
import type { Mode, Theme } from "@/lib/types";

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsInner />
    </AuthGate>
  );
}

function SettingsInner() {
  const { session, prefs, setTheme, setDefaultMode, setMode, showToast } = useApp();

  return (
    <div className="min-h-screen flex flex-col blueprint-grid">
      <AppHeader />
      <main className="flex-1 p-6 max-w-lg mx-auto w-full space-y-4">
        <h1 className="display text-3xl m-0">Settings</h1>

        <div className="card p-4">
          <h2 className="m-0 text-sm uppercase tracking-wide mb-3" style={{ color: "var(--ink-muted)" }}>
            Profile
          </h2>
          <p className="m-0 font-medium">{session?.name}</p>
          <p className="m-0 mono text-sm" style={{ color: "var(--ink-muted)" }}>
            {session?.email}
          </p>
          <p className="m-0 mt-1 text-xs" style={{ color: "var(--ink-muted)" }}>
            Via {session?.provider}
          </p>
        </div>

        <div className="card p-4 space-y-3">
          <h2 className="m-0 text-sm uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
            Theme
          </h2>
          <div className="flex gap-2">
            {(["night", "day"] as Theme[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`chip ${prefs.theme === t ? "chip-accent" : ""}`}
                onClick={() => {
                  setTheme(t);
                  showToast(`Theme → ${t}`);
                }}
              >
                {t === "night" ? "Night" : "Day"}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <h2 className="m-0 text-sm uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
            Default mode
          </h2>
          <p className="text-sm m-0" style={{ color: "var(--ink-muted)" }}>
            Applied on login and when you change preference here. Non-destructive to projects.
          </p>
          <div className="flex gap-2">
            {(["builder", "architect"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={`chip ${prefs.defaultMode === m ? "chip-accent" : ""}`}
                onClick={() => {
                  setDefaultMode(m);
                  setMode(m);
                  showToast(`Default mode → ${m}`);
                }}
              >
                {m === "builder" ? "Builder" : "Architect"}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
