# Skill: Click-to-Open Wedding Intro

## Purpose

Create an elegant, cinematic **click-to-open wedding invitation intro** that appears before the main wedding website experience.

The intro should feel like opening a physical wedding invitation rather than a generic website loading screen.

Preferred flow:

**Closed invitation / curtains → user clicks Open Invitation → opening animation → main wedding experience is revealed**

This is especially suitable for wedding websites with a cinematic/parallax hero where the bride and groom walk toward the screen.

---

## Core Design Direction

Use an elegant wedding aesthetic matching the existing website.

Recommended visual language:

- Deep forest green / dark green
- Warm gold accents
- Cream/off-white typography
- Refined serif/display typography
- Minimal decoration
- Soft glow and subtle vignette
- Cinematic transitions
- Premium romantic feeling

Avoid making it look like a generic SaaS modal or browser dialog.

---

## Critical Architecture Rule

### `websiteData` is the single source of truth

**Never hardcode wedding-specific content directly into the opening HTML.**

All editable content must come from the existing `websiteData` JSON.

Recommended structure:

```js
let websiteData = {
  opening: {
    content: {
      eyebrow: "A journey together",
      monogram: "J & A",
      title: "Our Story<br>Begins",
      description: "Every step brought us closer to this moment.",
      buttonText: "Open Invitation",
      hint: "Click to begin"
    }
  }
};
```

The same component should work for another couple simply by changing the JSON.

Do not write wedding-specific values directly into static HTML such as:

```html
<h1>Our Story Begins</h1>
```

Instead render them from:

```js
c.title
```

---

## Recommended Data Model

```js
"opening": {
  "content": {
    "eyebrow": "",
    "monogram": "",
    "title": "",
    "description": "",
    "buttonText": "",
    "hint": ""
  }
}
```

Optional future fields may include:

```js
"opening": {
  "content": {
    "eyebrow": "",
    "monogram": "",
    "title": "",
    "description": "",
    "buttonText": "",
    "hint": "",
    "backgroundImage": "",
    "logoImage": "",
    "openingStyle": "curtain"
  }
}
```

Only use optional fields when they are actually implemented.

---

## Renderer

Create a dedicated renderer following the website's existing data-driven architecture:

```js
function renderOpening() {
  const opening = websiteData.opening;

  if (!opening || !opening.content) {
    return;
  }

  const c = opening.content;

  // Build the opening UI from c.*
}
```

Use:

```js
c.eyebrow
c.monogram
c.title
c.description
c.buttonText
c.hint
```

For optional values, render conditionally:

```js
${c.title ? `<h1>${c.title}</h1>` : ''}
```

---

## Preferred Visual: Curtains

For a cinematic wedding/parallax site, the preferred opening is a pair of full-height curtains.

Suggested structure:

```html
<div class="opening-screen" id="openingScreen">
  <div class="opening-curtain left"></div>
  <div class="opening-curtain right"></div>
  <div class="opening-vignette"></div>

  <div class="opening-center">
    <!-- data-driven content -->
  </div>
</div>
```

Initially both curtains cover the viewport.

When opened:

```css
.opening-screen.opening .opening-curtain.left {
  transform: translateX(-105%);
}

.opening-screen.opening .opening-curtain.right {
  transform: translateX(105%);
}
```

The animation should reveal the existing wedding website underneath.

---

## Intro Content Hierarchy

Recommended order:

1. Eyebrow
2. Circular monogram
3. Large romantic title
4. Short description
5. Gold outlined **Open Invitation** button
6. Small interaction hint

Concept:

```text
        A JOURNEY TOGETHER

             J & A

        Our Story
          Begins

   Every step brought us closer
       to this moment.

      ✦ OPEN INVITATION ✦

          CLICK TO BEGIN
```

All actual text comes from `websiteData`.

---

## Opening Interaction

On button click:

1. Prevent duplicate activation.
2. Add an `opening` class.
3. Move the left curtain outward.
4. Move the right curtain outward.
5. Fade/scale the center content.
6. Reveal the main website.
7. Remove or hide the opening overlay.
8. Start the main cinematic/parallax experience if required.

Example:

```js
function openWeddingInvitation() {
  const screen = document.getElementById("openingScreen");

  if (!screen || screen.classList.contains("opening")) {
    return;
  }

  screen.classList.add("opening");

  setTimeout(() => {
    screen.classList.add("is-open");
    document.body.style.overflow = "";
  }, 950);

  setTimeout(() => {
    screen.remove();
  }, 1900);
}
```

---

## Parallax Integration

If the website already contains a bride-and-groom walking/parallax hero, **do not replace it**.

The intro is only the first layer:

```text
Page loads
    ↓
Click-to-open intro
    ↓
Open Invitation
    ↓
Curtains part
    ↓
Existing hero is revealed
    ↓
Bride + groom walking/parallax begins
```

If the hero uses automatic scrolling, it should normally start **after the invitation opens**, not while the curtains are closed.

---

## Scroll Lock

While the opening screen is visible:

```js
document.body.style.overflow = "hidden";
```

After opening:

```js
document.body.style.overflow = "";
```

This prevents the underlying parallax experience from moving before the guest opens the invitation.

---

## Accessibility

Use an accessible button:

```html
<button type="button" aria-label="Open wedding invitation">
  ...
</button>
```

Support:

