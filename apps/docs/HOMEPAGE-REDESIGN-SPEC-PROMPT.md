# Homepage Redesign — Implementation Spec Prompt

Use this prompt with an agent to generate the full implementation spec.

---

## Prompt

You are rewriting the landing page of an open-source developer tool called **Backcap** — a registry of production-ready backend features for TypeScript that developers copy into their own projects (copy & own model, not a dependency).

The landing page is a single Astro component using Starlight's splash template: `apps/docs/src/pages/index.astro`. It includes HTML structure, scoped CSS, and vanilla JS. The design is dark theme with green/cyan accent colors. Read the current file to understand the existing visual effects (orbs, glows, grid patterns, scroll animations, terminal animation) — preserve the visual identity but apply the new content and structure below.

---

### Context & Constraints

- **No fake metrics.** The project is early-stage. No "trusted by X teams", no download counters, no testimonials.
- **No internal jargon.** Never use "capabilities" (say "features" or list concrete names: auth, billing, search). Never use DDD, hexagonal, clean architecture in copy. Show the structure visually instead.
- **shadcn/ui reference is secondary.** It was the original headline — it confused devs outside React. Keep it only as an italic aside below the hero CTAs.
- **AI-ready is a key differentiator.** Backcap ships AI skills with each feature so AI agents can understand, extend, and generate code.

### Vocabulary Rules

| Banned term | Replacement |
|---|---|
| capabilities | features (or concrete names: auth, billing, search) |
| DDD / hexagonal / clean architecture | "built right" or show the file tree |
| Knowledge Graph Ready | "Your AI agent understands every feature" |
| Standardized Manifests | "Specs your tools can read and act on" |
| Domain contracts / Interface Integrity | "Clean boundaries — swap, extend, replace" |
| AI-native | AI-ready |

### Four Positioning Pillars

Every section should reinforce one or more of these:

1. **Built right** — production-ready, well-structured code
2. **Works everywhere** — framework-agnostic (Express, Fastify, Hono, Nest, Next.js)
3. **AI-ready** — ships with AI skills, structured for AI agents
4. **Owned by you** — copy & own, full source code, no lock-in

---

### Page Structure (7 sections)

The **Examples section** (SaaS/Ecommerce/Content Platform) that existed before is **removed entirely**.

---

#### Section 1: Hero

```
Badge:     "Open source · TypeScript · AI-ready"
H1:        "Stop rewriting the same backend features."
           (Apply gradient-text to "backend features.")
Sub:       "Auth, billing, search and more — built right, works everywhere,
            owned by you. Copy production-ready code your AI agent
            already understands."
CTAs:      [Get Started →] (primary button, links to /getting-started/introduction)
           [GitHub ★] (outline button, links to https://github.com/faroke/backcap)
           Side by side. Only these two — no third button.
Cmd box:   $ npx @backcap/cli init  (with copy button, keep existing behavior)
Aside:     "Think shadcn/ui, but for your backend." — italic, muted, small, centered below cmd box
Terminal:  Keep the existing animated terminal exactly as-is
```

Visual: keep hero orbs, bg-grid, scroll animations.

---

#### Section 2: Problem (before/after)

```
Title:     "You've already built this before."
           (Apply gradient-text to "already built this")
```

Two-column comparison grid (keep existing layout with glow on right card):

**Left card — "Traditional backend development":**
```
✗ Rewrite auth from scratch — again
✗ Build custom permissions — for the third time
✗ Implement yet another blog system
✗ Create yet another search engine
✗ Set up notifications — once more
✗ Handle billing logic — again
```

**Right card — "With Backcap":**
```
✓ npx @backcap/cli add auth
✓ npx @backcap/cli add rbac
✓ npx @backcap/cli add blog
✓ npx @backcap/cli add search
✓ npx @backcap/cli add notifications
✓ npx @backcap/cli add billing
```

Keep the enhanced glow effect on the right card.

---

#### Section 3: How it works

```
Title:     "Three steps. That's it."
           (Apply gradient-text to "That's it.")
```

Three-column step grid:

**Step 01 — "Install the CLI"**
- "Initialize Backcap in your existing TypeScript project."
- Code block: `npx @backcap/cli init`

**Step 02 — "Add what you need"**
- "Pick the backend features for your project."
- Code block (3 lines): `npx @backcap/cli add auth` / `add blog` / `add search`

**Step 03 — "It's your code now"**
- "Full source code, directly in your project. Every feature follows the same clean structure."
- Mini file tree (monospace, colored):
  ```
  your-project/
    └── domains/
         └── auth/
              ├── contracts/
              ├── domain/
              └── application/
  ```
  (Use primary color for directories like `domains/`, `auth/`. Use accent for `contracts/`, `domain/`, `application/`.)

**After the 3 steps (centered):**
```
Edit anything · Use AI skills · No lock-in
```
(Single line, muted text, dot separators. This replaces the old "Override any contract..." line. Do NOT stack both — only this trio.)

**CTA:** "Read the getting started guide" (outline button, keep existing behavior)

