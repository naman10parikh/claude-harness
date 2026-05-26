---
globs: ["*.ts", "*.tsx", "*.js", "*.jsx"]
---

- Functional components only (React), no class components
- React Server Components where possible (Next.js App Router)
- State: Zustand for global, useState for local
- TailwindCSS utilities for styling, no inline styles
- Dark mode: use `dark:` prefix variants
- All interactive elements need `cursor-pointer`
- Focus states visible on keyboard navigation
- Touch targets >= 44px on mobile
- No loading spinners without context — show WHAT is loading
- Animations: subtle, purposeful. Respect `prefers-reduced-motion`.
