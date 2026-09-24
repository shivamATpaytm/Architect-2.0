"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

export function CodeView({ project }: { project: Project }) {
  const { prefs } = useApp();
  const [active, setActive] = useState(project.files[0]?.path);
  const file = project.files.find((f) => f.path === active) || project.files[0];

  if (prefs.mode === "builder") {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="sketch-empty max-w-md">
          <p className="display text-xl m-0 mb-2">Code is tucked away</p>
          <p className="m-0 text-sm mb-3">
            Switch to <strong>Architect</strong> mode for the file tree and diffs — or stay in
            Builder and keep steering from chat.
          </p>
          <p className="mono text-xs m-0" style={{ color: "var(--ink-muted)" }}>
            {project.files.length} files generated
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <aside
        className="w-56 shrink-0 border-r scroll-y p-2"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="text-xs uppercase tracking-wide px-2 py-1" style={{ color: "var(--ink-muted)" }}>
          Files
        </div>
        {project.files.map((f) => (
          <button
            key={f.path}
            type="button"
            className="btn btn-ghost w-full justify-start mono text-xs"
            style={{
              background: active === f.path ? "var(--accent-soft)" : "transparent",
              color: active === f.path ? "var(--accent)" : "var(--ink)",
            }}
            onClick={() => setActive(f.path)}
          >
            {f.path}
          </button>
        ))}
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="px-3 py-2 border-b mono text-xs"
          style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
        >
          {file?.path}
          {file?.diff ? " · +diff" : ""}
        </div>
        <pre
          className="scroll-y flex-1 m-0 p-4 mono text-xs leading-relaxed"
          style={{ background: "var(--bg)" }}
        >
          {file?.diff || file?.content || "// empty"}
        </pre>
      </div>
    </div>
  );
}
