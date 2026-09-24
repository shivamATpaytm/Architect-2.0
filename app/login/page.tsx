"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

export default function LoginPage() {
  const { ready, session, login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && session) router.replace("/home");
  }, [ready, session, router]);

  const go = (provider: "email" | "google" | "github", addr?: string) => {
    const e = (addr || email).trim();
    if (provider === "email" && !e.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    setError("");
    login(e || "builder@architect.new", provider);
    router.push("/home");
  };

  return (
    <div className="blueprint-grid min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-xs font-bold"
            style={{ background: "var(--accent)", color: "#f7fff9" }}
          >
            A2
          </span>
          <span className="display text-2xl">Architect 2.0</span>
        </div>
        <p className="mt-0 mb-6" style={{ color: "var(--ink-muted)" }}>
          Build agentic apps from intent. Inspect the wiring when you need to.
        </p>

        <label className="block text-sm mb-1" style={{ color: "var(--ink-muted)" }}>
          Work email
        </label>
        <input
          className="input mb-2"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go("email")}
        />
        {error && (
          <p className="text-sm m-0 mb-2" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}
        <button type="button" className="btn btn-primary w-full mb-3" onClick={() => go("email")}>
          Continue with email
        </button>

        <div className="flex items-center gap-2 my-4">
          <hr className="divider flex-1" />
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
            or
          </span>
          <hr className="divider flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="btn w-full"
            onClick={() => go("google", "maya@northwind.dev")}
          >
            Continue with Google
          </button>
          <button
            type="button"
            className="btn w-full"
            onClick={() => go("github", "dev@github.com")}
          >
            Continue with GitHub
          </button>
        </div>

        <div className="flex gap-2 mt-6 justify-center">
          <span className="chip chip-accent">Builder</span>
          <span className="chip">Architect</span>
        </div>
        <p className="text-center text-xs mt-3 mb-0" style={{ color: "var(--ink-muted)" }}>
          Mock auth for Lyzr take-home — no real OAuth.
        </p>
      </div>
    </div>
  );
}
