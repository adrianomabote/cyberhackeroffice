# Design Guidelines: Aviator Analysis System - CYBER HACKER

## Design Approach
**Utility-Focused Dashboard** with a cyberpunk/hacker aesthetic. This is a real-time data monitoring interface requiring clear visual hierarchy and instant readability.

## Theme & Aesthetic
**Cyber Hacker Theme**: Dark, tech-focused interface with neon accents reminiscent of hacking terminals and cyberpunk interfaces. Think Matrix-style command centers with glowing elements and sharp contrasts.

## Core Design Elements

### A. Typography
- **Header Font**: Use "Orbitron" or "Rajdhani" (Google Fonts) for the "CYBER HACKER" title - bold, tech-focused typeface
  - Size: 2.5rem (40px) desktop, 1.75rem (28px) mobile
  - Weight: 700 (Bold)
  - Letter-spacing: 0.1em for tech aesthetic
  - Text transform: uppercase
  
- **Multiplier Labels** ("DEPOIS DE:", "TIRAR NO:"):
  - Font: "Roboto Mono" or "Source Code Pro" for data/numbers
  - Label size: 0.875rem (14px)
  - Value size: 2rem (32px) for multiplier numbers
  - Weight: 600 for labels, 700 for values

- **General UI Text**: "Inter" or "Roboto" for any supporting interface text
  - Size: 0.875rem to 1rem

### B. Color Palette (User-Specified)
- **Background**: Pure black (#000000) or very dark gray (#0a0a0a)
- **Primary Accent (Header)**: Bright red (#ff0000 or #e63946) with border
- **Secondary Accent (Multipliers)**: Purple #9d4edd with thin borders
- **Text**: White (#ffffff) for high contrast
- **Borders**: Neon glow effect using box-shadow with accent colors
- **Subtle Elements**: Dark gray (#1a1a1a) for container backgrounds

### C. Layout System
**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Container padding: p-6 (24px) on mobile, p-8 (32px) on desktop
- Section gaps: gap-6 between major elements
- Component spacing: m-4 between related items

**Grid Structure**:
- Single column on mobile (max-width: 100%)
- Desktop: max-width container (max-w-6xl centered)
- Multiplier displays: Side-by-side on desktop (grid-cols-2), stacked on mobile

### D. Component Specifications

**1. Header Section**
- Full-width black background with subtle gradient or scanline effect
- "CYBER HACKER" centered with:
  - Red text color
  - 2-3px solid red border around text (text-stroke or outlined effect)
  - Optional: Subtle red glow shadow (box-shadow: 0 0 20px rgba(230, 57, 70, 0.5))
- Height: 80-100px on desktop, 60-70px on mobile
- Sticky positioning (optional) for persistent visibility

**2. Multiplier Display Cards**
- Two cards showing "DEPOIS DE:" and "TIRAR NO:"
- Card styling:
  - Background: Semi-transparent dark (#1a1a1a with 80% opacity)
  - Border: 2px solid #9d4edd (purple)
  - Border-radius: 8px (rounded-lg)
  - Box-shadow: 0 0 15px rgba(157, 78, 221, 0.3) for neon glow
  - Padding: p-6
  
- Internal structure:
  - Label at top in smaller mono font
  - Large multiplier value centered below
  - Optional: Blinking or pulsing animation on update (subtle, 1s duration)

**3. Iframe Container**
- Full-width or near full-width (max-w-6xl)
- Aspect ratio: 16:9 or as needed for game display
- Border: 1px solid rgba(157, 78, 221, 0.3)
- Margin: mt-8 to separate from multiplier cards
- Responsive height: 400px mobile, 600px desktop

**4. Background Effects**
- Scanline overlay (CSS): Repeating linear gradient for retro terminal effect
- Optional matrix-style falling characters background (very subtle, low opacity)
- Radial gradient from center: Black to very dark purple for depth

### E. Animations & Interactions
**Real-time Updates** (Every 1 second):
- Value change: Smooth number transition or flip effect
- Flash effect: Brief purple glow pulse when value updates (duration: 300ms)
- Loading state: Subtle pulsing border while fetching

**Hover States**: Minimal - cards slightly brighten (5% opacity increase)

**No excessive animations**: Keep interface focused on data visibility

## Layout Structure

**Desktop Layout** (≥1024px):
```
[CYBER HACKER Header - Full Width Red]

[Multiplier Card 1]  [Multiplier Card 2]
[DEPOIS DE: X.XXx]   [TIRAR NO: X.XXx]

[Iframe - Aviator Game Embed - Full Width]
```

**Mobile Layout** (<1024px):
```
[CYBER HACKER Header]

[Multiplier Card 1]
[DEPOIS DE: X.XXx]

[Multiplier Card 2]
[TIRAR NO: X.XXx]

[Iframe - Game]
```

## Accessibility
- High contrast maintained (white text on black background)
- Multiplier values large and easily readable
- Clear visual separation between sections
- Focus states with purple outline for keyboard navigation

## Icons
**Font Awesome** (CDN) for any utility icons:
- Data/signal icons near real-time indicators
- Refresh or sync icons if showing connection status
- Arrow icons for trending indicators (optional enhancement)

## Visual Enhancements
- Terminal-style cursor blink in header (optional)
- Gradient overlays on cards from top (dark) to bottom (slightly lighter)
- Subtle noise texture overlay on black background for depth
- Neon underglow effect beneath multiplier cards

This design creates an immersive cyber/hacker aesthetic while maintaining crystal-clear data visibility for real-time game analysis.