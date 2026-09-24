"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, session } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready) {
    return (
      <div className="blueprint-grid min-h-screen flex items-center justify-center">
        <p className="mono text-sm" style={{ color: "var(--ink-muted)" }}>
          Loading workspace…
        </p>
      </div>
    );
  }
  if (!session) return null;
  return <>{children}</>;
}
