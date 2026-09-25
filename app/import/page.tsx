"use client";

import { Suspense } from "react";
import { AuthGate } from "@/components/chrome/AuthGate";
import { AppHeader } from "@/components/chrome/AppHeader";
import { ImportTabs } from "@/components/import/ImportTabs";

export default function ImportPage() {
  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col blueprint-grid">
        <AppHeader />
        <main className="flex-1 p-6">
          <div className="max-w-xl mx-auto mb-5">
            <h1 className="display text-[32px] m-0">Import</h1>
            <p className="mt-1 mb-0" style={{ color: "var(--ink-muted)" }}>
              Bring an existing project, Studio agent, repo, or URL into Architect.
            </p>
          </div>
          <Suspense fallback={<div className="card p-5 max-w-xl mx-auto">Loading…</div>}>
            <ImportTabs />
          </Suspense>
        </main>
      </div>
    </AuthGate>
  );
}
