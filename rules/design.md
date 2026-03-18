---
globs: ["*.tsx", "*.css", "*.html"]
---

- Warm black (#141312) backgrounds, NOT pure black (#000) or near-black (#09090b)
- Instrument Serif for display/headings, Poppins for body text
- Serif + sans-serif pairing is the single highest-impact anti-AI-generated-look change
- Bento grid layouts (3+2 column splits) break the AI-generated symmetric pattern
- Asymmetric > symmetric for editorial feel. Study MOBBIN.ai for layout inspiration.
- Every agent gets its own brand colors (via BRAND.md) but shares the Energy design system
- Use shadcn/ui as base, then elevate with 21st.dev reactive/3D components
- Dark mode default. All components must work in dark mode.
- Animations: subtle, purposeful. Framer Motion for page transitions and micro-interactions.
- Tool status should show as adaptive cards with gradients and icons, not plain text badges
- Generative UI: stream rich cards for tool calls (weather cards, venue cards, search cards)
- Images: use generated/curated assets, never stock photos. Nano Banana for photorealistic.
- Google Stitch for UI prototyping and design iteration via Gemini

## Anti-Patterns (Never Do These)

- No emoji as functional icons (use Lucide icons, emoji only for decorative/personality)
- No pure white text on dark backgrounds — use zinc-100/200 for softer contrast
- No generic "AI purple/pink gradients" — our brand is intentionally warm, editorial, grounded
- No symmetric card grids — use asymmetric bento layouts, varied card sizes
- No loading spinners without context — always show WHAT is loading ("Searching restaurants...")
- No modals for inline actions — use inline cards, toasts, or slide-ups instead
- No placeholder images — if no image, use a gradient or icon, never gray boxes

## Pre-Delivery Checklist (Before Any UI PR)

- [ ] All interactive elements have `cursor-pointer`
- [ ] Focus states visible on keyboard navigation (ring-2 ring-brand-500/50)
- [ ] Touch targets >= 44px on mobile
- [ ] No text smaller than 11px (use text-[11px] minimum)
- [ ] Dark mode verified (no invisible text, no missing borders)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Tool cards have loading → active → done states (never just "done" appearing)

## Hierarchical Design Pattern

- Master design system defined in this file applies everywhere
- Page-specific overrides allowed via CSS custom properties in layout files
- Agent-specific brand colors via BRAND.md → theme-tokens.json → tailwind.config.ts
- Component-level overrides via className props, never inline styles
