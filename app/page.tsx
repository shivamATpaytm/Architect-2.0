"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

export default function LandingPage() {
  const { ready, session } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  if (!ready) {
    return (
      <div className="blueprint-grid min-h-screen flex items-center justify-center">
        <p className="mono text-sm" style={{ color: "var(--ink-muted)" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (session) return null;

  return (
    <div className="min-h-screen flex flex-col blueprint-grid">
      <header
        className="flex items-center justify-between px-5 h-14 border-b"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="logo-mark">A2</span>
          <span className="display text-lg font-semibold">Architect 2.0</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip chip-accent hidden sm:inline-flex">Demo</span>
          <Link href="/login" className="btn btn-primary btn-sm">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="login-hero px-5 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="label-caps m-0 mb-3">Agentic studio</p>
            <h1 className="display text-4xl md:text-5xl m-0 leading-tight">
              Design systems of agents.
              <br />
              <span style={{ color: "var(--accent)" }}>Ship the app.</span>
            </h1>
            <p
              className="mt-5 mb-0 text-[16px] max-w-xl mx-auto"
              style={{ color: "var(--ink-muted)", lineHeight: 1.65 }}
            >
              One workspace for operators who want outcomes and developers who need the wiring —
              Blueprint → Crew → Stage, without forking into two products.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="btn btn-primary">
                Start building
              </Link>
              <Link href="/login" className="btn">
                Sign in to workspace
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="chip chip-accent">Builder</span>
              <span className="chip">Architect</span>
              <span className="chip mono">Paper · Sage · Copper</span>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 max-w-5xl mx-auto">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["Intent → Crew", "Phased narrative from consultant chat to live Stage preview."],
              ["Dual lenses", "Builder for outcomes. Architect for graphs, diffs, and deploy."],
              ["Agent-native", "Multi-agent orchestration as a first-class surface — not a bolt-on."],
            ].map(([t, d]) => (
              <div key={t} className="card p-5">
                <div className="font-semibold">{t}</div>
                <p className="text-sm mt-1.5 mb-0" style={{ color: "var(--ink-muted)" }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer
        className="px-5 py-4 border-t text-center text-xs"
        style={{ borderColor: "var(--border)", color: "var(--ink-faint)" }}
      >
        Architect 2.0 · Demo workspace
      </footer>
    </div>
  );
}
