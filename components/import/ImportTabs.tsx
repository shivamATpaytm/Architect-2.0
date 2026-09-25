"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

const TABS = [
  { id: "upload", label: "Upload", hint: "Zip of an existing app" },
  { id: "github", label: "GitHub", hint: "Repo → Architect project" },
  { id: "studio", label: "Studio", hint: "Import a Lyzr Studio agent" },
  { id: "url", label: "URL", hint: "Clone from a live app URL" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ImportTabs() {
  const params = useSearchParams();
  const initial = (params.get("tab") as TabId) || "upload";
  const [tab, setTab] = useState<TabId>(
    TABS.some((t) => t.id === initial) ? initial : "upload"
  );
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const { createFromImport, showToast } = useApp();
  const router = useRouter();

  const placeholder = useMemo(() => {
    switch (tab) {
      case "upload":
        return "lead-nurture.zip";
      case "github":
        return "acme/lead-nurture-crew";
      case "studio":
        return "studio-agent-id or name";
      case "url":
        return "https://example.com/app";
    }
  }, [tab]);

  const start = async () => {
    if (!value.trim() && tab !== "upload") {
      showToast("Enter a value to import");
      return;
    }
    setBusy(true);
    setSteps([]);
    const sequence = [
      "Validating source…",
      "Hydrating agents & tools…",
      "Seeding Blueprint…",
      "Opening Build view…",
    ];
    for (const s of sequence) {
      setSteps((prev) => [...prev, s]);
      await wait(420);
    }
    const label =
      value.trim() ||
      (tab === "upload" ? "Uploaded Crew" : tab === "studio" ? "Studio Agent" : "Imported App");
    const source =
      tab === "upload"
        ? "Upload"
        : tab === "github"
          ? "GitHub"
          : tab === "studio"
            ? "Studio"
            : "URL";
    const project = createFromImport(source, label);
    showToast(`Imported ${label}`);
    router.push(`/projects/${project.id}?view=build&panel=preview`);
  };

  return (
    <div className="card p-6 max-w-xl mx-auto" style={{ boxShadow: "var(--shadow)" }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="btn"
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
              padding: "0.65rem 0.7rem",
              background: tab === t.id ? "var(--accent-soft)" : "var(--surface)",
              borderColor: tab === t.id ? "var(--accent)" : "var(--border)",
              color: tab === t.id ? "var(--accent)" : "var(--ink)",
            }}
            onClick={() => {
              setTab(t.id);
              setSteps([]);
            }}
          >
            <span className="font-semibold text-sm">{t.label}</span>
            <span className="text-[10px]" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
              {t.hint}
            </span>
          </button>
        ))}
      </div>
      <label className="label-caps block mb-1.5">
        {tab === "upload" && "Zip filename (mock)"}
        {tab === "github" && "Repository"}
        {tab === "studio" && "Studio agent"}
        {tab === "url" && "App URL"}
      </label>
      <input
        className="input mono"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !busy && start()}
      />
      {tab === "upload" && (
        <p className="text-xs mt-2 mb-0" style={{ color: "var(--ink-muted)" }}>
          Drag-drop is mocked — type a filename and start import.
        </p>
      )}
      <button type="button" className="btn btn-primary mt-4 w-full" disabled={busy} onClick={start}>
        {busy ? "Importing…" : "Start import"}
      </button>
      {steps.length > 0 && (
        <ul className="mt-4 mb-0 pl-0 list-none text-sm space-y-1.5">
          {steps.map((s) => (
            <li key={s} className="progress-step done">
              <span>✓</span> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
