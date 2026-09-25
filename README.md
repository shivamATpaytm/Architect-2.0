# Architect 2.0

**Design systems of agents. Ship the app.**

Lyzr hiring take-home — a dual-mode vibe-coding demo for **Builders** (non-technical) and **Architects** (technical), sharing one project model. Mocked end-to-end: auth → home → chat/preview → agents → blueprint → code → import → deploy.

> Not a Lovable lilac clone, not a v0 void-black shadcn skin, not Replit neon. Visual system: **Paper / Sage / Copper** with blueprint grids, phase ribbon, crew graph, and stage frame.

**Live:** https://architect-2-0.vercel.app · **Repo:** https://github.com/shivamATpaytm/Architect-2.0

---

## Vision

Architect 2.0 is the **system builder for agentic apps**:

1. **Intent → Blueprint → Crew → Stage** as a phased narrative  
2. **One product, two lenses** — Builder outcome language vs Architect wiring (graph, diffs, GitHub, env)  
3. **Agent graph as first-class UI** — the wedge vs chat-only app builders  

Dummy network actions only (no real LLM / OAuth / deploy). Judging priority: **Design/UI/UX & flows → feature coverage → working functionality**.

---

## Design principles

| Principle | How it shows up |
|---|---|
| Plan ↔ Build duality | Phase ribbon + Generate simulation before Stage populates |
| Preview is the product | Stage frame with device toggles, live URL chrome, Run outreach |
| Escape hatches by skill | Builder hides code; Architect opens graph/diff/Ship advanced |
| Non-destructive modes | Builder \| Architect toggle in `localStorage`, same project IDs |
| Distinctive craft | Newsreader display + IBM Plex Sans/Mono; Night ink / Day paper |

**Tokens:** background `#F3EEE4` / `#0C1210`, accent sage `#2A6B5A` / `#3D9B82`, signal copper `#C45C26` / `#E07A3D`.

---

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4  
- Client state: React context + `localStorage` (session, mode, theme, projects)  
- CSS/SVG agent canvas (no React Flow dependency)  
- Fonts: IBM Plex Sans, IBM Plex Mono, Newsreader  

---

## Feature map

| Area | Status |
|---|---|
| Mock auth (email / Google / GitHub) | ✓ |
| Home: intent composer, project grid, templates | ✓ |
| Consultant (Builder) / Quick starts (Architect) | ✓ |
| Dual mode + Night/Day theme | ✓ |
| Build: chat + preview split, Generate phases | ✓ |
| Agents: cards (Builder) / graph (Architect) + inspector | ✓ |
| Ship: deploy success, URL copy, GitHub sync stub | ✓ |
| Import: Upload / GitHub / Studio / URL | ✓ |
| Blueprint editable PRD | ✓ |
| Code file tree + content/diff tabs (Architect) | ✓ |
| Data / Integrations stubs with CTAs | ✓ |
| Settings: profile, theme, default mode | ✓ |
| Seed project **Lead Nurture Crew** (live) | ✓ |
| Keyboard: `⌘/Ctrl+Enter` send · `⌘/Ctrl+.` mode toggle | ✓ |

---

## How to run

```bash
cd Architect-2.0   # or /workspace/Architect-2.0
npm install
npm run dev
# open http://localhost:3000
```

Production check:

```bash
npm run build && npm start
```

---

## Click-path for judges (≈90s) — Lyzr Submit

1. **Login** → Continue with Google (or any email) → `/home`.  
2. Open seeded **Lead Nurture Crew** (Live badge) *or* use “Open seed project” on Home.  
3. **Build** — chat left, Stage preview right. Click **Generate** if needed; try **Run outreach**.  
4. **Agents** — select Copywriter, edit prompt / tools, **Save changes**. Toggle **Architect** for the node graph.  
5. **Blueprint** — skim/edit PRD. **Code** (Architect) — open a file + Diff tab.  
6. **Ship** — Deploy → copper LIVE URL → **Copy URL**.  
7. Return **Home** — project shows Live. Try **Import**. Toggle **Night / Day**.

Keyboard: `⌘/Ctrl + Enter` sends from home composer · `⌘/Ctrl + .` toggles Builder/Architect.

---

## Dual-audience notes

| | Builder | Architect |
|---|---|---|
| Home right rail | Consultant role → ideas + hrs saved | Import GitHub / Studio / empty scaffold |
| Chat tone | Product coach | Staff eng framing |
| Agents | Role cards | Absolute CSS graph + edges |
| Code | Hidden empty-state + switch CTA | File tree + content/diff |
| Ship | One-click Deploy + copy URL | Env, custom domain, VPC, analytics |
| Preview | Device frame + Run outreach | + console/network stub |

Mode preference persists across refresh; switching never forks the project.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Session redirect → `/home` or `/login` |
| `/login` | Mock auth (split hero) |
| `/home` | Workspace hub |
| `/projects/new` | Intent / templates → seed crew |
| `/projects/[id]?view=` | Studio: `build` \| `blueprint` \| `agents` \| `code` \| `ship` \| `data` \| `integrations` |
| `/import` | Import wizard |
| `/settings` | Profile, theme, default mode |

---

## Explicit non-goals (demo)

Real LLM calls, real OAuth/GitHub API, real deploy, full IDE/terminal, multiplayer.
