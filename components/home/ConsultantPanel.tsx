"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CONSULTANT_ROLES, TEMPLATES } from "@/lib/mock/seed";
import { useApp } from "@/components/providers/AppProvider";

export function ConsultantPanel() {
  const [role, setRole] = useState(CONSULTANT_ROLES[0].id);
  const { createFromIntent, prefs } = useApp();
  const router = useRouter();

  const ideas = useMemo(() => {
    const r = CONSULTANT_ROLES.find((x) => x.id === role)!;
    return TEMPLATES.filter((t) => r.ideas.includes(t.id));
  }, [role]);

  if (prefs.mode === "architect") {
    return (
      <div className="card p-4 h-full">
        <h3 className="display text-xl m-0 mb-1">Quick starts</h3>
        <p className="text-sm mt-0 mb-4" style={{ color: "var(--ink-muted)" }}>
          Jump straight to wiring — import or scaffold.
        </p>
        <div className="flex flex-col gap-2">
          {[
            { href: "/import?tab=github", label: "Import GitHub repo" },
            { href: "/import?tab=studio", label: "Import Studio agent" },
            { href: "/projects/new?scaffold=empty", label: "Empty agentic scaffold" },
          ].map((item) => (
            <a key={item.href} href={item.href} className="btn justify-start">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 h-full">
      <h3 className="display text-xl m-0 mb-1">Consultant</h3>
      <p className="text-sm mt-0 mb-3" style={{ color: "var(--ink-muted)" }}>
        Pick your role — get outcome-shaped ideas with hours saved.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CONSULTANT_ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`chip ${role === r.id ? "chip-accent" : ""}`}
            onClick={() => setRole(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {ideas.map((idea) => (
          <button
            key={idea.id}
            type="button"
            className="text-left btn"
            style={{ alignItems: "flex-start", flexDirection: "column", gap: 4 }}
            onClick={() => {
              const project = createFromIntent(
                `Build ${idea.name}: ${idea.pitch}`,
                idea.id
              );
              router.push(`/projects/${project.id}?view=build`);
            }}
          >
            <span className="font-semibold">{idea.name}</span>
            <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
              {idea.pitch}
            </span>
            <span className="chip chip-signal">~{idea.hrsSaved} hrs/wk saved</span>
          </button>
        ))}
      </div>
    </div>
  );
}
