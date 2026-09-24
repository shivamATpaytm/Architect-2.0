"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";

export default function RootPage() {
  const { ready, session } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(session ? "/home" : "/login");
  }, [ready, session, router]);

  return (
    <div className="blueprint-grid min-h-screen flex items-center justify-center">
      <p className="mono text-sm" style={{ color: "var(--ink-muted)" }}>
        Routing…
      </p>
    </div>
  );
}
