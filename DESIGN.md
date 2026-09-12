# Design Brief

## Direction

AI Studio Admin Analytics — a professional, high-density analytics dashboard layered onto the existing AI Studio SaaS, giving admins a clear operational view of users, AI usage, subscriptions, revenue, and profit.

## Tone

Refined technical minimalism with analytical clarity: calm cool surfaces, the existing violet-to-cyan intelligence accent, and restrained data-visualization color used only where it aids reading.

## Differentiation

A dual-hue "intelligence" signature (violet primary + cyan accent) preserved from the product, applied to admin navigation and stat-card icon chips, while a disciplined 8-series chart palette keeps multi-metric analytics legible in both themes.

## Color Palette

| Token      | OKLCH (light)  | OKLCH (dark)   | Role                          |
| ---------- | -------------- | -------------- | ----------------------------- |
| background | 0.985 0.004 250| 0.14 0.02 255  | app canvas                    |
| foreground | 0.16 0.02 255  | 0.95 0.01 255  | primary text                  |
| card       | 1 0 0          | 0.175 0.02 255 | stat cards, panels, tables    |
| primary    | 0.5 0.19 265   | 0.72 0.16 265  | violet CTAs, active nav pill  |
| accent     | 0.62 0.14 205  | 0.78 0.13 205  | cyan highlights, links        |
| muted      | 0.955 0.008 250| 0.21 0.02 255  | secondary surfaces            |
| border     | 0.9 0.012 255  | 0.27 0.02 255  | hairlines, dividers           |
| success    | 0.58 0.17 150  | 0.65 0.17 150  | positive deltas, active       |
| destructive| 0.55 0.22 25   | 0.62 0.2 25    | negative deltas, cancelled    |
| chart-1..8 | violet→cyan→green→amber→red→rose→magenta→orange | | multi-series analytics |

## Typography

- Display: Space Grotesk — dashboard titles, stat values, section headings
- Body: DM Sans — labels, table cells, buttons, filters
- Mono: Geist Mono — IDs, timestamps, precise numeric readouts
- Scale: page title `text-2xl md:text-3xl font-bold tracking-tight`, stat value `text-2xl md:text-3xl font-bold`, section label `text-xs font-semibold tracking-widest uppercase`, table body `text-sm`

## Elevation & Depth

Flat cool surfaces layered with hairline borders and two-tier shadows (subtle for resting stat cards, elevated for hover/active panels); charts sit on transparent panels with a subtle `bg-grid` texture for axis reference.

## Structural Zones

| Zone       | Background   | Border   | Notes                              |
| ---------- | ------------ | -------- | ---------------------------------- |
| Admin Sidebar | bg-sidebar | border-r | nav pill active state, admin-only  |
| Header     | bg-card      | border-b | sticky, page title + date filter   |
| Stat Grid  | bg-background| —        | 8 stat cards, responsive 1/2/4 col |
| Content    | bg-background| —        | charts + tables, alternating muted |
| Footer     | bg-muted/40  | border-t | utility links, theme toggle        |

## Spacing & Rhythm

Dense 16px card padding with 20px section gaps for information density; 8px micro-spacing between stat labels, values, and deltas; tables use tight `text-sm` rows with `data-row` hover rhythm.

## Component Patterns

- Stat cards: rounded-xl bg-card border shadow-subtle, icon chip (rounded-lg bg-primary/10) + delta pill (success/destructive/neutral)
- Cards: rounded-xl (radius 0.75rem), bg-card, shadow-subtle resting / shadow-elevated hover
- Badges: rounded-full pills, muted surface with success/destructive/accent text for status
- Nav pill: rounded-lg, active = bg-primary text-primary-foreground, idle = muted with accent hover
- Tables: `data-row` hairlines, hover bg-muted/40, mono for IDs/timestamps

## Motion

- Entrance: fade-in-up 0.4s on stat cards and chart panels, staggered
- Hover: 0.3s transition-smooth lift + border tint on cards
- Decorative: pulse-soft on live/active indicators only; charts use native recharts transitions

## Constraints

- AA+ contrast in light and dark; tune lightness, never rely on opacity
- Semantic tokens only in components — no raw hex or arbitrary color classes
- No fake statistics — 'Not connected' for unconnected payment/ad providers, real data only
- Currency always in Indian Rupees (₹)
- 3–5 core colors + 8 chart series, 2 font families + 1 mono, one dominant interaction pattern
- Light/Dark/System themes persist and apply app-wide via ThemeProvider

## Signature Detail

The violet-to-cyan "intelligence" gradient reserved for the logo mark, primary CTAs, and the active admin nav pill — a quiet signal of capability that keeps the dense analytics canvas calm and readable in both themes.
