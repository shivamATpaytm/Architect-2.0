"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

type Device = "desktop" | "tablet" | "mobile";

export function PreviewStage({ project }: { project: Project }) {
  const { prefs, showToast } = useApp();
  const router = useRouter();
  const [device, setDevice] = useState<Device>("desktop");
  const [tweak, setTweak] = useState(false);
  const [ran, setRan] = useState(false);
  const width = device === "mobile" ? 360 : device === "tablet" ? 768 : "100%";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5 border-b flex-wrap shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="label-caps">Stage</span>
          {project.status === "live" && <span className="live-pill">LIVE</span>}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <div className="seg">
            {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`seg-item ${device === d ? "active" : ""}`}
                onClick={() => setDevice(d)}
              >
                {d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => showToast("Preview refreshed")}>
            Refresh
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTweak((v) => !v)}>
            Visual tweak
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => router.push(`/projects/${project.id}?view=agents`)}
          >
            Agents
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 blueprint-grid overflow-auto">
        <div
          className="stage-frame mx-auto transition-all"
          style={{ width, maxWidth: "100%", minHeight: 440 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 border-b"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <span className="inline-flex gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#c45c26" }} />
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#c9a227" }} />
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: "#2a6b5a" }} />
            </span>
            <span
              className="mono text-xs truncate flex-1 px-2 py-0.5 rounded"
              style={{ color: "var(--ink-muted)", background: "var(--bg)" }}
            >
              {project.deployUrl || `${slug(project.name)}.architect.new`}
            </span>
          </div>

          {project.previewReady ? (
            <LeadNurtureMock
              ran={ran}
              onRun={() => {
                setRan(true);
                showToast("Outreach crew running — 3 drafts queued");
              }}
            />
          ) : (
            <div className="sketch-empty m-5">
              <p className="display text-xl m-0 mb-1">Stage is empty</p>
              <p className="m-0 text-sm mb-3">
                Run <strong>Generate</strong> in chat to populate the preview.
              </p>
              <p className="m-0 text-xs mono" style={{ color: "var(--ink-faint)" }}>
                Consulting → Blueprint → Crew → Stage
              </p>
            </div>
          )}
        </div>

        {prefs.mode === "architect" && project.previewReady && (
          <div className="card mt-3 p-3 mono text-[11px] fade-in" style={{ color: "var(--ink-muted)" }}>
            <div className="flex justify-between mb-1">
              <span>console · network</span>
              <span style={{ color: "var(--ok)" }}>0 errors</span>
            </div>
            <div>GET /api/leads 200 · 42ms</div>
            <div>POST /api/outreach 201 · 118ms</div>
            <div>WS /agents/stream connected</div>
          </div>
        )}
      </div>

      {tweak && (
        <div
          className="border-t p-3 shrink-0 fade-in"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold">Visual tweak</span>
            <button type="button" className="chip" onClick={() => showToast("Accent → sage applied")}>
              Accent sage
            </button>
            <button type="button" className="chip" onClick={() => showToast("Density → compact")}>
              Compact
            </button>
            <button type="button" className="chip" onClick={() => showToast("Type → Newsreader headings")}>
              Display type
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTweak(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadNurtureMock({ ran, onRun }: { ran: boolean; onRun: () => void }) {
  return (
    <div className="p-5" style={{ background: "var(--bg)" }}>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <div className="label-caps mb-1">Outreach desk</div>
          <h2 className="display text-[28px] m-0">Lead Nurture</h2>
          <p className="m-0 text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            Research → draft → QA → CRM
          </p>
        </div>
        <button type="button" className="btn btn-signal" onClick={onRun}>
          {ran ? "Run again" : "Run outreach"}
        </button>
      </div>

      {ran && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-sm fade-in"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          Crew running — Researcher finished · Copywriter drafting · Brand QA queued
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {[
          ["Leads queued", ran ? "125" : "128"],
          ["Drafts ready", ran ? "37" : "34"],
          ["CRM notes", ran ? "22" : "19"],
        ].map(([label, val]) => (
          <div key={label} className="card p-3.5">
            <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
              {label}
            </div>
            <div className="display text-[26px] mt-0.5">{val}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--surface-2)" }}>
            <tr>
              <th className="text-left p-2.5 font-medium">Lead</th>
              <th className="text-left p-2.5 font-medium">Status</th>
              <th className="text-left p-2.5 font-medium hidden sm:table-cell">Hook</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Maya Chen · Northwind", ran ? "Sending" : "QA pass", "Series B + hiring SDRs"],
              ["Omar Patel · Cobalt", "Drafting", "Opened pricing page 3×"],
              ["Iris Ng · Lattice", "Researched", "Spoke at RevSummit"],
            ].map((row) => (
              <tr key={row[0]} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-2.5 font-medium">{row[0]}</td>
                <td className="p-2.5">
                  <span className={`chip ${row[1] === "Sending" ? "chip-signal" : "chip-accent"}`}>
                    {row[1]}
                  </span>
                </td>
                <td className="p-2.5 hidden sm:table-cell" style={{ color: "var(--ink-muted)" }}>
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
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
