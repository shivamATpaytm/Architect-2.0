"use client";

import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

export function BlueprintView({ project }: { project: Project }) {
  const { updateProject, showToast, prefs } = useApp();

  return (
    <div className="scroll-y h-full p-5">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="display text-[28px] m-0">Blueprint</h2>
            <p className="text-sm mt-1 mb-0" style={{ color: "var(--ink-muted)" }}>
              {prefs.mode === "builder"
                ? "Your product requirements — edit freely; the crew stays in sync."
                : "Editable PRD — shared artifact for Builder and Architect lenses."}
            </p>
          </div>
          <span className="chip">{project.blueprint.length} sections</span>
        </div>
        {project.blueprint.map((section, i) => (
          <div key={section.id} className="card p-4 fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="chip mono">{String(i + 1).padStart(2, "0")}</span>
              <input
                className="input font-semibold"
                style={{ border: "none", boxShadow: "none", padding: "0.35rem 0.25rem", background: "transparent" }}
                value={section.title}
                onChange={(e) => {
                  updateProject(project.id, {
                    blueprint: project.blueprint.map((s) =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ),
                  });
                }}
              />
            </div>
            <textarea
              className="textarea"
              rows={5}
              value={section.body}
              onChange={(e) => {
                updateProject(project.id, {
                  blueprint: project.blueprint.map((s) =>
                    s.id === section.id ? { ...s, body: e.target.value } : s
                  ),
                });
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() => {
            updateProject(project.id, {
              blueprint: [
                ...project.blueprint,
                {
                  id: `bp-${Date.now()}`,
                  title: "New section",
                  body: "Describe requirements…",
                },
              ],
            });
            showToast("Section added");
          }}
        >
          Add section
        </button>
      </div>
    </div>
  );
}
