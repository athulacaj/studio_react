# Mizhiv Design System Rules

## Brand Overview

Mizhiv is a **premium photo proofing platform** for weddings and events.

Primary users:

* Photographers
* Wedding studios
* Event management companies
* End clients (bride/groom/family)

Brand personality:

* Premium
* Emotional
* Friendly

Core feeling:

> Luxury wedding memories delivered through modern technology.

Avoid generic SaaS feel.
UI must feel:

* elegant
* cinematic
* emotional
* polished
* premium

---

# Design Principles

## 1. Dark-first design

Use dark mode as the primary experience.

Background should feel like:

* night sky
* camera lens depth
* cinematic gallery

Avoid flat black.

Preferred backgrounds:

* deep navy gradients
* subtle purple glow
* soft vignette effects

Example:

```css
background: linear-gradient(180deg, #030912 0%, #050E1A 100%);
```

---

## 2. Use glassmorphism lightly

Cards should have:

* soft transparency
* blurred background
* subtle border
* premium glow

Do NOT overuse blur.

Card style:

```css
background: rgba(29, 44, 70, 0.72);
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.08);
```

---

# Color Palette

## Primary Background

```yaml
bg_primary: "#030912"
bg_secondary: "#050E1A"
surface: "#0F1A2E"
surface_hover: "#162340"
```

## Brand Colors

```yaml
brand_primary: "#9D4EDD"
brand_secondary: "#A855F7"
brand_light: "#C084FC"
brand_glow: "rgba(157, 78, 221, 0.35)"
```

## Accent Colors

```yaml
success: "#22C55E"
warning: "#F59E0B"
error: "#EF4444"
info: "#38BDF8"
```

## Text

```yaml
text_primary: "#F8FAFC"
text_secondary: "#94A3B8"
text_muted: "#64748B"
```

---

# Typography

## Font Family

Preferred:

* Sora
* Plus Jakarta Sans
* Inter

Use:

```css
font-family: "Sora", sans-serif;
```

---

## Heading Scale

### H1

Used for hero titles.

```yaml
size: 48-64px desktop
weight: 700
line-height: 1.1
```

### H2

Section titles.

```yaml
size: 28-36px
weight: 600
```

### H3

Cards.

```yaml
size: 20-24px
weight: 600
```

### Body

```yaml
size: 16px
weight: 400
```

---

# Spacing System

Use 8px grid.

```yaml
xs: 8
sm: 16
md: 24
lg: 32
xl: 48
2xl: 64
```

Never crowd UI.

Generous whitespace is mandatory.

---

# Border Radius

Premium rounded corners.

```yaml
button: 16px
input: 14px
card: 24px
modal: 28px
pill: 999px
```

Avoid sharp corners.

---

# Shadows

Use soft glow, not hard shadows.

Primary glow:

```css
box-shadow: 0 0 40px rgba(157,78,221,0.18);
```

Card shadow:

```css
box-shadow:
0 8px 32px rgba(0,0,0,0.35);
```

---

# Buttons

## Primary Button

Gradient purple.

```css
background: linear-gradient(90deg, #7C3AED 0%, #A855F7 100%);
color: white;
border-radius: 16px;
```

Hover:

* increase glow
* slight lift

Animation:

```css
transform: translateY(-2px);
```

---

## Secondary Button

Transparent glass style.

```css
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.08);
```

---

# Icons

Style:

* outline or duotone
* slightly rounded
* modern
* premium
* purple highlights

Use:

* lens
* shutter
* eye
* gallery
* cloud upload

Avoid generic flat icons.

Icon size:

```yaml
small: 20
medium: 24
large: 32
hero: 48-64
```

---

# Logo Rules

Logo combines:

* camera shutter
* eye
* lens

Meaning:

* mizhi = eye
* proofing = focus
* photography = lens

Wordmark:

```text
mizhiv
```

Malayalam version:

```text
മിഴിവ്
```

Logo style:

* modern
* geometric
* elegant
* minimal

---

# Card Design

Cards must feel premium.

Structure:

* large rounded corners
* glass background
* subtle border
* hover glow

Example sections:

* project cards
* gallery cards
* analytics cards

Project card contains:

* cover image
* project title
* storage provider
* status
* folder count
* date

---

# Images & Photography

This is the most important visual element.

Images should feel:

* cinematic
* emotional
* luxurious

Prefer:

* weddings
* events
* portraits
* warm lighting
* bokeh
* golden hour

Avoid:

* stock-feeling photos
* overly bright generic images

---

# Animation Rules

Animation should be subtle.

Use:

* fade in
* slide up
* glow pulse
* hover scale 1.02

Duration:

```yaml
fast: 150ms
normal: 250ms
slow: 400ms
```

Avoid flashy animations.

---

# Dashboard Layout Rules

Mobile-first.

Page structure:

1. Navbar
2. Hero section
3. Quick actions
4. Projects
5. Stats
6. Bottom navigation

Use:

* sticky nav
* floating CTA
* glowing action buttons

---

# Navigation

Top nav:

* hamburger/menu
* logo
* notifications
* profile avatar

Bottom nav:

* Dashboard
* Projects
* Add
* Galleries
* Settings

Active nav:

* purple glow
* brighter icon

---

# AI Instructions

Whenever generating UI for Mizhiv:

Always ensure:

* dark premium theme
* purple glowing accents
* elegant spacing
* cinematic imagery
* emotional wedding-first design
* rounded glass cards
* premium typography

Never generate:

* bright white dashboard
* flat bootstrap style
* generic admin panel
* sharp corners
* cheap gradients

Mizhiv should feel like:

> Apple meets Adobe meets luxury wedding photography
