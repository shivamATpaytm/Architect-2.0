"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";

export default function LoginPage() {
  const { ready, session, login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  const go = async (provider: "email" | "google" | "github", addr?: string) => {
    const e = (addr || email).trim();
    if (provider === "email" && !e.includes("@")) {
      setError("Enter a valid work email");
      return;
    }
    setError("");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 280));
    login(e || "builder@architect.new", provider);
    router.push("/home");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside
        className="login-hero blueprint-grid hidden lg:flex flex-col justify-between p-10 border-r"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="logo-mark" style={{ width: 36, height: 36, fontSize: 13 }}>
              A2
            </span>
            <span className="display text-2xl">Architect 2.0</span>
          </Link>
        </div>
        <div className="max-w-md">
          <p className="display text-4xl leading-tight m-0 mb-4">
            Design systems of agents.
            <br />
            <span style={{ color: "var(--accent)" }}>Ship the app.</span>
          </p>
          <p className="text-[15px] m-0 mb-8" style={{ color: "var(--ink-muted)", lineHeight: 1.6 }}>
            One workspace for operators who want outcomes and developers who need the wiring —
            Blueprint → Crew → Stage, without forking into two products.
          </p>
          <div className="grid gap-3">
            {[
              ["Intent → Crew", "Phased narrative from consultant chat to live Stage"],
              ["Dual lenses", "Builder outcomes · Architect graphs, diffs & deploy"],
              ["Agent-native", "Multi-agent orchestration as a first-class surface"],
            ].map(([t, d]) => (
              <div key={t} className="card p-3.5">
                <div className="font-semibold text-sm">{t}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="chip chip-accent">Builder</span>
          <span className="chip">Architect</span>
          <span className="chip mono">Paper · Sage · Copper</span>
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 blueprint-grid">
        <div className="card p-8 w-full max-w-[420px]" style={{ boxShadow: "var(--shadow)" }}>
          <div className="lg:hidden flex items-center gap-2 mb-5">
            <span className="logo-mark">A2</span>
            <span className="display text-xl">Architect 2.0</span>
          </div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h1 className="display text-2xl m-0">Welcome back</h1>
            <span className="chip chip-accent">Demo</span>
          </div>
          <p className="mt-0 mb-6 text-sm" style={{ color: "var(--ink-muted)" }}>
            Build agentic apps from intent. Inspect the wiring when you need to.
          </p>

          <label className="label-caps block mb-1.5">Work email</label>
          <input
            className="input mb-2"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go("email")}
            autoFocus
          />
          {error && (
            <p className="text-sm m-0 mb-2" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}
          <button
            type="button"
            className="btn btn-primary w-full mb-3"
            disabled={busy}
            onClick={() => go("email")}
          >
            {busy ? "Signing in…" : "Continue with email"}
          </button>

          <div className="flex items-center gap-2 my-4">
            <hr className="divider flex-1" />
            <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
              or
            </span>
            <hr className="divider flex-1" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="btn w-full"
              disabled={busy}
              onClick={() => go("google", "maya@northwind.dev")}
            >
              Continue with Google
            </button>
            <button
              type="button"
              className="btn w-full"
              disabled={busy}
              onClick={() => go("github", "dev@github.com")}
            >
              Continue with GitHub
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
