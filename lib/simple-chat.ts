import type { SimpleChatMessage } from "./types";
import { uid } from "./storage";

export function replyToSimpleChat(userText: string): SimpleChatMessage {
  const lower = userText.toLowerCase();
  let content: string;
  let canPromote = false;
  let promotePrompt: string | undefined;

  if (/hello|hi\b|hey|thanks/.test(lower)) {
    content =
      "Hey — I'm Architect's Simple Chat. Ask about agentic product architecture, or describe an app and use **Turn this into a project** to open the full Build flow (docs + UI + crew together).";
  } else if (/lovable|bolt|v0|replit|cursor/.test(lower)) {
    content =
      "Architect borrows product patterns (plan→build, chat-driven UI, multi-screen preview, refine chips) without cloning those UIs. Our wedge: **Blueprint docs + Stage UI + Agents crew from one prompt**, plus Builder|Architect lenses and Ship.";
    canPromote = true;
    promotePrompt = "Multi-agent workspace with Blueprint docs, Stage UI, and crew graph";
  } else if (/agent|crew|multi-agent/.test(lower)) {
    content =
      "Treat agents as contracts: clear role, tools, KB, and approve gates. A good crew is 3–5 specialists with a shared knowledge node — not one mega-prompt. Switch to **Build project** to scaffold one from a single sentence.";
    canPromote = true;
    promotePrompt = userText;
  } else if (/prd|blueprint|spec|document/.test(lower)) {
    content =
      "In Architect, Blueprint sections (goals, users, flows, metrics, data model) are generated **with** UI screens — not as a separate doc tool. Use Build project mode for that dual output.";
    canPromote = true;
    promotePrompt = userText;
  } else if (/build|create|make|app|dashboard|saas|lead|hr|legal|support/.test(lower)) {
    content = `Sounds like a build intent. I can keep chatting here, or promote this into a full project that generates docs + UI screens + agents together.\n\nSuggested prompt: “${userText.trim().slice(0, 160)}”`;
    canPromote = true;
    promotePrompt = userText.trim();
  } else if (/deploy|ship|vercel/.test(lower)) {
    content =
      "Ship view is a demo deploy to *.architect.new — no real cloud credentials required. Open any ready project → Ship → Deploy.";
  } else {
    content = `Got it. In Simple Chat I stay conversational — no project is created. If you want docs + multi-screen UI + a crew from this idea, hit **Turn this into a project**.\n\nTip: be concrete about audience and channels (e.g. “Lead nurture for SaaS SDRs with email + Slack”).`;
    canPromote = true;
    promotePrompt = userText.trim();
  }

  return {
    id: uid("schat"),
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
    canPromote,
    promotePrompt,
  };
}

export function welcomeSimpleChat(): SimpleChatMessage {
  return {
    id: uid("schat"),
    role: "assistant",
    content:
      "Simple Chat — ask about product architecture, agent design, or how Architect works. Nothing here creates a project unless you click **Turn this into a project**.",
    timestamp: new Date().toISOString(),
  };
}
