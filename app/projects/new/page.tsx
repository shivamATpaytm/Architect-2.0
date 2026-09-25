"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/chrome/AuthGate";
import { AppHeader } from "@/components/chrome/AppHeader";
import { TEMPLATES } from "@/lib/mock/seed";
import { useApp } from "@/components/providers/AppProvider";

export default function NewProjectPage() {
  return (
    <AuthGate>
      <Suspense
        fallback={
          <div className="blueprint-grid min-h-screen flex items-center justify-center">
            Loading…
          </div>
        }
      >
        <NewInner />
      </Suspense>
    </AuthGate>
  );
}

function NewInner() {
  const { createFromIntent } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [intent, setIntent] = useState("");

  useEffect(() => {
    if (params.get("scaffold") === "empty") {
      const p = createFromIntent(
        "Empty agentic scaffold with placeholder crew and Stage shell"
      );
      router.replace(`/projects/${p.id}?view=build`);
    }
  }, [params, createFromIntent, router]);

  return (
    <div className="min-h-screen flex flex-col blueprint-grid">
      <AppHeader />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <h1 className="display text-[32px] m-0 mb-2">New project</h1>
        <p className="mt-0 mb-6" style={{ color: "var(--ink-muted)" }}>
          Start from intent or a template. Seeds a rich Lead Nurture–style crew you can edit.
        </p>

        <div className="card p-5 mb-6" style={{ boxShadow: "var(--shadow)" }}>
          <label className="label-caps block mb-1.5">Intent</label>
          <textarea
            className="textarea"
            placeholder="Describe the agentic app…"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && intent.trim()) {
                const p = createFromIntent(intent.trim());
                router.push(`/projects/${p.id}?view=build`);
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary mt-3"
            disabled={!intent.trim()}
            onClick={() => {
              if (!intent.trim()) return;
              const p = createFromIntent(intent.trim());
              router.push(`/projects/${p.id}?view=build`);
            }}
          >
            Create from intent
          </button>
        </div>

        <h2 className="label-caps mb-3">Templates</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="card card-hover p-4 text-left"
              onClick={() => {
                const p = createFromIntent(`Build ${t.name}: ${t.pitch}`, t.id);
                router.push(`/projects/${p.id}?view=build`);
              }}
            >
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
                {t.pitch}
              </div>
              <span className="chip chip-signal mt-2">~{t.hrsSaved} hrs/wk</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
