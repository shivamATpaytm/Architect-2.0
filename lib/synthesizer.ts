/**
 * Deterministic prompt → project artifact synthesizer.
 * Parses keywords (CRM, email, Slack, HR, legal, research, etc.)
 * and produces distinct docs + UI screens + agents + code stubs.
 * No LLM required. Feels purposeful for the take-home demo.
 */
import type {
  AgentNode,
  BlueprintSection,
  CodeFile,
  IntegrationConnector,
  PreviewScreen,
  Project,
  ScreenWidget,
} from "./types";
import { DEFAULT_INTEGRATIONS } from "./mock/seed";
import { uid } from "./storage";

export type DomainId =
  | "lead-nurture"
  | "support"
  | "hr"
  | "legal"
  | "research"
  | "crm"
  | "slack-ops"
  | "email"
  | "analytics"
  | "generic";

interface DomainProfile {
  id: DomainId;
  nameHint: string;
  audience: string;
  channels: string[];
  goals: string[];
  metrics: string[];
  entities: string[];
  agentRoles: { name: string; role: string; tools: string[]; prompt: string }[];
  screenNames: { name: string; kind: PreviewScreen["kind"]; route: string }[];
  primaryAction: string;
  integrations: string[];
}

const DOMAIN_KEYWORDS: { id: DomainId; words: string[] }[] = [
  { id: "lead-nurture", words: ["lead", "nurture", "sdr", "outreach", "prospect", "inbound", "sales"] },
  { id: "support", words: ["support", "ticket", "triage", "helpdesk", "customer service", "csat"] },
  { id: "hr", words: ["hr", "onboarding", "employee", "people", "hiring", "recruit"] },
  { id: "legal", words: ["legal", "contract", "compliance", "policy", "nda", "clause"] },
  { id: "research", words: ["research", "brief", "synthesize", "memo", "sources", "cite"] },
  { id: "crm", words: ["crm", "hubspot", "salesforce", "pipeline", "deal"] },
  { id: "slack-ops", words: ["slack", "standup", "channel", "notify", "ops"] },
  { id: "email", words: ["email", "gmail", "newsletter", "inbox", "campaign"] },
  { id: "analytics", words: ["analytics", "dashboard", "metrics", "kpi", "report"] },
];

function detectDomain(prompt: string): DomainId {
  const lower = prompt.toLowerCase();
  let best: DomainId = "generic";
  let score = 0;
  for (const d of DOMAIN_KEYWORDS) {
    const hits = d.words.filter((w) => lower.includes(w)).length;
    if (hits > score) {
      score = hits;
      best = d.id;
    }
  }
  return best;
}

function extractChannels(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const channels: string[] = [];
  if (/email|gmail|mail/.test(lower)) channels.push("Email");
  if (/slack/.test(lower)) channels.push("Slack");
  if (/hubspot|crm|salesforce/.test(lower)) channels.push("CRM");
  if (/sms|twilio/.test(lower)) channels.push("SMS");
  if (/linkedin/.test(lower)) channels.push("LinkedIn");
  if (/webhook|api/.test(lower)) channels.push("API");
  if (channels.length === 0) channels.push("In-app", "Email");
  return channels;
}

