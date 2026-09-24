"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

type Device = "desktop" | "tablet" | "mobile";

export function PreviewStage({ project }: { project: Project }) {
  const { prefs, showToast } = useApp();
  const [device, setDevice] = useState<Device>("desktop");
  const [tweak, setTweak] = useState(false);
  const width =
    device === "mobile" ? 360 : device === "tablet" ? 768 : "100%";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 border-b flex-wrap"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
            Stage
          </span>
          {project.status === "live" && <span className="live-pill">LIVE</span>}
        </div>
        <div className="flex items-center gap-1">
          {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
            <button
              key={d}
              type="button"
              className={`chip ${device === d ? "chip-accent" : ""}`}
              onClick={() => setDevice(d)}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => showToast("Preview refreshed")}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setTweak((v) => !v)}
          >
            Visual tweak
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 blueprint-grid overflow-auto">
        <div
          className="stage-frame mx-auto transition-all"
          style={{ width, maxWidth: "100%", minHeight: 420 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 border-b"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <span className="inline-flex gap-1">
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#c45c26" }} />
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#c9a227" }} />
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#2f6f5e" }} />
            </span>
            <span className="mono text-xs truncate" style={{ color: "var(--ink-muted)" }}>
              {project.deployUrl || `${slug(project.name)}.architect.new`}
            </span>
          </div>

          {project.previewReady ? (
            <LeadNurtureMock />
          ) : (
            <div className="sketch-empty m-4">
              <p className="display text-lg m-0 mb-1">Stage is empty</p>
              <p className="m-0 text-sm">
                Run <strong>Generate</strong> in chat to populate the preview.
              </p>
            </div>
          )}
        </div>

        {prefs.mode === "architect" && (
          <div className="card mt-3 p-3 mono text-xs" style={{ color: "var(--ink-muted)" }}>
            <div>console · 3 requests · 0 errors</div>
            <div>GET /api/leads 200 · POST /api/outreach 201</div>
          </div>
        )}
      </div>

      {tweak && (
        <div
          className="border-t p-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Visual tweak</span>
            <button type="button" className="chip" onClick={() => showToast("Accent → sage")}>
              Accent sage
            </button>
            <button type="button" className="chip" onClick={() => showToast("Density → compact")}>
              Compact
            </button>
            <button type="button" className="chip" onClick={() => showToast("Type → Newsreader headings")}>
              Display type
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setTweak(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadNurtureMock() {
  return (
    <div className="p-4" style={{ background: "var(--bg)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="display text-2xl m-0">Lead Nurture</h2>
          <p className="m-0 text-sm" style={{ color: "var(--ink-muted)" }}>
            Research → draft → QA → CRM
          </p>
        </div>
        <button type="button" className="btn btn-signal">
          Run outreach
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {[
          ["Leads queued", "128"],
          ["Drafts ready", "34"],
          ["CRM notes", "19"],
        ].map(([label, val]) => (
          <div key={label} className="card p-3">
            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
              {label}
            </div>
            <div className="display text-2xl">{val}</div>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--surface-2)" }}>
            <tr>
              <th className="text-left p-2 font-medium">Lead</th>
              <th className="text-left p-2 font-medium">Status</th>
              <th className="text-left p-2 font-medium">Hook</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Maya Chen · Northwind", "QA pass", "Series B + hiring SDRs"],
              ["Omar Patel · Cobalt", "Drafting", "Opened pricing page 3×"],
              ["Iris Ng · Lattice", "Researched", "Spoke at RevSummit"],
            ].map((row) => (
              <tr key={row[0]} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-2">{row[0]}</td>
                <td className="p-2">
                  <span className="chip chip-accent">{row[1]}</span>
                </td>
                <td className="p-2" style={{ color: "var(--ink-muted)" }}>
                  {row[2]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
