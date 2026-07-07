# Session 1: Token Setup Checklist

Complete this before building any sections. Takes ~30 minutes.

---

## 1. Colors: `assets/base.css`

Open `base.css` and fill in the CLIENT TOKENS block at the top of `:root`.

| Token | What it is | Example |
|---|---|---|
| `--bg` | Page background (exposed between cards) | `#6B5D4A` |
| `--card-bg` | Primary card background | `#3A3020` |
| `--card-bg2` | Deeper card / overlays | `#2E2618` |
| `--overlay-dark` | RGB values of card-bg2 for gradient overlays | `26,18,8` |
| `--cream` | Primary text color | `#FFF9EF` |
| `--fg` | Same as --cream | `#FFF9EF` |
| `--earth` | Accent color | `#C4A87A` |
| `--earth-rgb` | RGB values of --earth | `196,168,122` |
| `--earth-light` | Lighter accent tint | `#C8B297` |
| `--earth-pale` | Same as --earth-light | `#C8B297` |
| `--earth-dark` | Dark text color for use ON the accent bg | `#1A1208` |
| `--ph1–ph4` | Image placeholder tones (derive from card-bg) | `#221c10` |

Also update the `body` background gradient at the bottom of the token block.

---

## 2. Fonts: `layout/theme.liquid`

Add `@font-face` declarations in the `<head>` for each font weight used.
Then update `--font` and `--font-display` in `base.css`.

```css
--font-display: 'ClientFontBold', 'Helvetica Neue', Arial, sans-serif;
--font:         'ClientFontRegular', 'Inter', 'Helvetica Neue', Arial, sans-serif;
```

Upload `.woff2` files to `theme/assets/` or load from CDN.

---

## 3. Logo: `assets/logo.svg`

Replace `logo.svg` with client logo. Set fill to `var(--cream)` or `#FFF9EF`.
Height in nav: `14px`. Width: `auto`.

---

## 4. Store config: `AGENTS.md`

Update the store details at the top:
- Store URL
- Dev theme ID
- Live theme ID

---

## 5. Body background: `assets/base.css`

Replace the placeholder `background: var(--bg)` with the client's full gradient if needed:

```css
background:
  radial-gradient(ellipse at 20% 0%, rgba(R,G,B,0.18) 0%, transparent 45%),
  linear-gradient(175deg, #LIGHT 0%, #MID 50%, #DARK 100%);
```

---

## Done. Start building sections.
