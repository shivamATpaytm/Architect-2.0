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

  const deploy = () => {
    const url = domain || `lead-nurture.architect.new`;
    updateProject(project.id, {
      status: "live",
      deployUrl: url,
      phase: "stage",
      previewReady: true,
      githubConnected: ghConnected,
    });
    setProd(true);
    setConfetti(true);
    showToast(`Deployed · ${url}`);
    setTimeout(() => setConfetti(false), 1200);
  };

  return (
    <div className="scroll-y h-full p-4 max-w-3xl mx-auto space-y-4">
      {confetti && <div className="confetti-burst" />}
      <div>
        <h2 className="display text-2xl m-0">Ship</h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          {prefs.mode === "builder"
            ? "One-click publish to *.architect.new"
            : "Env, domain, GitHub branch, and VPC toggles (UI only)"}
        </p>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="m-0 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
          Environments
        </h3>
        <label className="flex items-center justify-between gap-3">
          <span>Preview (always on)</span>
          <span className="chip chip-accent">On</span>
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Production</span>
          <button
            type="button"
            className={`chip ${prod ? "chip-signal" : ""}`}
            onClick={() => setProd((v) => !v)}
          >
            {prod ? "Enabled" : "Off"}
          </button>
        </label>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="m-0 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
          Domain
        </h3>
        <input className="input mono" value={domain} onChange={(e) => setDomain(e.target.value)} />
        {prefs.mode === "architect" && (
          <input
            className="input"
            placeholder="custom domain (optional)"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        )}
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="m-0 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
          GitHub
        </h3>
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
              showToast("GitHub connected (mock)");
            }}
          >
            Connect GitHub
          </button>
        ) : (
          <div className="space-y-2">
            <p className="m-0 mono text-sm">{project.githubRepo || "acme/lead-nurture-crew"}</p>
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
              <button type="button" className="btn" onClick={() => showToast("PR opened (mock)")}>
                Open PR
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  updateProject(project.id, { lastSync: new Date().toISOString() });
                  showToast("Synced");
                }}
              >
                Sync now
              </button>
            </div>
          </div>
        )}
      </div>

      {prefs.mode === "architect" && (
        <div className="card p-4 space-y-3">
          <h3 className="m-0 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
            Advanced
          </h3>
          <ToggleRow label="Analytics" on={analytics} set={setAnalytics} />
          <ToggleRow label="Marketplace publish" on={marketplace} set={setMarketplace} />
          <ToggleRow label="VPC / private deploy" on={vpc} set={setVpc} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-signal" onClick={deploy}>
          {project.status === "live" ? "Redeploy" : "Deploy"}
        </button>
        {project.deployUrl && (
          <a
            className="mono text-sm"
            style={{ color: "var(--accent)" }}
            href={`https://${project.deployUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            https://{project.deployUrl}
          </a>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  on,
  set,
}: {
  label: string;
  on: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <button type="button" className={`chip ${on ? "chip-accent" : ""}`} onClick={() => set(!on)}>
        {on ? "On" : "Off"}
      </button>
    </label>
  );
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
