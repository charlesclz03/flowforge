# UI Trends 2026 Fit Matrix for FreeStyla

**Date**: 2026-05-21
**Scope**: Research note for the 2026 pro-grade refresh and Practice/Header layout fix pass.
**Workflow**: `.agent/workflows/layout_audit.md`

## Sources

- Figma, "12 defining Web development trends for 2026": https://www.figma.com/resource-library/web-development-trends/
- Figma, "The TL;DR on MCP": https://www.figma.com/blog/the-tldr-on-mcp/
- OpenAI, "OpenAI Codex and Figma launch seamless code-to-design experience": https://openai.com/index/figma-partnership/
- Midrocket, "UI Design Trends for 2026": https://midrocket.com/en/guides/ui-design-trends-2026/
- Lucky Graphics, "UI Design Trends 2026": https://lucky.graphics/learn/ui-design-trends-2026/
- Weabers, "2026 Web Design Trends for AI & SaaS Startups": https://www.weabers.com/blog/web-design-trends-ai-saas-2026

## Research Summary

The 2026 signal is not "more decoration." The strongest fit for FreeStyla is a tighter product-system layer: component-driven layouts, design-token discipline, dark-mode depth, accessibility/focus clarity, functional motion, and AI-assisted design handoff through Figma/MCP-style context.

For FreeStyla, the app should feel like a premium music practice tool: dark studio surface, sharp controls, reliable small-iPhone density, clear touch targets, and live performance feedback. The current route order and control anchors should remain intact.

## Fit Matrix

| Direction                                          | Fit                  | FreeStyla Application                                                                                                                                  |
| -------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component-driven layouts and handoff               | Adopt                | Keep shared primitives as source of truth: `Button`, `Surface`, `Card`, `IconFrame`, `StatusBadge`, `Modal`, `SegmentedControl`, `AppHeader`.          |
| Mature dark-mode elevation                         | Adopt                | Use layered surfaces, inset highlights, and restrained glow to make the app feel pro-grade without bright gradient clutter.                            |
| Functional motion                                  | Adopt                | Keep motion tied to practice state, tap feedback, countdown, timer progress, and recording state. Avoid decorative-only motion.                        |
| Accessibility as an early design input             | Adopt                | Keep 44px+ touch targets, visible focus, contrast-safe primary actions, and small-iPhone overlap checks in regression coverage.                        |
| AI/Figma/MCP design context                        | Adapt carefully      | Useful for future design-system snapshots and visual diffs, but current code remains the local source of truth until a production Figma source exists. |
| Refined tactile glass                              | Adapt carefully      | Use as a subtle material on control panels and modals, not as a dominant translucent theme.                                                            |
| Agentic AI UX                                      | Reject for this pass | FreeStyla is a practice tool, not an AI prompt UI. Do not add prompt boxes or agent chrome to the product surface.                                     |
| Heavy 3D, immersive scroll effects, bento rewrites | Reject               | These would violate the locked route flow, anchors, mobile-first constraints, and focused studio-tool direction.                                       |

## Surfaces Most Relevant

- `/practice`: highest risk and highest payoff. Needs exact circular geometry, small-iPhone density fixes, cypher player theming, timer ring weight, and regression assertions.
- `AppHeader`: shared shell across public, setup, practice, tracks, recordings, review, settings, and admin surfaces. Needs more iPhone breathing room while keeping the three-column control grid.
- `/difficultyselection`: already structured as a setup console; shared primitive polish improves it without re-layout.
- Tracks, recordings, review, settings/install/legal/admin: best handled through shared primitive polish and token refinements rather than bespoke redesigns.

## Implementation Guidance

- Preserve DOM order, route flow, and anchors.
- Fix Practice/Header defects before global styling.
- Make visual polish through tokens and shared primitives first.
- Prefer measurable improvements: square orb sizing, concentric rings, 4-player cypher visibility, player-color propagation, thicker timer progress, touch-safe header controls, and no small-iPhone overlap.

## OpenDesign / Codex Applicability

OpenDesign-style workflows are useful after this defect pass as a comparison and specification layer:

1. Generate a design-system snapshot from current UI primitives and tokens.
2. Create a Figma/OpenDesign visual spec for `/practice` states.
3. Compare generated design directions against the live app using screenshots and bounding-box tests.
4. Map Figma components back to code primitives only after FreeStyla has a reliable design source.

The near-term recommendation is to use OpenDesign for audit/spec/prototype loops, not as an automatic code replacement path.
