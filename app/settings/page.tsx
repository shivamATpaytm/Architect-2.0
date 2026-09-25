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
        <div>
          <h1 className="display text-[32px] m-0">Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            Preferences persist in localStorage. Mode never forks your projects.
          </p>
        </div>

        <div className="card p-5">
          <h2 className="m-0 label-caps mb-3">Profile</h2>
          <div className="flex items-center gap-3">
            <span className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
              {session?.name?.slice(0, 1).toUpperCase() || "U"}
            </span>
            <div>
              <p className="m-0 font-semibold">{session?.name}</p>
              <p className="m-0 mono text-sm" style={{ color: "var(--ink-muted)" }}>
                {session?.email}
              </p>
              <p className="m-0 mt-0.5 text-xs" style={{ color: "var(--ink-faint)" }}>
                Via {session?.provider}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="m-0 label-caps">Theme</h2>
          <div className="seg w-full" style={{ display: "flex" }}>
            {(["night", "day"] as Theme[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`seg-item flex-1 ${prefs.theme === t ? "active" : ""}`}
                onClick={() => {
                  setTheme(t);
                  showToast(`Theme → ${t}`);
                }}
              >
                {t === "night" ? "☾ Night" : "☀ Day"}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="m-0 label-caps">Default mode</h2>
          <p className="text-sm m-0" style={{ color: "var(--ink-muted)" }}>
            Applied on preference change. Toggle anytime with <span className="kbd">⌘.</span> /{" "}
            <span className="kbd">Ctrl.</span>
          </p>
          <div className="seg w-full" style={{ display: "flex" }}>
            {(["builder", "architect"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={`seg-item flex-1 ${prefs.defaultMode === m ? "active" : ""}`}
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
