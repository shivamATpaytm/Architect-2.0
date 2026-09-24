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
  const { session, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const inStudio = pathname?.startsWith("/projects/");

  return (
    <header
      className="flex items-center justify-between gap-4 px-4 py-2.5 border-b"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-xs font-bold"
            style={{ background: "var(--accent)", color: "#f7fff9" }}
          >
            A2
          </span>
          <span className="display text-[17px] font-semibold tracking-tight">
            Architect
          </span>
        </Link>
        {projectName && (
          <>
            <span style={{ color: "var(--ink-muted)" }}>/</span>
            <span className="truncate font-medium">{projectName}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!inStudio && (
          <>
            <Link href="/import" className="btn btn-ghost">
              Import
            </Link>
            <Link href="/projects/new" className="btn btn-primary">
              New project
            </Link>
          </>
        )}
        <ModeToggle />
        <ThemeToggle />
        {(deployHref || onDeploy) && (
          <button
            type="button"
            className="btn btn-signal"
            onClick={() => {
              if (onDeploy) onDeploy();
              else if (deployHref) router.push(deployHref);
            }}
          >
            Deploy
          </button>
        )}
        <Link href="/settings" className="btn btn-ghost" title="Settings">
          {session?.name?.slice(0, 1).toUpperCase() || "U"}
        </Link>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Out
        </button>
      </div>
    </header>
  );
}
