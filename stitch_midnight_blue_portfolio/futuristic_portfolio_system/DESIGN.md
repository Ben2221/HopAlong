---
name: Futuristic Portfolio System
colors:
  surface: '#0d1515'
  surface-dim: '#0d1515'
  surface-bright: '#333b3b'
  surface-container-lowest: '#080f10'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#232b2c'
  surface-container-highest: '#2e3637'
  on-surface: '#dce4e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dce4e4'
  inverse-on-surface: '#2a3232'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#ebb2ff'
  on-secondary: '#520072'
  secondary-container: '#b600f8'
  on-secondary-container: '#fff6fc'
  tertiary: '#f7f8f8'
  on-tertiary: '#2f3131'
  tertiary-container: '#dbdbdb'
  on-tertiary-container: '#5e6060'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#f8d8ff'
  secondary-fixed-dim: '#ebb2ff'
  on-secondary-fixed: '#320047'
  on-secondary-fixed-variant: '#74009f'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#0d1515'
  on-background: '#dce4e4'
  surface-variant: '#2e3637'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 4rem
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Space Grotesk
    fontSize: 2.5rem
    fontWeight: '600'
    lineHeight: '1.2'
  h2:
    fontFamily: Space Grotesk
    fontSize: 1.75rem
    fontWeight: '500'
    lineHeight: '1.3'
  body-main:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.6'
  data-label:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: '1.5'
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.4'
spacing:
  unit: 4px
  gutter: 24px
  margin: 32px
  grid_opacity: '0.05'
  container_max_width: 1440px
---

## Brand & Style
The design system is engineered to evoke the feeling of a high-end digital tactical interface—a Heads-Up Display (HUD) for the modern developer and creator. It prioritizes information density and technical precision over organic softness. 

The aesthetic is a fusion of **Glassmorphism** and **Brutalism**, utilizing semi-transparent surfaces to create depth while maintaining rigid, sharp geometric structures. The core objective is to position the user as an architect of the future, utilizing "scanning" visual metaphors, micro-data points, and light-emissive borders to create an atmosphere of constant technological activity.

## Colors
The palette is rooted in the depth of space, using **Deep Midnight Navy** as the primary canvas to provide more chromatic richness than pure black. **Charcoal** is used for secondary surfaces to define structure.

The accent strategy utilizes high-frequency light sources:
- **Electric Cyan** is the functional primary, used for active states, data markers, and "safe" interactions.
- **Neon Purple** serves as the energy accent, reserved for highlights, "processing" states, and visual flair.
- **Crisp White** ensures maximum legibility for body text and critical UI labels.
- **Emissive Glows**: Accents are often accompanied by 5-10px outer glows (drop shadows with 0 spread) to simulate light emission from a screen.

## Typography
The typographic hierarchy is split into three distinct functional roles:
1.  **Space Grotesk (Headlines):** Used for impactful titles. Its geometric, slightly technical character reinforces the futuristic aesthetic.
2.  **Inter (Body):** Selected for its exceptional readability at small sizes, ensuring that project descriptions and long-form content remain legible against the dark background.
3.  **JetBrains Mono (Metadata/Accents):** This font carries the "tech" weight. It is used for all UI labels, technical specifications, button text, and small data markers to simulate a terminal or IDE environment.

## Layout & Spacing
The layout follows a **Fixed 12-Column Grid** with visible infrastructure. To reinforce the "high-tech" feel, the grid lines themselves should be subtly rendered in the background using the primary color at 5% opacity.

Elements are aligned with mathematical precision. Components should utilize a 4px base unit for internal spacing. Layouts should often feature "technical overflow," where data markers or coordinate numbers (e.g., [00, 01, 02]) sit just outside the main content containers to mimic a diagnostic display.

## Elevation & Depth
In this design system, depth is achieved through **optical transparency** rather than traditional shadows.

-  **Level 0 (Floor):** Deep Midnight Navy with a subtle 32px x 32px repeating dot or line grid.
-  **Level 1 (Panels):** Semi-transparent surfaces (#121212 at 70% opacity) with a `backdrop-filter: blur(12px)`.
-  **Level 2 (Active/Floating):** Sharply defined borders (1px) in Electric Cyan or Neon Purple. These borders use CSS `box-shadow` to create an "inner-glow" and "outer-glow" effect (e.g., `0 0 8px rgba(0, 242, 255, 0.4)`).
-  **Scanning Lines:** A horizontal gradient line with 2% opacity should slowly oscillate vertically across the primary viewports to simulate a screen refresh or system scan.

## Shapes
The shape language is strictly **Geometric and Sharp**. There are no rounded corners in this design system. All containers, buttons, and input fields must have 0px border-radius.

To add visual interest to these "harsh" boxes, use **clipped corners** (45-degree chamfers) on prominent buttons and card headers. This "stealth-tech" silhouette is a hallmark of the system. Visual dividers should use thin 1px lines with "diamond" or "plus" markers at intersections to denote data points.

## Components
- **Buttons:** Sharp-cornered, 1px Cyan border, JetBrains Mono text. On hover, the background fills with a Cyan-to-Transparent gradient and the text shifts to black.
- **Glass Cards:** Backdrop-blur panels with a single "Active Corner" highlight (a 10px L-shaped border accent in the top-left).
- **Inputs:** Underlined-only or fully boxed with a technical "Focus" state that displays the current character count or field ID in a small monospaced label at the top-right.
- **Data Points:** Small `+` symbols placed at the intersections of grid lines or corners of components.
- **Scanning HUD:** A decorative element consisting of rotating circular rings or coordinate axes that appear in the background of large display sections.
- **Chips/Status:** Small rectangular boxes with high-contrast text and a "pulse" animation on the leading icon to indicate "System Live" status.