- Enter
- Space

Example:

```js
document.addEventListener("keydown", function(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openWeddingInvitation();
  }
});
```

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

The invitation must remain usable even when animation is reduced.

---

## Responsive Design

The intro must work on:

- Desktop
- Tablet
- Mobile portrait
- Mobile landscape

Use responsive typography such as:

```css
font-size: clamp(44px, 8vw, 86px);
```

The curtains must completely cover the viewport before opening.

Avoid fixed dimensions that create mobile overflow.

---

## Recommended Visual Details

### Vignette

```css
background:
  radial-gradient(
    ellipse at center,
    transparent 20%,
    rgba(0,0,0,.28) 100%
  );
```

### Gold border

```css
border: 1px solid rgba(200,168,107,.75);
```

### Monogram

```css
border-radius: 50%;
```

Optional subtle glow:

```css
box-shadow:
  0 0 0 8px rgba(200,168,107,.035),
  0 0 45px rgba(200,168,107,.10);
```

Keep decoration subtle.

---

## Alternative Opening Metaphors

The same data-driven architecture can support other opening styles.

### 1. Curtains

Best for cinematic/luxury wedding websites.

```text
Closed curtains
      ↓
Open sideways
```

### 2. Double Doors

Two doors meet in the center and open outward.

Suitable for:

- Wooden doors
- Church doors
- Garden doors

### 3. Envelope

```text
Closed envelope
      ↓
Click
      ↓
Envelope flap opens
      ↓
Invitation card rises
      ↓
Website appears
```

### 4. Invitation Card

```text
Centered invitation card
      ↓
Click
      ↓
Card expands/fades
      ↓
Website revealed
```

### 5. Floral Frame

Flowers/vines frame the viewport and open outward.

### 6. Garden Gate

Ideal for forest/garden wedding themes:

```text
Closed garden gate
      ↓
Gate opens
      ↓
Parallax wedding scene appears
```

The `websiteData.opening.content` model should remain the content source regardless of the visual style.

---

## Do Not Do

Do not:

- Hardcode bride/groom names into static HTML
- Hardcode wedding descriptions
- Hardcode CTA text
- Hardcode the monogram
- Start automatic scrolling while the intro is closed
- Permanently block the underlying page
- Replace the existing parallax hero unnecessarily
- Use a generic alert/modal
- Make the opening difficult to activate
- Add excessive animation that distracts from the wedding experience
- Break existing sections or components

---

## Recommended Component Structure

```text
websiteData
   │
   └── opening
         │
         └── content
               ├── eyebrow
               ├── monogram
               ├── title
               ├── description
               ├── buttonText
               └── hint

renderOpening()
   │
   └── opening-screen
         ├── curtain.left
         ├── curtain.right
         ├── vignette
         └── opening-center
               ├── eyebrow
               ├── monogram
               ├── title
               ├── description
               ├── button
               └── hint

button click
   │
   └── openWeddingInvitation()
         │
         ├── opening class
         ├── curtain animation
         ├── content fade
         ├── reveal website
         └── start hero/parallax
```

---

## Integration With Existing Master Renderer

If the website has:

```js
function renderDataAll(data) {
  if (data) {
    websiteData = data;
  }

  renderHero();
  renderNames();
  renderTimeline();
  renderVenue();
  renderGallery();
  renderCountdown();
  renderRsvp();
  renderFooter();

  initializeComponents();
}
```

Add:

```js
renderOpening();
```

to the rendering flow:

```js
function renderDataAll(data) {
  if (data) {
    websiteData = data;
  }

  renderOpening();

  renderHero();
  renderNames();
  renderTimeline();
  renderVenue();
  renderGallery();
  renderCountdown();
  renderRsvp();
  renderFooter();

  initializeComponents();
}
```

If the opening needs to appear before the main page is initialized, render it as soon as `websiteData` is available.

---

## Data Attributes

For consistency with other dynamic sections, use:

```html
data-json-path="opening"
```

and:

```html
data-json-path="opening.content.eyebrow"
data-json-path="opening.content.monogram"
data-json-path="opening.content.title"
data-json-path="opening.content.description"
data-json-path="opening.content.buttonText"
data-json-path="opening.content.hint"
```

---

## Quality Checklist

Before completing the component:

- [ ] All wedding-specific content comes from `websiteData`
- [ ] No wedding names/text are hardcoded into static HTML
- [ ] Opening overlay covers the full viewport
- [ ] Underlying page cannot scroll before opening
- [ ] CTA clearly communicates the action
- [ ] Curtains/doors/envelope animate smoothly
- [ ] Main wedding experience is revealed after opening
- [ ] Existing parallax hero remains intact
- [ ] Existing auto-scroll starts at the correct time
- [ ] Works on mobile
- [ ] Supports keyboard interaction
- [ ] Supports reduced motion
- [ ] No layout overflow
- [ ] Overlay is removed after the animation
- [ ] Missing `websiteData.opening` is handled gracefully
- [ ] Visual style matches the wedding website

---

## Preferred Final Experience

The guest should feel like they are physically **opening the wedding invitation**.

For a parallax walking wedding website, the strongest default is:

**Elegant dark-green curtains + gold monogram + romantic invitation copy → click → curtains slowly part → bride and groom walking/parallax scene is revealed.**

The opening is a short cinematic prologue to the wedding website, not a separate page.