function extractAudience(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (/sdr|ae|sales/.test(lower)) return "SDRs / AEs";
  if (/support|agent|csm/.test(lower)) return "Support agents";
  if (/hr|people|recruit/.test(lower)) return "People ops / HR";
  if (/legal|counsel/.test(lower)) return "Legal / compliance";
  if (/founder|exec/.test(lower)) return "Founders / operators";
  if (/saas/.test(lower)) return "SaaS GTM teams";
  return "Ops teams";
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveProjectName(prompt: string, domain: DomainId): string {
  const cleaned = prompt
    .replace(/^(build|create|make|i need|help me)\s+/i, "")
    .trim();
  const words = cleaned.split(/\s+/).slice(0, 5);
  if (words.length >= 2) {
    const name = titleCase(words.join(" ")).replace(/[,.]$/, "");
    if (name.length > 8 && name.length < 48) return name;
  }
  const fallbacks: Record<DomainId, string> = {
    "lead-nurture": "Lead Nurture Desk",
    support: "Support Triage Desk",
    hr: "HR Onboarding Concierge",
    legal: "Legal Review Desk",
    research: "Research Briefing Room",
    crm: "CRM Ops Crew",
    "slack-ops": "Slack Ops Crew",
    email: "Email Campaign Desk",
    analytics: "Analytics Command",
    generic: "Agentic Workspace",
  };
  return fallbacks[domain];
}

function profileFor(
  prompt: string,
  domain: DomainId,
  channels: string[],
  audience: string
): DomainProfile {
  const base: Record<DomainId, Omit<DomainProfile, "channels" | "audience">> = {
    "lead-nurture": {
      id: domain,
      nameHint: "Lead Nurture",
      goals: [
        "Research inbound leads against ICP",
        "Draft personalized outreach",
        "QA brand tone before send",
        "Log activity to CRM",
      ],
      metrics: ["Reply rate", "Time-to-first-touch", "QA pass rate", "CRM sync lag"],
      entities: ["Lead", "Draft", "ICPRule", "CrmNote"],
      primaryAction: "Run outreach",
      integrations: ["gmail", "hubspot", "web-search", "slack"],
      agentRoles: [
        {
          name: "Researcher",
          role: "Lead intelligence",
          tools: ["Web search", "LinkedIn stub"],
          prompt: "Research prospects using ICP. Return firmographics and hooks as JSON.",
        },
        {
          name: "Copywriter",
          role: "Personalized outreach",
          tools: ["Gmail"],
          prompt: "Draft warm concise emails using research hooks. Never invent pricing.",
        },
        {
          name: "Brand QA",
          role: "Tone & compliance",
          tools: [],
          prompt: "Score drafts for tone, claims, CTA clarity. Flag risky language.",
        },
        {
          name: "CRM Writer",
          role: "CRM notes",
          tools: ["HubSpot"],
          prompt: "Summarize outreach intent and next step into a CRM note.",
        },
      ],
      screenNames: [
        { name: "Dashboard", kind: "dashboard", route: "/" },
        { name: "Leads", kind: "list", route: "/leads" },
        { name: "Lead detail", kind: "detail", route: "/leads/[id]" },
        { name: "Compose", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    support: {
      id: domain,
      nameHint: "Support Triage",
      goals: ["Classify tickets", "Draft replies", "Escalate high severity", "Track CSAT"],
      metrics: ["First response time", "Resolution rate", "Escalation %", "CSAT"],
      entities: ["Ticket", "Reply", "Tag", "Escalation"],
      primaryAction: "Triage inbox",
      integrations: ["slack", "web-search"],
      agentRoles: [
        {
          name: "Classifier",
          role: "Intent & severity",
          tools: ["Web search"],
          prompt: "Label ticket intent and severity. Suggest routing queue.",
        },
        {
          name: "Reply Drafter",
          role: "Customer replies",
          tools: [],
          prompt: "Draft empathetic replies using KB. Cite policy when relevant.",
        },
        {
          name: "Escalator",
          role: "Severity gate",
          tools: ["Slack"],
          prompt: "Escalate P1/P2 to on-call Slack with summary context.",
        },
      ],
      screenNames: [
        { name: "Inbox", kind: "inbox", route: "/" },
        { name: "Tickets", kind: "list", route: "/tickets" },
        { name: "Ticket detail", kind: "detail", route: "/tickets/[id]" },
        { name: "Compose reply", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    hr: {
      id: domain,
      nameHint: "HR Onboarding",
      goals: ["Guide new hires", "Collect docs", "Answer FAQ", "Track checklist"],
      metrics: ["Checklist completion", "Time-to-productive", "FAQ deflection"],
      entities: ["Hire", "ChecklistItem", "Document", "FAQ"],
      primaryAction: "Start onboarding",
      integrations: ["slack", "gmail"],
      agentRoles: [
        {
          name: "Concierge",
          role: "Onboarding guide",
          tools: ["Slack"],
          prompt: "Walk new hires through day-1 checklist. Celebrate milestones.",
        },
        {
          name: "Doc Collector",
          role: "Document intake",
          tools: ["Gmail"],
          prompt: "Request and verify required onboarding documents.",
        },
        {
          name: "FAQ Agent",
          role: "Policy answers",
          tools: [],
          prompt: "Answer benefits/policy questions from the HR KB only.",
        },
      ],
      screenNames: [
        { name: "Dashboard", kind: "dashboard", route: "/" },
        { name: "New hires", kind: "list", route: "/hires" },
        { name: "Hire detail", kind: "detail", route: "/hires/[id]" },
        { name: "Checklist", kind: "board", route: "/checklist" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    legal: {
      id: domain,
      nameHint: "Legal Review",
      goals: ["Review contracts", "Flag risky clauses", "Suggest redlines", "Track approvals"],
      metrics: ["Review turnaround", "Risk flags/doc", "Approval lag"],
      entities: ["Contract", "Clause", "RiskFlag", "Approval"],
      primaryAction: "Review contract",
      integrations: ["slack", "web-search"],
      agentRoles: [
        {
          name: "Clause Scanner",
          role: "Contract intake",
          tools: [],
          prompt: "Extract clauses and map to playbook categories.",
        },
        {
          name: "Risk Analyst",
          role: "Risk scoring",
          tools: ["Web search"],
          prompt: "Score clause risk vs company playbook. Cite precedent.",
        },
        {
          name: "Redline Drafter",
          role: "Suggested edits",
          tools: ["Slack"],
          prompt: "Propose redlines and notify counsel via Slack.",
        },
      ],
      screenNames: [
        { name: "Dashboard", kind: "dashboard", route: "/" },
        { name: "Contracts", kind: "list", route: "/contracts" },
        { name: "Contract detail", kind: "detail", route: "/contracts/[id]" },
        { name: "Compose memo", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    research: {
      id: domain,
      nameHint: "Research Briefing",
      goals: ["Gather sources", "Synthesize memo", "Cite claims", "Share brief"],
      metrics: ["Sources/brief", "Cite coverage", "Time-to-memo"],
      entities: ["Source", "Claim", "Brief", "Citation"],
      primaryAction: "Generate brief",
      integrations: ["web-search", "slack"],
      agentRoles: [
        {
          name: "Scout",
          role: "Source gathering",
          tools: ["Web search"],
          prompt: "Find high-signal sources. Prefer primary + recent.",
        },
        {
          name: "Synthesizer",
          role: "Memo writer",
          tools: [],
          prompt: "Write structured briefs with claims mapped to citations.",
        },
        {
          name: "Cite Checker",
          role: "Claim QA",
          tools: [],
          prompt: "Verify every claim has a citation. Flag unsupported.",
        },
      ],
      screenNames: [
        { name: "Dashboard", kind: "dashboard", route: "/" },
        { name: "Sources", kind: "list", route: "/sources" },
        { name: "Brief detail", kind: "detail", route: "/briefs/[id]" },
        { name: "Compose brief", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    crm: {
      id: domain,
      nameHint: "CRM Ops",
      goals: ["Enrich accounts", "Update pipeline", "Draft follow-ups", "Alert on risk"],
      metrics: ["Enrichment coverage", "Pipeline hygiene", "Follow-up SLA"],
      entities: ["Account", "Deal", "Activity", "Alert"],
      primaryAction: "Sync pipeline",
      integrations: ["hubspot", "gmail", "slack"],
      agentRoles: [
        {
          name: "Enricher",
          role: "Account intelligence",
          tools: ["Web search", "HubSpot"],
          prompt: "Enrich account firmographics and recent news into CRM.",
        },
        {
          name: "Follow-up Writer",
          role: "Outbound drafts",
          tools: ["Gmail"],
          prompt: "Draft follow-ups from deal stage and last activity.",
        },
        {
          name: "Risk Watcher",
          role: "Deal alerts",
          tools: ["Slack", "HubSpot"],
          prompt: "Flag stale or at-risk deals to Slack.",
        },
      ],
      screenNames: [
        { name: "Pipeline", kind: "dashboard", route: "/" },
        { name: "Accounts", kind: "list", route: "/accounts" },
        { name: "Deal detail", kind: "detail", route: "/deals/[id]" },
        { name: "Compose", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    "slack-ops": {
      id: domain,
      nameHint: "Slack Ops",
      goals: ["Summarize channels", "Route actions", "Draft replies", "Track follow-ups"],
      metrics: ["Summary latency", "Action completion", "Noise reduction"],
      entities: ["ChannelDigest", "Action", "Thread"],
      primaryAction: "Run digest",
      integrations: ["slack", "web-search"],
      agentRoles: [
        {
          name: "Digest",
          role: "Channel summarizer",
          tools: ["Slack"],
          prompt: "Summarize channel activity into actionable digests.",
        },
        {
          name: "Router",
          role: "Action routing",
          tools: ["Slack"],
          prompt: "Create action items and assign owners from digests.",
        },
        {
          name: "Drafter",
          role: "Reply assistant",
          tools: ["Slack"],
          prompt: "Draft thread replies matching team tone.",
        },
      ],
      screenNames: [
        { name: "Digest", kind: "dashboard", route: "/" },
        { name: "Channels", kind: "list", route: "/channels" },
        { name: "Thread", kind: "detail", route: "/threads/[id]" },
        { name: "Compose", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    email: {
      id: domain,
      nameHint: "Email Desk",
      goals: ["Segment audiences", "Draft campaigns", "QA copy", "Track opens"],
      metrics: ["Open rate", "Click rate", "Unsubscribe", "QA score"],
      entities: ["Segment", "Campaign", "Draft", "Metric"],
      primaryAction: "Launch campaign",
      integrations: ["gmail", "web-search"],
      agentRoles: [
        {
          name: "Segmenter",
          role: "Audience builder",
          tools: [],
          prompt: "Build segments from behavior and firmographics.",
        },
        {
          name: "Campaign Writer",
          role: "Email copy",
          tools: ["Gmail"],
          prompt: "Draft campaign emails with clear CTA and brand voice.",
        },
        {
          name: "Copy QA",
          role: "Brand gate",
          tools: [],
          prompt: "Score emails for clarity, spam risk, and CTA strength.",
        },
      ],
      screenNames: [
        { name: "Campaigns", kind: "dashboard", route: "/" },
        { name: "Segments", kind: "list", route: "/segments" },
        { name: "Campaign detail", kind: "detail", route: "/campaigns/[id]" },
        { name: "Compose", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    analytics: {
      id: domain,
      nameHint: "Analytics Command",
      goals: ["Aggregate KPIs", "Explain anomalies", "Draft reports", "Alert owners"],
      metrics: ["Data freshness", "Anomaly precision", "Report latency"],
      entities: ["Metric", "Anomaly", "Report", "Alert"],
      primaryAction: "Refresh KPIs",
      integrations: ["slack", "web-search"],
      agentRoles: [
        {
          name: "Aggregator",
          role: "KPI collector",
          tools: ["Web search"],
          prompt: "Pull KPIs and normalize into a daily scorecard.",
        },
        {
          name: "Explainer",
          role: "Anomaly analysis",
          tools: [],
          prompt: "Explain metric swings with likely drivers.",
        },
        {
          name: "Reporter",
          role: "Narrative reports",
          tools: ["Slack"],
          prompt: "Draft weekly reports and post highlights to Slack.",
        },
      ],
      screenNames: [
        { name: "Scorecard", kind: "dashboard", route: "/" },
        { name: "Metrics", kind: "list", route: "/metrics" },
        { name: "Anomaly", kind: "detail", route: "/anomalies/[id]" },
        { name: "Compose report", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
    generic: {
      id: domain,
      nameHint: "Agent Workspace",
      goals: [
        `Deliver outcomes for: ${prompt.slice(0, 80)}`,
        "Coordinate specialized agents",
        "Keep humans in the loop for approve steps",
      ],
      metrics: ["Cycle time", "Approval rate", "Automation coverage"],
      entities: ["Task", "Artifact", "AgentRun", "Approval"],
      primaryAction: "Run workflow",
      integrations: ["web-search", "slack"],
      agentRoles: [
        {
          name: "Planner",
          role: "Task breakdown",
          tools: [],
          prompt: `Break work into steps for: ${prompt.slice(0, 100)}`,
        },
        {
          name: "Builder",
          role: "Artifact producer",
          tools: ["Web search"],
          prompt: "Produce drafts and artifacts from the plan.",
        },
        {
          name: "Reviewer",
          role: "Quality gate",
          tools: ["Slack"],
          prompt: "Review outputs and request human approve when needed.",
        },
      ],
      screenNames: [
        { name: "Dashboard", kind: "dashboard", route: "/" },
        { name: "Work queue", kind: "list", route: "/queue" },
        { name: "Item detail", kind: "detail", route: "/items/[id]" },
        { name: "Compose", kind: "compose", route: "/compose" },
        { name: "Settings", kind: "settings", route: "/settings" },
      ],
    },
  };

  return { ...base[domain], channels, audience };
}

function sampleRows(domain: DomainId, prompt: string): [string, string, string][] {
  const lower = prompt.toLowerCase();
  const saas = /saas/.test(lower);
  const tables: Record<DomainId, [string, string, string][]> = {
    "lead-nurture": [
      [saas ? "Maya Chen · Northwind SaaS" : "Maya Chen · Northwind", "QA pass", "Series B + hiring SDRs"],
      ["Omar Patel · Cobalt", "Drafting", "Opened pricing 3×"],
      ["Iris Ng · Lattice", "Researched", "Spoke at RevSummit"],
    ],
    support: [
      ["#4821 · Billing hold", "P2", "Cannot upgrade plan"],
      ["#4819 · SSO fail", "P1", "Okta callback 500"],
      ["#4815 · Feature ask", "P3", "CSV export on reports"],
    ],
    hr: [
      ["Jordan Lee · Eng", "Day 2", "Laptop + Slack done"],
      ["Priya Shah · Sales", "Day 1", "Awaiting I-9"],
      ["Chris Okonkwo · Design", "Week 1", "Buddy assigned"],
    ],
    legal: [
      ["Acme MSA v3", "High risk", "Indemnity uncapped"],
      ["Beta NDA", "Low risk", "Mutual · 2yr"],
      ["Vendor DPA", "Medium", "Subprocessor list stale"],
    ],
    research: [
      ["AI SDR market 2026", "Draft", "12 sources"],
      ["Competitor pricing", "Ready", "Cited"],
      ["Buyer personas", "In review", "8 sources"],
    ],
    crm: [
      ["Acme · Expansion", "Negotiation", "Stale 14d"],
      ["Globex · New logo", "Discovery", "Demo booked"],
      ["Initech · Renewal", "At risk", "Champion left"],
    ],
    "slack-ops": [
      ["#gtm-war-room", "12 actions", "Digest ready"],
      ["#support-p1", "3 open", "Needs owner"],
      ["#product-feedback", "8 themes", "Weekly rollup"],
    ],
    email: [
      ["SDR spring nurture", "QA", "Open 38%"],
      ["Product launch wave 2", "Draft", "Segment: PLG"],
      ["Win-back cold", "Ready", "CTA: book demo"],
    ],
    analytics: [
      ["Activation rate", "↓ 4%", "Onboarding drop D2"],
      ["NRR", "↑ 2%", "Expansion cohort"],
      ["Support CSAT", "Flat", "P1 spike Mon"],
    ],
    generic: [
      ["Work item A", "In progress", "Owner: Planner"],
      ["Work item B", "Queued", "Needs review"],
      ["Work item C", "Done", "Approved"],
    ],
  };
  return tables[domain];
}

function buildWidgets(
  kind: PreviewScreen["kind"],
  profile: DomainProfile,
  prompt: string,
  rows: [string, string, string][]
): ScreenWidget[] {
  const ch = profile.channels.join(" · ");
  switch (kind) {
    case "dashboard":
      return [
        { type: "stat", label: profile.metrics[0], value: "128", meta: ch },
        { type: "stat", label: profile.metrics[1] || "Throughput", value: "34", meta: "this week" },
        { type: "stat", label: profile.metrics[2] || "Quality", value: "92%", meta: "pass" },
        { type: "badge", label: "Audience", value: profile.audience },
        { type: "row", label: rows[0][0], value: rows[0][1], meta: rows[0][2] },
        { type: "row", label: rows[1][0], value: rows[1][1], meta: rows[1][2] },
      ];
    case "list":
    case "inbox":
    case "board":
      return rows.map((r) => ({
        type: "row" as const,
        label: r[0],
        value: r[1],
        meta: r[2],
      }));
    case "detail":
      return [
        { type: "card", label: "Context", value: prompt.slice(0, 140) },
        { type: "badge", label: "Channels", value: ch },
        { type: "row", label: rows[0][0], value: rows[0][1], meta: rows[0][2] },
        { type: "form", label: "Next step", value: profile.primaryAction },
      ];
    case "compose":
      return [
        { type: "form", label: "To / target", value: profile.audience },
        { type: "form", label: "Channel", value: profile.channels[0] || "Email" },
        {
          type: "form",
          label: "Draft",
          value: `Hi — following up on ${profile.nameHint.toLowerCase()} for your team…`,
        },
        { type: "badge", label: "Tone", value: "Professional · concise" },
      ];
    case "settings":
      return [
        { type: "row", label: "Integrations", value: profile.integrations.join(", ") },
        { type: "row", label: "Audience", value: profile.audience },
        { type: "row", label: "Human approve", value: "Required before send" },
        { type: "form", label: "Workspace name", value: profile.nameHint },
      ];
    default:
      return [{ type: "card", label: "Preview", value: prompt.slice(0, 100) }];
  }
}

function buildScreens(profile: DomainProfile, prompt: string): PreviewScreen[] {
  const rows = sampleRows(profile.id, prompt);
  return profile.screenNames.map((s, i) => ({
    id: `screen-${i}-${s.kind}`,
    name: s.name,
    route: s.route,
    kind: s.kind,
    headline: s.kind === "dashboard" || s.kind === "inbox"
      ? profile.nameHint
      : s.name,
    subhead:
      s.kind === "dashboard"
        ? `${profile.goals[0]} · via ${profile.channels.join(" + ")}`
        : s.kind === "compose"
          ? `Draft for ${profile.audience}`
          : s.kind === "settings"
            ? "Workspace · connectors · approve rules"
            : `${profile.audience} · ${profile.channels.slice(0, 2).join(" / ")}`,
    primaryCta: s.kind === "compose" ? "Send draft" : profile.primaryAction,
    widgets: buildWidgets(s.kind, profile, prompt, rows),
  }));
}

function buildBlueprint(profile: DomainProfile, prompt: string, name: string): BlueprintSection[] {
  return [
    {
      id: "bp-overview",
      title: "Overview / Goals",
      body: `${name} is generated from your prompt: “${prompt.trim()}”.\n\nGoals:\n${profile.goals.map((g, i) => `${i + 1}. ${g}`).join("\n")}\n\nChannels: ${profile.channels.join(", ")}. Audience: ${profile.audience}.`,
    },
    {
      id: "bp-users",
      title: "Users & jobs",
      body: `Primary users: ${profile.audience}.\nJob-to-be-done: ${profile.goals[0]}.\nSecondary: ops leads reviewing ${profile.metrics[0].toLowerCase()} and approve gates.`,
    },
    {
      id: "bp-flows",
      title: "Key flows",
      body: `1) Capture / import work items\n2) ${profile.primaryAction}\n3) Agent crew runs (${profile.agentRoles.map((a) => a.name).join(" → ")})\n4) Human review on Stage\n5) Sync to ${profile.channels.join(" / ")}\n6) Track ${profile.metrics.slice(0, 2).join(" & ")}`,
    },
    {
      id: "bp-success",
      title: "Success metrics",
      body: profile.metrics.map((m) => `• ${m}`).join("\n"),
    },
    {
      id: "bp-data",
      title: "Data model notes",
      body: `Core entities: ${profile.entities.join(", ")}.\nIntegrations: ${profile.integrations.join(", ")}.\nPII stays in workspace; approve-before-send in v1.`,
    },
    {
      id: "bp-agents",
      title: "Agent contracts",
      body: profile.agentRoles
        .map((a) => `• ${a.name} (${a.role}): ${a.prompt}`)
        .join("\n"),
    },
  ];
}

function buildAgents(profile: DomainProfile): AgentNode[] {
  const agents: AgentNode[] = profile.agentRoles.map((a, i) => ({
    id: `agent-${a.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: a.name,
    role: a.role,
    model: i % 2 === 0 ? "claude-sonnet-4" : "gpt-4.1",
    systemPrompt: a.prompt,
    tools: a.tools,
    kb: ["workspace-kb.pdf"],
    status: "ready" as const,
    x: 80 + (i % 3) * 240,
    y: 100 + Math.floor(i / 3) * 160,
  }));
  agents.push({
    id: "node-kb",
    name: "Knowledge",
    role: "Shared KB",
    model: "—",
    systemPrompt: "workspace-kb.pdf · playbook.md",
    tools: [],
    kb: ["workspace-kb.pdf"],
    status: "ready",
    x: 200,
    y: 320,
  });
  return agents;
}

function buildFiles(
  profile: DomainProfile,
  name: string,
  screens: PreviewScreen[]
): CodeFile[] {
  const componentName = name.replace(/[^a-zA-Z0-9]/g, "") || "App";
  const routes = screens
    .map((s) => `  { path: "${s.route}", name: "${s.name}" }`)
    .join(",\n");
  const agentExports = profile.agentRoles
    .map(
      (a) =>
        `export const ${a.name.toLowerCase().replace(/\s+/g, "_")} = {\n  name: "${a.name}",\n  role: "${a.role}",\n  tools: ${JSON.stringify(a.tools)},\n};`
    )
    .join("\n\n");

  return [
    {
      path: "app/page.tsx",
      language: "tsx",
      content: `export default function ${componentName}Home() {
  return (
    <main className="dashboard">
      <h1>${name}</h1>
      <p>${profile.goals[0]}</p>
      <button>${profile.primaryAction}</button>
    </main>
  );
}`,
      diff: `+ export default function ${componentName}Home() { ... }`,
    },
    {
      path: "app/screens.ts",
      language: "ts",
      content: `export const screens = [\n${routes}\n];`,
    },
    {
      path: "agents/crew.ts",
      language: "ts",
      content: agentExports,
    },
    {
      path: "lib/connectors.ts",
      language: "ts",
      content: `export const connectors = ${JSON.stringify(profile.integrations, null, 2)};\n\nexport async function runPrimaryAction() {\n  return { ok: true, action: "${profile.primaryAction}" };\n}`,
    },
    {
      path: "README.md",
      language: "md",
      content: `# ${name}\n\nGenerated by Architect 2.0 from a single prompt.\n\nChannels: ${profile.channels.join(", ")}\nAudience: ${profile.audience}\n`,
    },
  ];
}

function buildIntegrations(profile: DomainProfile): IntegrationConnector[] {
  return DEFAULT_INTEGRATIONS.map((c) => ({
    ...c,
    connected: profile.integrations.includes(c.id),
  }));
}

export interface SynthResult {
  name: string;
  pitch: string;
  domain: DomainId;
  channels: string[];
  audience: string;
  blueprint: BlueprintSection[];
  screens: PreviewScreen[];
  agents: AgentNode[];
  files: CodeFile[];
  integrations: IntegrationConnector[];
  primaryAction: string;
  understanding: string;
}

export function synthesizeFromPrompt(prompt: string, templateId?: string): SynthResult {
  let domain = detectDomain(prompt);
  if (templateId === "lead-nurture") domain = "lead-nurture";
  if (templateId === "support-triage") domain = "support";
  if (templateId === "research-brief") domain = "research";
  if (templateId === "hr-onboarding") domain = "hr";

  const channels = extractChannels(prompt);
  const audience = extractAudience(prompt);
  const profile = profileFor(prompt, domain, channels, audience);
  const name = deriveProjectName(prompt, domain);
  const screens = buildScreens(profile, prompt);
  const blueprint = buildBlueprint(profile, prompt, name);
  const agents = buildAgents(profile);
  const files = buildFiles(profile, name, screens);
  const integrations = buildIntegrations(profile);
  const pitch = `${profile.goals[0]} · ${channels.join(" + ")} · for ${audience}`;

  const understanding = `Understood: a ${profile.nameHint.toLowerCase()} for ${audience} across ${channels.join(", ")}. I'll generate Blueprint docs, ${screens.length} UI screens, and a ${profile.agentRoles.length}-agent crew together.`;

  return {
    name,
    pitch,
    domain,
    channels,
    audience,
    blueprint,
    screens,
    agents,
    files,
    integrations,
    primaryAction: profile.primaryAction,
    understanding,
  };
}

/** Apply a refine chip / chat follow-up mutation to screens + blueprint. */
export function applyRefine(
  project: Project,
  instruction: string
): Partial<Project> {
  const lower = instruction.toLowerCase();
  let screens = project.screens.map((s) => ({ ...s, widgets: s.widgets.map((w) => ({ ...w })) }));
  let blueprint = project.blueprint.map((b) => ({ ...b }));
  const notes: string[] = [];

  if (/denser|compact/.test(lower)) {
    screens = screens.map((s) => ({
      ...s,
      subhead: s.subhead + " · compact density",
      widgets: [
        ...s.widgets,
        { type: "badge" as const, label: "Density", value: "Compact" },
      ],
    }));
    notes.push("Applied denser layout to all screens");
  }
  if (/auth|login|sso/.test(lower)) {
    const hasAuth = screens.some((s) => s.id === "screen-auth");
    if (!hasAuth) {
      screens.push({
        id: "screen-auth",
        name: "Sign in",
        route: "/login",
        kind: "settings",
        headline: "Sign in",
        subhead: "SSO · email magic link",
        primaryCta: "Continue",
        widgets: [
          { type: "form", label: "Work email", value: "you@company.com" },
          { type: "badge", label: "Providers", value: "Google · GitHub · SSO" },
        ],
      });
    }
    blueprint = blueprint.map((b) =>
      b.id === "bp-flows"
        ? { ...b, body: b.body + "\n7) Auth gate (SSO / magic link) before Stage actions" }
        : b
    );
    notes.push("Added Sign in screen + auth gate to flows");
  }
  if (/dark|night/.test(lower)) {
    screens = screens.map((s) => ({
      ...s,
      subhead: s.subhead.replace(/· dark dashboard/, "") + " · dark dashboard",
      widgets: [
        { type: "badge" as const, label: "Theme", value: "Dark dashboard" },
        ...s.widgets,
      ],
    }));
    notes.push("Tinted Stage toward dark dashboard");
  }
  if (/casual|warmer|friendly/.test(lower)) {
    screens = screens.map((s) =>
      s.kind === "compose"
        ? {
            ...s,
            widgets: s.widgets.map((w) =>
              w.label === "Draft" || w.type === "form"
                ? { ...w, value: (w.value || "").replace(/^Hi —/, "Hey —") }
                : w.label === "Tone"
                  ? { ...w, value: "Warm · casual" }
                  : w
            ),
          }
        : s
    );
    notes.push("Warmed up compose tone");
  }
  if (/slack/.test(lower) && !/remove/.test(lower)) {
    blueprint = blueprint.map((b) =>
      b.id === "bp-overview" && !b.body.includes("Slack")
        ? { ...b, body: b.body + "\n\nSlack notifications enabled for approve events." }
        : b
    );
    notes.push("Emphasized Slack in Blueprint");
  }
  if (notes.length === 0) {
    screens = screens.map((s, i) =>
      i === 0
        ? {
            ...s,
            widgets: [
              ...s.widgets,
              { type: "badge" as const, label: "Update", value: instruction.slice(0, 40) },
            ],
          }
        : s
    );
    notes.push("Folded instruction into dashboard");
  }

  return {
    screens,
    blueprint,
    generationVersion: (project.generationVersion || 1) + 1,
    activeScreenId: screens[0]?.id,
    updatedAt: new Date().toISOString(),
  };
}

export function emptyProjectShell(
  synth: SynthResult,
  prompt: string,
  opts?: { templateId?: string }
): Project {
  const now = new Date().toISOString();
  return {
    id: uid("proj"),
    name: synth.name,
    pitch: synth.pitch,
    prompt,
    domain: synth.domain,
    status: "queued",
    phase: "consulting",
    createdAt: now,
    updatedAt: now,
    template: opts?.templateId,
    previewReady: false,
    githubConnected: false,
    pullRequests: [],
    generationVersion: 0,
    planMode: false,
    screens: [],
    activeScreenId: undefined,
    agents: [],
    blueprint: [],
    files: [],
    dataAssets: [],
    integrations: synth.integrations.map((c) => ({ ...c, connected: false })),
    buildProgress: {
      state: "queued",
      stepLabel: "Understanding prompt",
      etaLabel: "~40s",
      startedAt: now,
      percent: 5,
      step: "understanding",
    },
    outreach: {
      status: "idle",
      counts: { leads: 0, drafts: 0, crm: 0 },
      logs: [],
    },
    checkpoints: [],
    chat: [
      {
        id: uid("msg"),
        role: "system",
        phase: "consulting",
        content: "Build started — Understanding → Spec → UI → Agents → Ready",
        timestamp: now,
      },
      {
        id: uid("msg"),
        role: "user",
        content: prompt,
        timestamp: now,
      },
      {
        id: uid("msg"),
        role: "assistant",
        phase: "consulting",
        content: synth.understanding,
        timestamp: now,
        chips: ["Make denser", "Add auth", "Dark dashboard"],
      },
    ],
  };
}

/** Progressive artifact payloads for the multi-phase build lifecycle. */
export function phaseArtifacts(synth: SynthResult, step: "spec" | "ui" | "agents" | "ready") {
  if (step === "spec") {
    return {
      blueprint: synth.blueprint,
      phase: "blueprint" as const,
    };
  }
  if (step === "ui") {
    return {
      screens: synth.screens.slice(0, 3),
      activeScreenId: synth.screens[0]?.id,
      previewReady: true,
      phase: "stage" as const,
    };
  }
  if (step === "agents") {
    return {
      screens: synth.screens,
      agents: synth.agents,
      activeScreenId: synth.screens[0]?.id,
      phase: "crew" as const,
      previewReady: true,
    };
  }
  return {
    screens: synth.screens,
    agents: synth.agents,
    blueprint: synth.blueprint,
    files: synth.files,
    integrations: synth.integrations,
    previewReady: true,
    phase: "stage" as const,
    status: "ready" as const,
    generationVersion: 1,
  };
}
