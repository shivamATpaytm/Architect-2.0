"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { ThemeToggle } from "./ThemeToggle";
import { useApp } from "@/components/providers/AppProvider";

export function AppHeader({
  projectName,
  deployHref,
  onDeploy,
}: {
  projectName?: string;
  deployHref?: string;
  onDeploy?: () => void;
}) {
  const { session, logout, prefs, setHomeMode } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const inStudio = pathname?.startsWith("/projects/");

  return (
    <header
      className="flex items-center justify-between gap-3 px-4 h-12 border-b shrink-0"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <span className="logo-mark">A2</span>
          <span className="display text-[16px] font-semibold tracking-tight hidden sm:inline">
            Architect
          </span>
        </Link>
        {projectName && (
          <>
            <span className="text-sm" style={{ color: "var(--ink-faint)" }}>
              /
            </span>
            <span className="truncate text-sm font-semibold">{projectName}</span>
            <span className="chip hidden md:inline-flex">
              {prefs.mode === "builder" ? "Builder lens" : "Architect lens"}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!inStudio && (
          <>
            {pathname === "/home" && (
              <div className="seg hidden sm:flex">
                <button
                  type="button"
                  className={`seg-item ${(prefs.homeMode || "build") === "build" ? "active" : ""}`}
                  onClick={() => setHomeMode("build")}
                >
                  Build
                </button>
                <button
                  type="button"
                  className={`seg-item ${prefs.homeMode === "chat" ? "active" : ""}`}
                  onClick={() => setHomeMode("chat")}
                >
                  Chat
                </button>
              </div>
            )}
            <Link href="/import" className="btn btn-ghost btn-sm">
              Import
            </Link>
            <Link href="/projects/new" className="btn btn-primary btn-sm">
              New project
            </Link>
          </>
        )}
        <ModeToggle />
        <ThemeToggle />
        {(deployHref || onDeploy) && (
          <button
            type="button"
            className="btn btn-signal btn-sm"
            onClick={() => {
              if (onDeploy) onDeploy();
              else if (deployHref) router.push(deployHref);
            }}
          >
            Deploy
          </button>
        )}
        <Link href="/settings" className="avatar" title="Settings">
          {session?.name?.slice(0, 1).toUpperCase() || "U"}
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
