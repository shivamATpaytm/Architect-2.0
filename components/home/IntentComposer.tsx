"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";

const EXAMPLES = [
  "Lead nurture for SaaS SDRs with email + Slack",
  "Support triage desk that classifies tickets and drafts replies",
  "HR onboarding concierge with checklist + FAQ agent",
  "Legal contract review with risk flags and Slack alerts",
  "Research briefing room — sources, memo, citations",
];

export function IntentComposer() {
  const [intent, setIntent] = useState("");
  const [touched, setTouched] = useState(false);
  const { createFromIntent, prefs, showToast } = useApp();
  const router = useRouter();
  const empty = !intent.trim();

  const submit = () => {
    setTouched(true);
    const text = intent.trim();
    if (!text) {
      showToast("Describe a project before building");
      return;
    }
    const project = createFromIntent(text);
    router.push(`/projects/${project.id}?view=build`);
  };

  return (
    <div className="card p-6" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="label-caps mb-1">Build a project</div>
          <h2 className="display text-[26px] m-0 leading-tight">
            {prefs.mode === "builder"
              ? "One prompt → docs + UI + crew"
              : "Scaffold docs, screens, and agents together"}
          </h2>
        </div>
        <span className="chip mono shrink-0">⌘↵</span>
      </div>
      <p className="mt-0 mb-4 text-sm" style={{ color: "var(--ink-muted)" }}>
        {prefs.mode === "builder"
          ? "Describe the outcome. Architect generates Blueprint PRD sections and Stage UI screens together, then assembles a crew — visible step-by-step."
          : "Mention domain, channels, and audience. You get PRD + multi-screen preview + agent contracts + code stubs from the same prompt."}
      </p>
      <textarea
        className="textarea"
        style={{ minHeight: 128, fontSize: 15 }}
        placeholder='e.g. “Lead nurture for SaaS SDRs with email + Slack”'
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        onBlur={() => setTouched(true)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
      />
      {touched && empty && (
        <p className="text-sm m-0 mt-2" style={{ color: "var(--danger)" }}>
          Enter a prompt to enable Build project.
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {EXAMPLES.slice(0, 3).map((ex) => (
          <button key={ex} type="button" className="chip" onClick={() => setIntent(ex)}>
            {ex.length > 42 ? ex.slice(0, 40) + "…" : ex}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={submit}
          disabled={empty}
          title={empty ? "Enter a prompt first" : "Build project from prompt"}
        >
          Build project
        </button>
        <Link href="/import" className="btn">
          Import project
        </Link>
        <Link href="/projects/new" className="btn btn-ghost">
          Browse templates
        </Link>
      </div>
    </div>
  );
}
