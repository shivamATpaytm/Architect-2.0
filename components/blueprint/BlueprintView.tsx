"use client";

import { useRef, useState } from "react";
import type { BlueprintSection, Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

export function BlueprintView({ project }: { project: Project }) {
  const { updateProject, showToast, prefs } = useApp();
  const [removed, setRemoved] = useState<BlueprintSection | null>(null);
  const addAnchor = useRef<HTMLDivElement>(null);

  const addSection = () => {
    const id = `bp-${Date.now()}`;
    updateProject(project.id, {
      blueprint: [
        ...project.blueprint,
        { id, title: "New section", body: "Describe requirements…" },
      ],
    });
    showToast("Section added — saved");
    // Keep viewport near the Add control rather than jumping to list bottom
    requestAnimationFrame(() => {
      addAnchor.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const removeSection = (section: BlueprintSection) => {
    setRemoved(section);
    updateProject(project.id, {
      blueprint: project.blueprint.filter((s) => s.id !== section.id),
    });
    showToast(`Removed “${section.title}” — Undo available`);
  };

  const undo = () => {
    if (!removed) return;
    updateProject(project.id, {
      blueprint: [...project.blueprint, removed],
    });
    showToast(`Restored “${removed.title}”`);
    setRemoved(null);
  };

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
          <div className="flex items-center gap-2">
            <span className="chip">{project.blueprint.length} sections</span>
            {removed && (
              <button type="button" className="btn btn-sm" onClick={undo}>
                Undo remove
              </button>
            )}
          </div>
        </div>
        {project.blueprint.map((section, i) => (
          <div key={section.id} className="card p-4 fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="chip mono">{String(i + 1).padStart(2, "0")}</span>
              <input
                className="input font-semibold flex-1"
                style={{
                  border: "none",
                  boxShadow: "none",
                  padding: "0.35rem 0.25rem",
                  background: "transparent",
                }}
                value={section.title}
                onChange={(e) => {
                  updateProject(project.id, {
                    blueprint: project.blueprint.map((s) =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ),
                  });
                }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeSection(section)}
              >
                Remove
              </button>
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
        <div ref={addAnchor}>
          <button type="button" className="btn" onClick={addSection}>
            Add section
          </button>
        </div>
      </div>
    </div>
  );
}
