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
    <div className="card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="display text-2xl m-0">
          {prefs.mode === "builder"
            ? "What should your crew accomplish?"
            : "Describe the agentic system to scaffold"}
        </h2>
      </div>
      <p className="mt-0 mb-4 text-sm" style={{ color: "var(--ink-muted)" }}>
        {prefs.mode === "builder"
          ? "Plain language is enough — Architect will propose a Blueprint and Crew."
          : "Mention frameworks, tools, and deploy targets if you already know them."}
      </p>
      <textarea
        className="textarea"
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
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary" onClick={submit}>
          Start building
        </button>
        <Link href="/import" className="btn">
          Import
        </Link>
        <Link href="/projects/new" className="btn btn-ghost">
          Templates
        </Link>
        <span className="chip mono">⌘ Enter</span>
      </div>
    </div>
  );
}