---

#### Section 4: Features

```
Title:     "Pick what you need."
           (Apply gradient-text to "you need.")
Sub:       "Production-ready backend features — full source code, zero dependency."
```

No badge (remove the "plug & play" badge entirely).

**Layout: Two columns (desktop), single column (mobile)**

**Left column — 6 feature rows (compact list style):**

Each row: emoji icon | feature name | short description | `add [name]` command | arrow → linking to doc page

1. 🔐 Auth — Sign-up, login, sessions & API keys → `/capabilities/auth`
2. 💰 Billing — Payments, subscriptions & invoicing → `/capabilities/billing`
3. 🔍 Search — Full-text search with filters & facets → `/capabilities/search`
4. 🛡️ RBAC — Roles, permissions & access control → `/capabilities/rbac`
5. 🔔 Notifications — In-app, email & push notifications → `/capabilities/notifications`
6. 📝 Blog — Posts, categories, drafts & publishing → `/capabilities/blog`

Below the list: `+ 14 more features →` link (points to `/concepts/capabilities` for now)

**Right column (hidden on mobile) — file tree preview:**

Show the structure of the first/selected feature (auth), similar to step 3 but more detailed:
```
domains/
  └── auth/
       ├── contracts/
       │    ├── auth.port.ts
       │    ├── session.port.ts
       │    └── auth.types.ts
       ├── domain/
       │    ├── auth.service.ts
       │    └── session.entity.ts
       └── application/
            ├── sign-up.use-case.ts
            └── login.use-case.ts
```

With a small label above: "What you get" (muted, uppercase, tracked).
Below: "Every feature follows the same clean structure." (muted, italic)

**CTA:** "How features work" (outline button → `/concepts/capabilities`)

---

#### Section 5: AI-ready

```
Title:     "AI-ready by design."
           (Apply gradient-text to "AI-ready")
Sub:       "Each feature ships with AI skills. Your agent understands your code from day one."
```

**Layout: 3 equal columns** (not bento asymmetric — replace existing bento grid)

Each card: icon + title + description. Clickable links to relevant doc pages.

**Card 1 → links to `/concepts/skills`**
```
Icon:  ✨ (sparkles svg, reuse existing)
Title: "Your AI agent, onboarded"
Desc:  "Each feature ships with skills — instructions your AI agent reads to extend, test, and debug your code."
```

**Card 2 → links to `/concepts/architecture`**
```
Icon:  ⚡ (bolt/zap svg)
Title: "Generate, don't write"
Desc:  "Ask your agent to add a feature — it follows the same patterns automatically."
```

**Card 3 → links to `/concepts/capabilities`**
```
Icon:  📐 (code/brackets svg, reuse existing)
Title: "Interfaces your AI can read"
Desc:  "Typed ports and boundaries. Your agent generates compatible code on the first try."
```

**CTA:** "Explore AI skills" (outline button → `/concepts/skills`, keep existing)

---

#### Section 6: Frameworks

```
Title:     "Works with your stack."
           (Apply gradient-text to "your stack.")
Sub:       "Same code, any TypeScript runtime or framework."
```

**Layout: Centered, no two-column. Remove the ASCII tree entirely.**

**Row 1 — Runtimes (label above):**
Node.js | Bun | Deno
(Keep existing fw-card components with icons)

**Row 2 — Frameworks (label above):**
Next.js | Express | Fastify | Hono | NestJS
(Keep existing fw-card components with icons)

Everything centered. No text paragraph about clean architecture (already communicated elsewhere).

---

#### Section 7: CTA final

```
Title:     "Ready to stop rewriting?"
           (Apply gradient-text to "stop rewriting?")
Sub:       "Copy production-ready features. Ship faster."
CTAs:      [Get Started →] (primary) + [GitHub ★] (outline) — same as hero
GitHub:    "View on GitHub" link with icon (keep existing)
Microcopy: "Free & open source. No account required." (keep with shield icon)
Footer:    "TypeScript · Open Source · AI-ready"
```

Keep the cta-orb glow effect.

---

### Technical Notes

- The file is `apps/docs/src/pages/index.astro` — single file with HTML + scoped `<style>` + `<script>`
- Keep all existing CSS custom properties and visual effects (orbs, glows, grid patterns, animations)
- Keep the IntersectionObserver scroll animation system (`.anim` classes)
- Keep the terminal animation JS exactly as-is
- Keep the copy-to-clipboard JS for the cmd box
- The capabilities JS array that generates 20 cards dynamically should be replaced with static HTML for the 6 featured items
- Remove the Examples section entirely (SaaS/Ecommerce/Content cards)
- Remove the "plug & play" badge component
- CSS class `.cap-section`, `.cap-grid`, `.cap-card` etc. can be replaced/simplified for the new layout
- Bento grid CSS (`.bento-grid`, `.bento-card`) should be replaced with simple 3-column grid
- Architecture section two-column layout (`.arch-grid`, `.arch-tree`) replaced with centered framework cards only
