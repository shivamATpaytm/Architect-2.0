"use client";

import type { Project } from "@/lib/types";
import { useApp } from "@/components/providers/AppProvider";

export function BlueprintView({ project }: { project: Project }) {
  const { updateProject, showToast } = useApp();

  return (
    <div className="scroll-y h-full p-4 max-w-3xl mx-auto space-y-3">
      <div className="mb-2">
        <h2 className="display text-2xl m-0">Blueprint</h2>
        <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
          Editable PRD sections — shared by Builder and Architect.
        </p>
      </div>
      {project.blueprint.map((section) => (
        <div key={section.id} className="card p-4">
          <input
            className="input font-semibold mb-2"
            value={section.title}
            onChange={(e) => {
              updateProject(project.id, {
                blueprint: project.blueprint.map((s) =>
                  s.id === section.id ? { ...s, title: e.target.value } : s
                ),
              });
            }}
          />
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
  );
}
