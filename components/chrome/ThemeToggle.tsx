"use client";

import { useApp } from "@/components/providers/AppProvider";

export function ThemeToggle() {
  const { prefs, setTheme } = useApp();
  const next = prefs.theme === "night" ? "day" : "night";
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => setTheme(next)}
      title={`Switch to ${next}`}
      aria-label={`Theme: ${prefs.theme}`}
    >
      {prefs.theme === "night" ? "Night" : "Day"}
    </button>
  );
}
