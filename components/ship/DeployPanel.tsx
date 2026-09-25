"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

export function DeployPanel({ project }: { project: Project }) {
  const { updateProject, prefs, showToast } = useApp();
  const [prod, setProd] = useState(project.status === "live");
  const [domain, setDomain] = useState(
    project.deployUrl || `${slug(project.name)}.architect.new`
  );
  const [custom, setCustom] = useState("");
  const [analytics, setAnalytics] = useState(true);
  const [marketplace, setMarketplace] = useState(false);
  const [vpc, setVpc] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [ghConnected, setGhConnected] = useState(project.githubConnected);
  const [copied, setCopied] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const deploy = async () => {
    if (deploying) return;
    setDeploying(true);
    showToast("Deploy queued…");
    await new Promise((r) => setTimeout(r, 500));
    const url = domain || `${slug(project.name)}.architect.new`;
    updateProject(project.id, {
      status: "live",
      deployUrl: url,
      phase: "stage",
      previewReady: true,
      githubConnected: ghConnected,
      buildProgress: {
        state: "ready",
        stepLabel: "Live on Stage",
        etaLabel: "Done",
        startedAt: new Date().toISOString(),
        percent: 100,
      },
    });
    setProd(true);
    setConfetti(true);
    showToast(`Live · ${url}`);
    setTimeout(() => setConfetti(false), 1300);
    setDeploying(false);
  };

  const openPR = () => {
    const number =
      (project.pullRequests?.reduce((m, pr) => Math.max(m, pr.number), 0) || 11) + 1;
    const repo = project.githubRepo || "acme/" + slug(project.name);
    const pr = {
      number,
      title: `chore: sync Architect crew · ${new Date().toLocaleDateString("en-IN")}`,
      url: `https://github.com/${repo}/pull/${number}`,
      createdAt: new Date().toISOString(),
    };
    updateProject(project.id, {
      pullRequests: [pr, ...(project.pullRequests || [])],
      lastSync: new Date().toISOString(),
    });
    showToast(`Opened PR #${number}`);
  };

  const copyUrl = async () => {
    const url = project.deployUrl || domain;
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopied(true);
      showToast("URL copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast(`https://${url}`);
    }
  };

  return (
    <div className="scroll-y h-full p-5">
      {confetti && <div className="confetti-burst" />}
      <div className="max-w-4xl mx-auto">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="display text-[28px] m-0">Ship</h2>
            <p className="text-sm mt-1 mb-0" style={{ color: "var(--ink-muted)" }}>
              {prefs.mode === "builder"
                ? "One-click publish to *.architect.new — share the live Stage URL."
                : "Env, domain, GitHub branch, and VPC toggles. Demo deploy simulation."}
            </p>
          </div>
          {project.status === "live" && project.deployUrl && (
            <span className="live-pill">LIVE · {project.deployUrl}</span>
          )}
        </div>

        <div
          className={`grid gap-4 ${prefs.mode === "architect" ? "lg:grid-cols-2" : "max-w-xl"}`}
        >
          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <h3 className="m-0 label-caps">Environments</h3>
              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Preview</div>
                  <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                    Always on for Stage
                  </div>
                </div>
                <span className="chip chip-accent">On</span>
              </label>
              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Production</div>
                  <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
                    Public *.architect.new
                  </div>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${prod ? "on" : ""}`}
                  aria-pressed={prod}
                  onClick={() => setProd((v) => !v)}
                />
              </label>
            </div>

            <div className="card p-4 space-y-3">
              <h3 className="m-0 label-caps">Domain</h3>
              <input
                className="input mono"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
              {prefs.mode === "architect" && (
                <input
                  className="input"
                  placeholder="custom domain (optional)"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-signal"
                onClick={deploy}
                disabled={deploying}
              >
                {deploying
                  ? "Deploying…"
                  : project.status === "live"
                    ? "Redeploy"
                    : "Deploy"}
              </button>
              {(project.deployUrl || domain) && (
                <>
                  <button type="button" className="btn" onClick={copyUrl}>
                    {copied ? "Copied" : "Copy URL"}
                  </button>
                  <a
                    className="mono text-xs"
                    style={{ color: "var(--accent)" }}
                    href={`https://${project.deployUrl || domain}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://{project.deployUrl || domain}
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="m-0 label-caps">GitHub</h3>
                <span className="chip">Demo</span>
              </div>
              {!ghConnected ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setGhConnected(true);
                    updateProject(project.id, {
                      githubConnected: true,
                      githubRepo: "acme/" + slug(project.name),
                      lastSync: new Date().toISOString(),
                    });
                    showToast("GitHub connected");
                  }}
                >
                  Connect GitHub
                </button>
              ) : (
                <div className="space-y-2.5">
                  <p className="m-0 mono text-sm font-medium">
                    {project.githubRepo || "acme/" + slug(project.name)}
                  </p>
                  <p className="m-0 text-xs" style={{ color: "var(--ink-muted)" }}>
                    Last sync{" "}
                    {project.lastSync
                      ? new Date(project.lastSync).toLocaleString("en-IN", {
                          timeZone: "Asia/Calcutta",
                        }) + " IST"
                      : "just now"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip chip-accent">Architect → GitHub</span>
                    <span className="chip">2-way</span>
                    <button type="button" className="btn btn-sm" onClick={openPR}>
                      Open PR
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        updateProject(project.id, {
                          lastSync: new Date().toISOString(),
                        });
                        showToast("Synced with GitHub");
                      }}
                    >
                      Sync now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {(project.pullRequests?.length ?? 0) > 0 && (
              <div className="card p-4 space-y-2 fade-in">
                <h3 className="m-0 label-caps">Pull requests</h3>
                {project.pullRequests.map((pr) => (
                  <div
                    key={pr.number}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-lg"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <div>
                      <div className="text-sm font-semibold">
                        #{pr.number} · {pr.title}
                      </div>
                      <a
                        className="mono text-xs"
                        style={{ color: "var(--accent)" }}
                        href={pr.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {pr.url}
                      </a>
                    </div>
                    <span className="chip chip-signal shrink-0">Open</span>
                  </div>
                ))}
              </div>
            )}

            {prefs.mode === "architect" && (
              <div className="card p-4 space-y-3 fade-in">
                <h3 className="m-0 label-caps">Advanced</h3>
                <ToggleRow
                  label="Analytics"
                  hint="Page views on Stage"
                  on={analytics}
                  set={setAnalytics}
                />
                <ToggleRow
                  label="Marketplace publish"
                  hint="List in Architect marketplace"
                  on={marketplace}
                  set={setMarketplace}
                />
                <ToggleRow
                  label="VPC / private deploy"
                  hint="Enterprise network (demo toggle)"
                  on={vpc}
                  set={setVpc}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  set,
}: {
  label: string;
  hint?: string;
  on: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && (
          <div className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {hint}
          </div>
        )}
      </div>
      <button
        type="button"
        className={`toggle-switch ${on ? "on" : ""}`}
        aria-pressed={on}
        onClick={() => set(!on)}
      />
    </label>
  );
}

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
