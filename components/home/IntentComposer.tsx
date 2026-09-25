"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";

export function IntentComposer() {
  const [intent, setIntent] = useState("");
  const { createFromIntent, prefs } = useApp();
  const router = useRouter();

  const submit = () => {
    const text = intent.trim();
    if (!text) return;
    const project = createFromIntent(text);
    router.push(`/projects/${project.id}?view=build`);
  };

  return (
    <div className="card p-6" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="display text-[26px] m-0 leading-tight">
          {prefs.mode === "builder"
            ? "What should your crew accomplish?"
            : "Describe the agentic system to scaffold"}
        </h2>
        <span className="chip mono shrink-0">⌘↵</span>
      </div>
      <p className="mt-0 mb-4 text-sm" style={{ color: "var(--ink-muted)" }}>
        {prefs.mode === "builder"
          ? "Plain language is enough — Architect proposes a Blueprint and Crew, then opens Stage."
          : "Mention frameworks, tools, and deploy targets if you already know them."}
      </p>
      <textarea
        className="textarea"
        style={{ minHeight: 128, fontSize: 15 }}
        placeholder={
          prefs.mode === "builder"
            ? "e.g. Research inbound leads, draft personalized emails, QA tone, log to HubSpot…"
            : "e.g. Multi-agent Next.js app with HubSpot + Gmail tools, PRD export, VPC-ready…"
        }
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary" onClick={submit} disabled={!intent.trim()}>
          Start building
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
