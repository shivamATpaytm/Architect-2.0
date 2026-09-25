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
        <div className="text-center">
          <div className="logo-mark mx-auto mb-3" style={{ width: 36, height: 36, fontSize: 13 }}>
            A2
          </div>
          <p className="mono text-sm m-0" style={{ color: "var(--ink-muted)" }}>
            Loading workspace…
          </p>
        </div>
      </div>
    );
  }
  if (!session) return null;
  return <>{children}</>;
}
