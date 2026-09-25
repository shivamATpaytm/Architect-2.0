"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

type Device = "desktop" | "tablet" | "mobile";

export function PreviewStage({ project }: { project: Project }) {
  const { prefs, showToast, updateProject } = useApp();
  const router = useRouter();
  const [device, setDevice] = useState<Device>("desktop");
  const [tweak, setTweak] = useState(false);
  const runningRef = useRef(false);
  const width = device === "mobile" ? 360 : device === "tablet" ? 768 : "100%";
  const outreach = project.outreach ?? {
    status: "idle" as const,
    counts: { leads: 128, drafts: 34, crm: 19 },
    logs: [] as string[],
  };

  const runOutreach = async () => {
    if (runningRef.current) return;
    if (outreach.status === "queued" || outreach.status === "running") return;
    runningRef.current = true;

    const base = outreach.counts;
    const startLogs = [`[${ts()}] QUEUED outreach batch`];
    updateProject(project.id, {
      outreach: {
        status: "queued",
        startedAt: new Date().toISOString(),
        counts: base,
        logs: startLogs,
      },
    });
    showToast("Outreach queued");

    await wait(600);
    updateProject(project.id, {
      outreach: {
        status: "running",
        startedAt: new Date().toISOString(),
        counts: { ...base, leads: Math.max(0, base.leads - 3) },
        logs: [
          ...startLogs,
          `[${ts()}] RUNNING researcher · scanning ICP`,
          `[${ts()}] POST /api/outreach 201`,
        ],
      },
      agents: project.agents.map((a) =>
        a.id === "agent-researcher" ? { ...a, status: "running" as const } : a
      ),
    });

    await wait(900);
    updateProject(project.id, {
      outreach: {
        status: "running",
        startedAt: new Date().toISOString(),
        counts: {
          leads: Math.max(0, base.leads - 3),
          drafts: base.drafts + 3,
          crm: base.crm + 1,
        },
        logs: [
          ...startLogs,
          `[${ts()}] RUNNING researcher · scanning ICP`,
          `[${ts()}] POST /api/outreach 201`,
          `[${ts()}] Copywriter drafted 3 emails`,
          `[${ts()}] Brand QA scored · 2 pass / 1 revise`,
        ],
      },
      agents: project.agents.map((a) => {
        if (a.id === "agent-researcher") return { ...a, status: "ready" as const };
        if (a.id === "agent-copywriter" || a.id === "agent-brand-qa")
          return { ...a, status: "running" as const };
        return a;
      }),
    });

    await wait(800);
    const fail = Math.random() < 0.08;
    if (fail) {
      updateProject(project.id, {
        outreach: {
          status: "fail",
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          counts: {
            leads: Math.max(0, base.leads - 3),
            drafts: base.drafts + 1,
            crm: base.crm,
          },
          logs: [
            ...startLogs,
            `[${ts()}] RUNNING researcher · scanning ICP`,
            `[${ts()}] POST /api/outreach 201`,
            `[${ts()}] FAIL HubSpot rate limit — retry later`,
          ],
        },
        agents: project.agents.map((a) =>
          a.id.startsWith("agent-") ? { ...a, status: "ready" as const } : a
        ),
      });
      showToast("Outreach failed — HubSpot rate limit");
    } else {
      updateProject(project.id, {
        outreach: {
          status: "done",
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          counts: {
            leads: Math.max(0, base.leads - 3),
            drafts: base.drafts + 3,
            crm: base.crm + 3,
          },
          logs: [
            ...startLogs,
            `[${ts()}] RUNNING researcher · scanning ICP`,
            `[${ts()}] POST /api/outreach 201`,
            `[${ts()}] Copywriter drafted 3 emails`,
            `[${ts()}] Brand QA scored · 2 pass / 1 revise`,
            `[${ts()}] CRM Writer logged 3 notes`,
            `[${ts()}] DONE outreach batch`,
          ],
        },
        agents: project.agents.map((a) =>
          a.id.startsWith("agent-") ? { ...a, status: "ready" as const } : a
        ),
      });
      showToast("Outreach complete — 3 drafts ready");
    }
    runningRef.current = false;
  };

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
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => showToast("Preview refreshed")}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setTweak((v) => !v)}
          >
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
            <LeadNurtureMock outreach={outreach} onRun={runOutreach} />
          ) : (
            <div className="sketch-empty m-5">
              <p className="display text-xl m-0 mb-1">Stage is empty</p>
              <p className="m-0 text-sm mb-3">
                {project.buildProgress
                  ? `${project.buildProgress.stepLabel} · ${project.buildProgress.etaLabel}`
                  : "Run Generate in chat to populate the preview."}
              </p>
              {project.buildProgress && (
                <div
                  className="mx-auto max-w-xs h-1.5 rounded-full overflow-hidden mb-3"
                  style={{ background: "var(--surface-3)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${project.buildProgress.percent}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
              )}
              <p className="m-0 text-xs mono" style={{ color: "var(--ink-faint)" }}>
                Queued → Building → Ready
              </p>
            </div>
          )}
        </div>

        {(prefs.mode === "architect" || (outreach.logs && outreach.logs.length > 0)) &&
          project.previewReady && (
            <div
              className="card mt-3 p-3 mono text-[11px] fade-in"
              style={{ color: "var(--ink-muted)" }}
            >
              <div className="flex justify-between mb-1">
                <span>console · network</span>
                <span
                  style={{
                    color:
                      outreach.status === "fail"
                        ? "var(--danger)"
                        : outreach.status === "done"
                          ? "var(--ok)"
                          : "var(--ink-muted)",
                  }}
                >
                  {outreach.status === "fail"
                    ? "1 error"
                    : outreach.status === "running" || outreach.status === "queued"
                      ? "live"
                      : "0 errors"}
                </span>
              </div>
              {(outreach.logs.length
                ? outreach.logs
                : [
                    "GET /api/leads 200 · 42ms",
                    "POST /api/outreach 201 · 118ms",
                    "WS /agents/stream connected",
                  ]
              ).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
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
            <button
              type="button"
              className="chip"
              onClick={() => showToast("Accent → sage applied")}
            >
              Accent sage
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => showToast("Density → compact")}
            >
              Compact
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

function LeadNurtureMock({
  outreach,
  onRun,
}: {
  outreach: NonNullable<Project["outreach"]>;
  onRun: () => void;
}) {
  const busy = outreach.status === "queued" || outreach.status === "running";
  const statusLabel =
    outreach.status === "queued"
      ? "Queued…"
      : outreach.status === "running"
        ? "Running…"
        : outreach.status === "done"
          ? "Run again"
          : outreach.status === "fail"
            ? "Retry outreach"
            : "Run outreach";

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
        <button type="button" className="btn btn-signal" onClick={onRun} disabled={busy}>
          {statusLabel}
        </button>
      </div>

      {busy && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-sm fade-in"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {outreach.status === "queued"
            ? "Queued — waiting for crew slot…"
            : "Crew running — Researcher → Copywriter → Brand QA → CRM"}
        </div>
      )}
      {outreach.status === "done" && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-sm fade-in"
          style={{ background: "var(--accent-soft)", color: "var(--ok)" }}
        >
          Done — drafts updated · CRM notes logged
        </div>
      )}
      {outreach.status === "fail" && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-sm fade-in"
          style={{ background: "var(--signal-soft)", color: "var(--danger)" }}
        >
          Failed — connector error. Retry when ready.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {[
          ["Leads queued", String(outreach.counts.leads)],
          ["Drafts ready", String(outreach.counts.drafts)],
          ["CRM notes", String(outreach.counts.crm)],
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
              [
                "Maya Chen · Northwind",
                outreach.status === "done"
                  ? "Sending"
                  : outreach.status === "running"
                    ? "Researching"
                    : "QA pass",
                "Series B + hiring SDRs",
              ],
              [
                "Omar Patel · Cobalt",
                outreach.status === "done" ? "Draft ready" : "Drafting",
                "Opened pricing page 3×",
              ],
              [
                "Iris Ng · Lattice",
                outreach.status === "running" ? "Queued" : "Researched",
                "Spoke at RevSummit",
              ],
            ].map((row) => (
              <tr key={row[0]} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-2.5 font-medium">{row[0]}</td>
                <td className="p-2.5">
                  <span
                    className={`chip ${row[1] === "Sending" || row[1] === "Draft ready" ? "chip-signal" : "chip-accent"}`}
                  >
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

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function ts() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
