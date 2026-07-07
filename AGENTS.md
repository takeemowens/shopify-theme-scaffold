# Shopify Theme Scaffold: Session Context

## Store Config
<!-- Update these for every new client project -->
- **Store URL:** `[client].myshopify.com`
- **Dev theme ID:** `XXXXXXXXX`
- **Live theme ID:** `XXXXXXXXX`

---

## AI Prod Team

When making product, design, engineering, data, or marketing decisions, adopt the relevant team member's lens.

| Member | Role | Lens |
|---|---|---|
| **Yao Ming** | CTO | Architecture, cost, scalability, tech debt, security, build vs buy |
| **Rick Flair** | Head of Design | UX, UI, hierarchy, spacing, interaction patterns |
| **2 Pac** | Head of Product | Prioritization, roadmap, effort-to-impact. Cuts scope ruthlessly |
| **Patrick** | Data Scientist | Data quality, schema design, signal vs noise |
| **Sarah** | Growth / Marketing | Positioning, narrative, personal brand |

---

## Working Style

- **Bugs fix immediately**, no phase gating
- **Features wait for their phase**, no scope creep mid-session
- **Finish one thing before starting the next**
- **One question at a time**, don't overwhelm with multiple asks
- **Direct feedback**, call out blind spots, don't sugarcoat

---

## Shopify Theme Rules (Non-Negotiable)

### Push Protocol
- **ALWAYS use `--nodelete`.** Never push without it. Deletes `password.liquid` and breaks the store.
- **Push sections BEFORE templates**, schema must exist before template JSON references block types.
- **3-page smoke test after every push**, check index, collection, AND product page.
- **Single file pushes preferred**, `./push.sh dev section-name`

### Architecture
- **Don't render what you don't need**, use `{% if template.name == 'product' %}` for template-specific elements.
- **One owner per DOM behavior**, if two scripts manage the same class, they fight.
- **No `!important` for layout**, if you need it, the architecture is wrong.

### Spacing
- **Every section card gets `margin-top: var(--gap)`**, body flex gap doesn't propagate through Shopify's `.shopify-section` wrappers.
- **Header exception**, `#shopify-section-header { display: contents; }` so sticky nav works against viewport.
- **`--gap` responsive**, 24px desktop → 14px tablet (900px) → 10px mobile (560px).

---

## Design Tokens

All tokens are in `assets/base.css`. Client tokens are at the top of `:root`, fill these in Session 1 (see `_tokens.md`).

**Structural tokens (never change):**
- `--radius: 1rem`, card border radius
- `--gap: 1.5rem`, section spacing
- `--page-padding: 1.75rem`, body padding
- `--ease-out-expo` · `--ease-smooth`, motion easings
- `--duration-fast` · `--duration-med` · `--duration-slow`
- `--text-xs` through `--text-lg`, type scale
- `--tracking-neg` through `--tracking-wider`, letter spacing

---

## Pre-Push Checklist

Before every push:
- [ ] Read the file before editing (prevents context errors)
- [ ] Use `./push.sh`, never raw `shopify theme push` without `--nodelete`
- [ ] Smoke test: index + collection + product after push
- [ ] Check mobile at 390px for any layout push
- [ ] No hardcoded colors, use token variables only
- [ ] No font sizes not on the token scale

---

## Section Stub

Copy `sections/_stub.liquid` for every new section. It has the schema boilerplate, `{%- style -%}` block, and `margin-top: var(--gap)` pre-wired.

---

## Type Scale Reference

| Token | Size | Use |
|---|---|---|
| `--text-xs` | 10px | Badges, micro labels |
| `--text-sm` | 11px | Categories, counts, nav labels |
| `--text-base` | 13px | Body copy, prices, descriptions |
| `--text-md` | 14px | Product names, meta |
| `--text-lg` | 16px | Body default, inputs |
