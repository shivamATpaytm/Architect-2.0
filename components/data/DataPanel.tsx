"use client";

import { useRef } from "react";
import type { DataAsset, Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";
import { uid } from "@/lib/storage";

export function DataPanel({ project }: { project: Project }) {
  const { updateProject, showToast } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const assets = project.dataAssets || [];

  const addStub = (kind: "pdf" | "csv") => {
    const name =
      kind === "pdf"
        ? `brief-${assets.length + 1}.pdf`
        : `leads-${assets.length + 1}.csv`;
    const asset: DataAsset = {
      id: uid("asset"),
      name,
      kind,
      sizeLabel: kind === "pdf" ? `${180 + assets.length * 12} KB` : `${8 + assets.length * 3} KB`,
      addedAt: new Date().toISOString(),
    };
    updateProject(project.id, { dataAssets: [...assets, asset] });
    showToast(`Added ${name}`);
  };

  const onFile = (file: File | null) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    const kind: DataAsset["kind"] = lower.endsWith(".pdf")
      ? "pdf"
      : lower.endsWith(".csv")
        ? "csv"
        : "other";
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    const asset: DataAsset = {
      id: uid("asset"),
      name: file.name,
      kind,
      sizeLabel: sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`,
      addedAt: new Date().toISOString(),
    };
    updateProject(project.id, { dataAssets: [...assets, asset] });
    showToast(`Uploaded ${file.name}`);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (id: string) => {
    const gone = assets.find((a) => a.id === id);
    updateProject(project.id, {
      dataAssets: assets.filter((a) => a.id !== id),
    });
    showToast(gone ? `Removed ${gone.name}` : "Removed");
  };

  return (
    <div className="scroll-y h-full p-5">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="display text-[28px] m-0">Data & knowledge</h2>
            <p className="text-sm mt-1 mb-0" style={{ color: "var(--ink-muted)" }}>
              Attach PDFs and CSVs to the crew knowledge base. Persists with the project.
            </p>
          </div>
          <span className="chip">{assets.length} files</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()}>
            Upload file
          </button>
          <button type="button" className="btn" onClick={() => addStub("pdf")}>
            Add PDF
          </button>
          <button type="button" className="btn" onClick={() => addStub("csv")}>
            Add CSV
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.csv,application/pdf,text/csv"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </div>

        {assets.length === 0 ? (
          <div className="sketch-empty">
            <p className="display text-xl m-0 mb-2">No files yet</p>
            <p className="m-0 text-sm">Upload a PDF or CSV, or add a demo stub.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((a) => (
              <div
                key={a.id}
                className="card p-3.5 flex items-center justify-between gap-3 fade-in"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate">{a.name}</span>
                    <span className="chip">{a.kind.toUpperCase()}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
                    {a.sizeLabel} · added{" "}
                    {new Date(a.addedAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Calcutta",
                    })}{" "}
                    IST
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(a.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
