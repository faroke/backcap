# Homepage Redesign — Party Mode Notes

> Session date: 2026-03-20
> Participants: John (PM), Winston (Architect), Sally (UX), Mary (Analyst), Carson (Brainstorm), Sophia (Storyteller), Bob (SM)

---

## Core Positioning Decisions

### Problem identified
- "The shadcn/ui for backends" excludes devs outside React ecosystem
- Real feedback: Angular/Nest dev thought it was a frontend tool
- "capabilities" is internal jargon — visitors don't search for "capabilities"
- AI-ready differentiator was buried in a section nobody scrolls to
- No fake metrics — nobody uses the tool yet, stay honest

### New positioning pillars
1. **Built right** → production-ready, well-structured code (communicates clean arch without the jargon)
2. **Works everywhere** → framework-agnostic (Express, Fastify, Hono, Nest, Next.js)
3. **AI-ready** → ships with AI skills, structured for AI agents to understand
4. **Owned by you** → copy & own, not a dependency

### Vocabulary rules
| Don't say | Say instead |
|---|---|
| capabilities | features (or list concrete ones: auth, billing, search) |
| DDD / hexagonal / clean architecture | "built right", "well-structured", show the tree |
| shadcn/ui for backends (as headline) | move to secondary aside/badge |
| Knowledge Graph Ready | "Your AI agent understands every feature" |
| Standardized Manifests | "Specs your tools can read and act on" |
| Domain contracts / Interface Integrity | "Clean boundaries — swap, extend, replace" |
| AI-native | AI-ready |

---

## Page Structure (validated)

```
1. Hero          — pain point + solution + 3 pillars + CTA
2. Problem       — before/after comparison (keep, update wording)
3. How it works  — 3 steps (keep, update wording)
4. Features      — cards grid (replace "capabilities" label)
5. AI-ready      — skills + structure benefits (rewrite bento)
6. Frameworks    — runtimes + frameworks supported (keep)
7. CTA final     — echo hero message
```

### Removed
- **Examples section** (SaaS/Ecommerce/Content) — voted out, redundant with features grid

---

## Section 1: Hero — Decisions

### Headline approach
- **DECIDED: Pain-point / negative** — "Stop rewriting the same backend features."
- Rejected: aspirational/positive ("Backend features, built right and ready to ship")

### Structure
```
Badge:    "Open source · TypeScript · AI-ready"
H1:       "Stop rewriting the same backend features."
Sub:      "Auth, billing, search and more — built right, works everywhere,
           owned by you. Copy production-ready code your AI agent
           already understands."
CTAs:     [Get Started] (primary)  +  [GitHub] (outline) — side by side
Cmd:      npx @backcap/cli init
Aside:    "Think shadcn/ui, but for your backend." (italic, secondary)
Terminal: keep as-is
```

### CTA decisions
- **DECIDED: Option A** — Get Started + GitHub side by side
- Reason: need GitHub stars + want users to see the code
- Removed: "Explore capabilities" button (scroll handles this naturally)

---

## Section 2: Problem (before/after) — Decisions

### Title
- **DECIDED: Change** — don't repeat hero H1
- New angle: recognition/cost ("You've built this before." or "Every project, the same story.")
- Exact wording: TBD

### Left card (Traditional)
- **DECIDED: Reinforce repetition pain** with "again", "yet another"
- Example: "Rewrite auth from scratch — again", "Implement yet another blog system"

### Right card (Backcap)
- **DECIDED: Keep CLI commands** — important to show how easy it is ("just run the CLI and it's done")
- **DECIDED: Rename title** — remove "Backcap capabilities", use something like "With Backcap" or just "Backcap"
- The CLI one-liner per feature IS the value prop here — simplicity

---

## Section 3: How it works — Decisions

### Title
- **DECIDED:** "Three steps. That's it."

