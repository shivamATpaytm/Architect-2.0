"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

export function CodeView({ project }: { project: Project }) {
  const { prefs, setMode, showToast } = useApp();
  const [active, setActive] = useState(project.files[0]?.path);
  const [tab, setTab] = useState<"content" | "diff">("content");
  const file = project.files.find((f) => f.path === active) || project.files[0];

  if (prefs.mode === "builder") {
    return (
      <div className="h-full flex items-center justify-center p-6 blueprint-grid">
        <div className="sketch-empty max-w-md">
          <p className="display text-xl m-0 mb-2">Code is tucked away</p>
          <p className="m-0 text-sm mb-4">
            Switch to <strong>Architect</strong> mode for the file tree and diffs — or stay in
            Builder and keep steering from chat.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setMode("architect");
              showToast("Switched to Architect mode");
            }}
          >
            Switch to Architect
          </button>
          <p className="mono text-xs mt-4 mb-0" style={{ color: "var(--ink-faint)" }}>
            {project.files.length} files generated · ⌘. toggles mode
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <aside
        className="w-60 shrink-0 border-r scroll-y p-2"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="label-caps px-2 py-2">Files</div>
        {project.files.map((f) => (
          <button
            key={f.path}
            type="button"
            className="btn btn-ghost w-full justify-start mono text-xs"
            style={{
              background: active === f.path ? "var(--accent-soft)" : "transparent",
              color: active === f.path ? "var(--accent)" : "var(--ink)",
              marginBottom: 2,
            }}
            onClick={() => {
              setActive(f.path);
              setTab(f.diff ? "diff" : "content");
            }}
          >
            {f.path}
            {f.diff && <span className="chip chip-signal" style={{ marginLeft: "auto", fontSize: 9 }}>diff</span>}
          </button>
        ))}
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="px-3 py-2 border-b flex items-center justify-between gap-2"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <span className="mono text-xs" style={{ color: "var(--ink-muted)" }}>
            {file?.path}
          </span>
          <div className="seg">
            <button
              type="button"
              className={`seg-item ${tab === "content" ? "active" : ""}`}
              onClick={() => setTab("content")}
            >
              Content
            </button>
            <button
              type="button"
              className={`seg-item ${tab === "diff" ? "active" : ""}`}
              onClick={() => setTab("diff")}
              disabled={!file?.diff}
            >
              Diff
            </button>
          </div>
        </div>
        <pre
          className="scroll-y flex-1 m-0 p-4 mono text-xs leading-relaxed"
          style={{
            background: "var(--code-bg)",
            color: "var(--code-ink)",
          }}
        >
          {tab === "diff" ? file?.diff || "// no diff for this file" : file?.content || "// empty"}
        </pre>
      </div>
    </div>
  );
}
