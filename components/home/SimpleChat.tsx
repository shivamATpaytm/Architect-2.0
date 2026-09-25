"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SimpleChatMessage } from "@/lib/types";
import { replyToSimpleChat, welcomeSimpleChat } from "@/lib/simple-chat";
import { useApp } from "@/components/providers/AppProvider";
import { uid } from "@/lib/storage";

export function SimpleChat() {
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const { createFromIntent, setHomeMode, showToast } = useApp();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([welcomeSimpleChat()]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const userMsg: SimpleChatMessage = {
      id: uid("schat"),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const reply = replyToSimpleChat(text);
    setMessages((prev) => [...prev, userMsg, reply]);
    setDraft("");
  };

  const promote = (prompt: string) => {
    setHomeMode("build");
    const project = createFromIntent(prompt);
    showToast("Turning chat into a project…");
    router.push(`/projects/${project.id}?view=build`);
  };

  return (
    <div className="card flex flex-col" style={{ minHeight: 420, boxShadow: "var(--shadow)" }}>
      <div
        className="px-5 py-4 border-b flex items-start justify-between gap-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <div className="label-caps mb-1">Simple chat</div>
          <h2 className="display text-[24px] m-0 leading-tight">Talk without building</h2>
          <p className="mt-1 mb-0 text-sm" style={{ color: "var(--ink-muted)" }}>
            ChatGPT-like panel — no project created unless you promote a message.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm shrink-0"
          onClick={() => setHomeMode("build")}
        >
          Switch to Build
        </button>
      </div>

      <div className="scroll-y flex-1 px-4 py-3 space-y-2.5" style={{ maxHeight: 360 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            className="rounded-[10px] p-3"
            style={{
              background: m.role === "user" ? "var(--accent-soft)" : "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="mono text-[11px] mb-1" style={{ color: "var(--ink-muted)" }}>
              {m.role === "user" ? "You" : "Architect"}
            </div>
            <p className="m-0 text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
            {m.canPromote && m.promotePrompt && (
              <button
                type="button"
                className="btn btn-primary btn-sm mt-2.5"
                onClick={() => promote(m.promotePrompt!)}
              >
                Turn this into a project
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Ask about architecture, agents, or describe an idea…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="button" className="btn btn-primary" onClick={send} disabled={!draft.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
