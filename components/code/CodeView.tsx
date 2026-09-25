"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

export function CodeView({ project }: { project: Project }) {
  const { prefs, setMode, showToast } = useApp();
  const [active, setActive] = useState(project.files[0]?.path);
  const [tab, setTab] = useState<"content" | "diff">("content");
  const [peek, setPeek] = useState(false);
  const file = project.files.find((f) => f.path === active) || project.files[0];

  const tree = useMemo(() => {
    const dirs: Record<string, string[]> = {};
    for (const f of project.files) {
      const parts = f.path.split("/");
      const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : ".";
      const name = parts[parts.length - 1];
      (dirs[dir] ||= []).push(name);
    }
    return dirs;
  }, [project.files]);

  const copy = async () => {
    const text = tab === "diff" ? file?.diff || "" : file?.content || "";
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
  };

  if (prefs.mode === "builder" && !peek) {
    return (
      <div className="h-full flex items-center justify-center p-6 blueprint-grid">
        <div className="sketch-empty max-w-md">
          <p className="display text-xl m-0 mb-2">Code</p>
          <p className="m-0 text-sm mb-4">
            Peek read-only files here, or switch to <strong>Architect</strong> for the full
            tree and diffs.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button type="button" className="btn" onClick={() => setPeek(true)}>
              Peek code
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setMode("architect");
                showToast("Switched to Architect for Code");
              }}
            >
              Switch to Architect for Code
            </button>
          </div>
          <p className="mono text-xs mt-4 mb-0" style={{ color: "var(--ink-faint)" }}>
            {project.files.length} files · ⌘. toggles mode
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
        <div className="flex items-center justify-between px-2 py-2">
          <span className="label-caps">Files</span>
          {prefs.mode === "builder" && (
            <button type="button" className="chip" onClick={() => setPeek(false)}>
              Close peek
            </button>
          )}
        </div>
        {Object.entries(tree).map(([dir, names]) => (
          <div key={dir} className="mb-2">
            <div className="mono text-[10px] px-2 py-1" style={{ color: "var(--ink-faint)" }}>
              {dir}/
            </div>
            {names.map((name) => {
              const path = dir === "." ? name : `${dir}/${name}`;
              const f = project.files.find((x) => x.path === path);
              return (
                <button
                  key={path}
                  type="button"
                  className="btn btn-ghost w-full justify-start mono text-xs"
                  style={{
                    background: active === path ? "var(--accent-soft)" : "transparent",
                    color: active === path ? "var(--accent)" : "var(--ink)",
                    marginBottom: 2,
                  }}
                  onClick={() => {
                    setActive(path);
                    setTab(f?.diff ? "diff" : "content");
                  }}
                >
                  {name}
                  {f?.diff && (
                    <span
                      className="chip chip-signal"
                      style={{ marginLeft: "auto", fontSize: 9 }}
                    >
                      diff
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="px-3 py-2 border-b flex items-center justify-between gap-2 flex-wrap"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <span className="mono text-xs" style={{ color: "var(--ink-muted)" }}>
            {file?.path}
          </span>
          <div className="flex items-center gap-2">
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
            <button type="button" className="btn btn-sm" onClick={copy}>
              Copy
            </button>
          </div>
        </div>
        <pre
          className="scroll-y flex-1 m-0 p-4 mono text-xs leading-relaxed code-block"
          style={{ background: "var(--code-bg)", color: "var(--code-ink)" }}
        >
          <CodeColored
            text={
              tab === "diff"
                ? file?.diff || "// no diff for this file"
                : file?.content || "// empty"
            }
            language={file?.language || "ts"}
          />
        </pre>
      </div>
    </div>
  );
}

function CodeColored({ text }: { text: string; language?: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <div key={i}>
          {colorLine(line)}
          {"\n"}
        </div>
      ))}
    </>
  );
}

function colorLine(line: string) {
  if (line.startsWith("+"))
    return <span style={{ color: "#6dcea8" }}>{line}</span>;
  if (line.startsWith("-"))
    return <span style={{ color: "#e08a7a" }}>{line}</span>;
  if (line.trimStart().startsWith("//") || line.trimStart().startsWith("#"))
    return <span style={{ color: "#7a857e" }}>{line}</span>;
  const parts = line.split(/(\b(?:export|default|function|const|return|async|await|import|from)\b|".*?"|'.*?')/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^(export|default|function|const|return|async|await|import|from)$/.test(p))
          return (
            <span key={i} style={{ color: "#c9a227" }}>
              {p}
            </span>
          );
        if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'")))
          return (
            <span key={i} style={{ color: "#6dcea8" }}>
              {p}
            </span>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
