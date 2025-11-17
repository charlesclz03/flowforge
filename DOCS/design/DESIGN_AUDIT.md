# FlowForge Design Audit - Matching Screenshots

**Date**: Current Session  
**Purpose**: Ensure app matches design screenshots exactly

## Design Screenshot Reference
- Location: `DOCS/FlowForge Design Assets/` (11 JPG files)
- Design Document: `DOCS/FlowForge Design.md`

## Pages According to Design Document
1. **FIRST PAGE**: How it works
2. **SECOND PAGE**: Choose difficulty and word frequency and your beat  
3. **PAGE THREE**: Start practicing your freestyle and record yourself
   - **SPECIAL NOTE**: "The play button of Page three has to look like the following (keep purple color)"

## Current Implementation Status

### Page 1: Landing Page (`app/page.tsx`)
- ✅ Hero section with stats
- ✅ Timer ring display
- ✅ Session badges
- ✅ How it Works section
- ✅ Pricing section
- ✅ FAQ section

**Potential Issues to Check:**
- [ ] Layout spacing matches screenshots
- [ ] Typography sizes match
- [ ] Card styles match exactly
- [ ] Feature cards layout
- [ ] Button styles

### Page 2: Practice Setup (`app/practice/page.tsx`)
- ✅ Beat selector
- ✅ Frequency selector (4/8/16 bars)
- ✅ Difficulty selector (Easy/Medium/Hard)

**Potential Issues to Check:**
- [ ] Layout matches screenshot exactly
- [ ] Card arrangement
- [ ] Selector button styles
- [ ] Spacing between elements
- [ ] Beat card design matches

### Page 3: Practice Session (`app/practice/page.tsx` - active session)
- ✅ Play button with timer ring
- ✅ Word prompt display
- ✅ Recording indicator
- ✅ Session info pill

**CRITICAL**: Play button must match screenshot exactly (purple color)

**Potential Issues to Check:**
- [ ] Play button size and styling
- [ ] Timer ring appearance
- [ ] Word prompt styling and size
- [ ] Layout arrangement
- [ ] Session info pill design
- [ ] Recording indicator placement

## Component-Specific Checks

### PlayButton Component
- Current: Purple circle with white icon, glow effect
- Must match screenshot exactly
- Size: 200px ring, button is 55% of ring
- Color: Purple (#7D7AFF)

### TimerRing Component  
- Current: Purple progress ring
- Stroke width: 10px
- Background: Gray (#3A3A3C)

### BeatCard Component
- Selected state: Purple border and background tint
- Purple checkmark in top-right
- Icon background: Purple when selected

### WordPrompt Component
- Display: Large gradient text (4rem)
- Animation: Fade-in/scale
- Gradient: Purple-based

### Session Info Pill
- Current: Rounded pill with purple separator dots
- Should match screenshot layout

## Common Design Discrepancies to Fix

1. **Spacing**: Check all padding/margins match screenshots
2. **Typography**: Verify font sizes, weights, letter spacing
3. **Colors**: Ensure exact color matches (#7D7AFF for purple)
4. **Borders**: Check border radius, width, colors
5. **Shadows**: Verify glow effects match
6. **Layout**: Check grid/flex layouts match exactly
7. **Component sizes**: Verify all dimensions match

## Next Steps

1. User to describe specific differences seen
2. Systematically fix each component
3. Verify against screenshots
4. Document final state

