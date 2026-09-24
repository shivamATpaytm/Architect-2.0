import type { Project } from "../types";

export const LEAD_NURTURE_ID = "proj-lead-nurture";

export function createLeadNurtureProject(): Project {
  const now = new Date().toISOString();
  return {
    id: LEAD_NURTURE_ID,
    name: "Lead Nurture Crew",
    pitch: "Research leads → draft personalized emails → QA tone → CRM note.",
    status: "live",
    phase: "stage",
    deployUrl: "lead-nurture.architect.new",
    createdAt: now,
    updatedAt: now,
    template: "lead-nurture",
    previewReady: true,
    githubConnected: true,
    githubRepo: "acme/lead-nurture-crew",
    lastSync: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    agents: [
      {
        id: "agent-researcher",
        name: "Researcher",
        role: "Lead intelligence",
        model: "claude-sonnet-4",
        systemPrompt:
          "You research prospects using ICP criteria. Return firmographics, recent news, and personalization hooks in structured JSON.",
        tools: ["Web search", "LinkedIn stub"],
        kb: ["icp-guide.pdf"],
        status: "ready",
        x: 80,
        y: 120,
      },
      {
        id: "agent-copywriter",
        name: "Copywriter",
        role: "Personalized outreach",
        model: "gpt-4.1",
        systemPrompt:
          "Draft warm, concise emails using research hooks. Match brand voice. Never invent pricing.",
        tools: ["Gmail"],
        kb: ["icp-guide.pdf", "pricing.csv"],
        status: "ready",
        x: 320,
        y: 80,
      },
      {
        id: "agent-brand-qa",
        name: "Brand QA",
        role: "Tone & compliance",
        model: "claude-sonnet-4",
        systemPrompt:
          "Score drafts for tone, claims accuracy, and CTA clarity. Flag risky language before send.",
        tools: [],
        kb: ["icp-guide.pdf"],
        status: "ready",
        x: 560,
        y: 120,
      },
      {
        id: "agent-crm",
        name: "CRM Writer",
        role: "HubSpot notes",
        model: "gpt-4.1-mini",
        systemPrompt:
          "Write CRM activity notes summarizing outreach intent, personalization used, and next step.",
        tools: ["HubSpot"],
        kb: ["pricing.csv"],
        status: "idle",
        x: 420,
        y: 280,
      },
      {
        id: "node-kb",
        name: "Knowledge",
        role: "Shared KB",
        model: "—",
        systemPrompt: "icp-guide.pdf · pricing.csv",
        tools: [],
        kb: ["icp-guide.pdf", "pricing.csv"],
        status: "ready",
        x: 180,
        y: 300,
      },
    ],
    chat: [
      {
        id: "m1",
        role: "system",
        phase: "consulting",
        content: "Consulting phase started. Framing your intent into an agentic workflow.",
        timestamp: now,
      },
      {
        id: "m2",
        role: "user",
        content:
          "I need a crew that researches inbound leads, drafts personalized nurture emails, QA's brand tone, and logs notes to HubSpot.",
        timestamp: now,
      },
      {
        id: "m3",
        role: "assistant",
        phase: "consulting",
        content:
          "Got it. For a sales ops Builder, the highest-ROI shape is a 4-agent crew: Researcher → Copywriter → Brand QA → CRM Writer. Estimated ~6 hrs/week saved on manual nurture.",
        timestamp: now,
        chips: ["Make casual", "Add citations", "Add auth"],
      },
      {
        id: "m4",
        role: "system",
        phase: "blueprint",
        content: "Blueprint drafted — PRD sections ready for review.",
        timestamp: now,
      },
      {
        id: "m5",
        role: "assistant",
        phase: "blueprint",
        content:
          "I sketched user flows: Upload CSV / CRM sync → Run outreach → Review drafts → Approve → CRM note. Auth is optional for the internal dashboard.",
        timestamp: now,
      },
      {
        id: "m6",
        role: "system",
        phase: "crew",
        content: "Crew assembled — 4 agents + shared knowledge base.",
        timestamp: now,
      },
      {
        id: "m7",
        role: "assistant",
        phase: "crew",
        content:
          "Wired tools: Web search, Gmail, HubSpot. Attached icp-guide.pdf and pricing.csv. Open Agents to inspect prompts.",
        timestamp: now,
      },
      {
        id: "m8",
        role: "system",
        phase: "stage",
        content: "Stage ready — preview is live on the right.",
        timestamp: now,
      },
      {
        id: "m9",
        role: "assistant",
        phase: "stage",
        content:
          "Preview shows a lead nurture dashboard with Run outreach. Deployed to lead-nurture.architect.new. Toggle Architect mode for diffs & GitHub sync.",
        timestamp: now,
        chips: ["Tweak preview", "Open Agents", "Deploy again"],
      },
    ],
    blueprint: [
      {
        id: "bp-overview",
        title: "Overview",
        body: "Lead Nurture Crew turns inbound leads into personalized email sequences with brand QA and CRM logging. Built for sales ops teams who want agentic outreach without a custom engineering sprint.",
      },
      {
        id: "bp-users",
        title: "Users & jobs",
        body: "Primary: SDR / AE uploading CSV or syncing HubSpot. Secondary: RevOps reviewing tone rules. Job: research → draft → approve → log.",
      },
      {
        id: "bp-flows",
        title: "Key flows",
        body: "1) Import leads\n2) Run outreach crew\n3) Review & edit drafts\n4) Approve send\n5) Auto CRM note\n6) Analytics on reply rate (stub)",
      },
      {
        id: "bp-agents",
        title: "Agent contracts",
        body: "Researcher returns JSON hooks. Copywriter consumes hooks + ICP. Brand QA returns score + flags. CRM Writer posts HubSpot note.",
      },
      {
        id: "bp-nfr",
        title: "Non-goals / NFRs",
        body: "No auto-send without human approve in v1. PII stays in workspace. Preview deploy on *.architect.new.",
      },
    ],
    files: [
      {
        path: "app/page.tsx",
        language: "tsx",
        content: `export default function LeadNurtureHome() {
  return (
    <main className="dashboard">
      <h1>Lead Nurture</h1>
      <button>Run outreach</button>
    </main>
  );
}`,
        diff: `+ export default function LeadNurtureHome() {
+   return (
+     <main className="dashboard">
+       <h1>Lead Nurture</h1>
+       <button>Run outreach</button>
+     </main>
+   );
+ }`,
      },
      {
        path: "agents/researcher.ts",
        language: "ts",
        content: `export const researcher = {
  name: "Researcher",
  model: "claude-sonnet-4",
  tools: ["web_search"],
};`,
        diff: `+ export const researcher = {
+   name: "Researcher",
+   model: "claude-sonnet-4",
+   tools: ["web_search"],
+ };`,
      },
      {
        path: "agents/copywriter.ts",
        language: "ts",
        content: `export const copywriter = {
  name: "Copywriter",
  model: "gpt-4.1",
  tools: ["gmail"],
};`,
      },
      {
        path: "lib/hubspot.ts",
        language: "ts",
        content: `export async function writeNote(leadId: string, body: string) {
  // stub connector
  return { ok: true, leadId, body };
}`,
      },
      {
        path: "README.md",
        language: "md",
        content: `# Lead Nurture Crew\n\nAgentic outreach pipeline generated by Architect 2.0.`,
      },
    ],
  };
}

export const TEMPLATES = [
  {
    id: "lead-nurture",
    name: "Lead Nurture Crew",
    pitch: "Research → personalized email → QA → CRM",
    hrsSaved: 6,
  },
  {
    id: "support-triage",
    name: "Support Triage Desk",
    pitch: "Classify tickets → draft replies → escalate",
    hrsSaved: 8,
  },
  {
    id: "research-brief",
    name: "Research Briefing Room",
    pitch: "Scrape sources → synthesize memo → cite",
    hrsSaved: 5,
  },
  {
    id: "hr-onboarding",
    name: "HR Onboarding Concierge",
    pitch: "Checklist → docs → FAQ agent",
    hrsSaved: 4,
  },
];

export const CONSULTANT_ROLES = [
  { id: "sdr", label: "SDR / Sales", ideas: ["lead-nurture", "research-brief"] },
  { id: "ops", label: "RevOps", ideas: ["lead-nurture", "support-triage"] },
  { id: "support", label: "Support lead", ideas: ["support-triage", "hr-onboarding"] },
  { id: "founder", label: "Founder", ideas: ["research-brief", "lead-nurture"] },
];
