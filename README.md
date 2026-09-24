# Architect 2.0

**Design systems of agents. Ship the app.**

Lyzr hiring take-home — a dual-mode vibe-coding demo for **Builders** (non-technical) and **Architects** (technical), sharing one project model. Mocked end-to-end: auth → home → chat/preview → agents → blueprint → code → import → deploy.

> Not a Lovable lilac clone, not a v0 void-black shadcn skin, not Replit neon. Visual system: **Paper / Sage / Copper** with blueprint grids, phase ribbon, crew graph, and stage frame.

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
| Preview is the product | Stage frame with device toggles & live URL chrome |
| Escape hatches by skill | Builder hides code; Architect opens graph/diff/Ship advanced |
| Non-destructive modes | Builder \| Architect toggle in `localStorage`, same project IDs |
| Distinctive craft | Newsreader display + IBM Plex Sans/Mono; Night ink / Day paper tokens |

**Tokens:** background `#F4F1EA` / `#0E1412`, accent sage `#2F6F5E` / `#3D9B82`, signal copper `#C45C26` / `#E07A3D`.

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
| Mock auth (email / Google / GitHub) | P0 ✓ |
| Home: intent composer, project grid, templates | P0 ✓ |
| Consultant (Builder) / Quick starts (Architect) | P0/P1 ✓ |
| Dual mode + Night/Day theme | P0 ✓ |
| Build: chat + preview split, Generate phases | P0 ✓ |
| Agents: cards (Builder) / graph (Architect) + inspector | P0 ✓ |
| Ship: deploy success, URL, GitHub sync stub | P0 ✓ |
| Import: Upload / GitHub / Studio / URL | P0 ✓ |
| Blueprint editable PRD | P1 ✓ |
| Code file tree + diffs (Architect) | P1 ✓ |
| Data / Integrations stubs | OK ✓ |
| Settings: profile, theme, default mode | P0 ✓ |
| Seed project **Lead Nurture Crew** (live) | P0 ✓ |

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

## Click-path for judges (≈90s)

1. **Login** → Continue with Google (or any email) → lands on `/home`.  
2. Open seeded **Lead Nurture Crew** (Live badge) *or* type an intent / pick a Consultant idea.  
3. **Build** — chat left, Stage preview right. Click **Generate** if preview empty.  
4. **Agents** — select Copywriter, edit prompt / tools, Save. Toggle **Architect** mode to see the node graph.  
5. **Blueprint** — skim/edit PRD sections. **Code** (Architect) — open a diff.  
6. **Ship** — Deploy → copper LIVE URL `lead-nurture.architect.new` (or project slug).  
7. Return **Home** — project shows Live. Try **Import** tab flow. Toggle **Night / Day** in header or Settings.

Keyboard: `⌘/Ctrl + Enter` sends intent from the home composer.

---

## Dual-audience notes

| | Builder | Architect |
|---|---|---|
| Home right rail | Consultant role → ideas + hrs saved | Import GitHub / Studio / empty scaffold |
| Chat tone | Product coach | Staff eng framing |
| Agents | Role cards | Absolute CSS graph + edges |
| Code | Hidden empty-state nudge | File tree + diff drawer |
| Ship | One-click Deploy | Env, custom domain, VPC, analytics toggles |
| Preview | Device frame | + console/network stub |

Mode preference persists across refresh; switching never forks the project.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Session redirect → `/home` or `/login` |
| `/login` | Mock auth |
| `/home` | Workspace hub |
| `/projects/new` | Intent / templates → seed crew |
| `/projects/[id]?view=` | Studio: `build` \| `blueprint` \| `agents` \| `code` \| `ship` \| `data` \| `integrations` |
| `/import` | Import wizard |
| `/settings` | Profile, theme, default mode |

---

## Repo

Intended remote: `https://github.com/shivamATpaytm/Architect-2.0`

Push from this machine when ready (do not force-push):

```bash
cd /workspace/Architect-2.0
git init
git add .
git commit -m "Architect 2.0 demo: dual-mode studio for Lyzr take-home"
git remote add origin https://github.com/shivamATpaytm/Architect-2.0.git
git branch -M main
git push -u origin main
```

---

## Explicit non-goals (demo)

Real LLM calls, real OAuth/GitHub API, real deploy, full IDE/terminal, multiplayer.
