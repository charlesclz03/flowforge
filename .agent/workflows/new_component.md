---
description: Create a new UI component following FlowForge's premium, app-like, TWA-ready aesthetic.
---

1.  **Context & Requirement Analysis**
    - **CRITICAL**: Remember this is a **Trust Web Activity (TWA)** Android App.
    - Design MUST be:
        - **Mobile-First**: Touch targets must be at least 44x44px.
        - **Game-Like**: Use animations, rich feedback, and vibrant colors (Neon/Glassmorphism).
        - **App-Like**: No default browser scrollbars, no text selection on UI elements (`select-none`), smooth transitions.
    - Determine the Atomic Design Level: Atom, Molecule, or Organism.

2.  **File Creation**
    - Create the file in the appropriate `components/` subdirectory.
    - Use `export default function ComponentName` syntax.
    - **Imports**: Ensure `import { cn } from "@/lib/utils"` is available for Tailwind class merging.

3.  **Implementation Guidelines**
    - **Styling**: 
        - Use Tailwind CSS.
        - **Premium Feel**: Avoid default blue/underline links. Use custom colors defined in `tailwind.config.ts`.
        - **Responsiveness**: ALWAYS verify `md:` hidden or flex-direction changes. Ensure it looks perfect on an iPhone SE (small screen).
        - **Safe Areas**: Respect `safe-area-inset-bottom` and top for notch devices (use `pb-safe`, `pt-safe` if available, or manual padding).
    
4.  **Interaction & Feedback**
    - Add `:active` states for touch feedback (e.g., `active:scale-95`).
    - Use `framer-motion` for complex entrances or interactions if "game-feel" is required.

5.  **Documentation & Exports**
    - Add a JSDoc comment explaining props.
    - Export the component in the directory's `index.ts` (if applicable).

6.  **Verification**
    - **Self-Correction**: Does this look like a website or a native app? If it looks like a website, REDESIGN it to look like a Native App.