### Steps
- Step 1: "Install the CLI" (unchanged)
- Step 2: "Add what you need" (was "Add capabilities")
- Step 3: "It's your code now" (was "Use them in your backend")
  - Mini file tree showing `domains/auth/` with contracts, domain, application
  - `domains/` is default path (configurable, but no need to mention here)

### After steps
- **DECIDED:** Single line trio: `Edit anything · Use AI skills · No lock-in`
- Replaces the old "Override any contract. Swap any layer. No lock-in." (don't stack, replace)
- CTA: "Read the getting started guide" (keep)

---

## Section 4: Features — Decisions

### Badge
- **DECIDED: Remove entirely** — "plug & play" badge removed, no replacement

### Title
- **DECIDED:** "Pick what you need."

### Subtitle
- **DECIDED:** "Production-ready backend features — full source code, zero dependency."

### Layout
- **DECIDED: Winston's proposal (two columns)**
  - Left: compact list of 6 key features (Auth, Billing, Search, RBAC, Notifications, Blog)
  - Each card has arrow → linking to its doc page
  - Right: file tree preview showing the structure of the selected/first feature
  - Below list: "+ 14 more features →" link
- **Mobile:** hide the file tree, show only the feature list
- Reduced from 20 cards to 6 flagship features

### CTA
- **DECIDED (temp):** "How features work" → points to /concepts/capabilities
- **FUTURE:** When features list page exists, switch to "Browse all features"

### Future: /features doc page
- **DECIDED: Keep Yann's proposal 5 (tabs + file explorer + code viewer) for the doc**
- Interactive code explorer with tabs by category (Security, Content, Commerce, Infra)
- File tree on left + syntax-highlighted code on right
- Separate task from landing page redesign

---

## Section 5: AI-ready — Decisions

### Title
- **DECIDED:** "AI-ready by design."

### Subtitle
- **DECIDED:** "Each feature ships with AI skills. Your agent understands your code from day one."

### Layout
- **DECIDED: 3 equal columns** (no bento asymmetry)

### Cards
1. **"Your AI agent, onboarded"**
   - Each feature ships with skills — instructions your AI agent reads to extend, test, and debug your code.
2. **"Generate, don't write"**
   - Ask your agent to add a feature — it follows the same patterns automatically.
3. **"Interfaces your AI can read"**
   - Typed ports and boundaries. Your agent generates compatible code on the first try.

### Removed jargon
- "Knowledge Graph Ready" → gone
- "Standardized Manifests" → gone
- "Interface Integrity" → gone
- "AI-assisted" → "AI-ready"

### CTA
- "Explore AI skills" (keep)

---

## Section 6: Frameworks — Decisions

### Title
- **DECIDED:** "Works with your stack."

### Subtitle
- **DECIDED:** "Same code, any TypeScript runtime or framework."

### Layout
- **DECIDED: Centered, no two-column** — ASCII tree removed (already in How it works step 3)
- Row 1 (Runtimes): Node.js | Bun | Deno
- Row 2 (Frameworks): Next.js | Express | Fastify | Hono | NestJS
- Keep existing icon cards, just center them

### Removed
- ASCII project tree (duplicate of step 3)
- Clean architecture paragraph (already communicated elsewhere)

---

## Section 7: CTA final — Decisions

### Title
- **DECIDED:** "Ready to stop rewriting?"

### Subtitle
- **DECIDED:** "Copy production-ready features. Ship faster."

### CTAs
- **DECIDED:** [Get Started] (primary) + [GitHub] (outline) — same as hero
- Removed: "Explore Capabilities" button

### Microcopy
- **DECIDED: Keep** — "Free & open source. No account required."

### Footer
- **DECIDED:** "TypeScript · Open Source · AI-ready" (was AI-Native)

---

## Open Questions
- Section 2 (Problem): finalize section title wording
- Section 5 (AI-ready): full rewrite of bento grid content
- Section 6 (Frameworks): merge with architecture or keep separate?
- Section 7 (CTA final): align with new hero copy
- **NEW — Doc task:** Create a `/features` page listing all features (Thomas suggestion)
