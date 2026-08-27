---
name: parallax-effect-website-generation
description: Generate generic cinematic, scroll-driven parallax websites from layered visual assets. Supports people, couples, cars, motorcycles, bicycles, boats, trains, animals, products, characters, and other moving subjects.
---

# Parallax Effect Website Generation

## Purpose

Create immersive websites where scrolling acts like a virtual camera moving through a layered scene.

The core model is:

    USER SCROLL
        ↓
    FAR BACKGROUND   → slowest
    MID BACKGROUND   → slow
    GROUND/ENVIRONMENT → medium
    MAIN SUBJECT     → primary motion
    FOREGROUND       → fastest
    ATMOSPHERE       → depth and mood

The goal is not merely to move images. The goal is to make the visitor feel that they are moving through a scene.

---

## 1. Generic Subject Model

Never assume the subject is walking.

Supported subjects include:

- Person
- Couple
- Group
- Car
- Motorcycle
- Bicycle
- Bus
- Train
- Boat
- Airplane
- Animal
- Character
- Product
- Abstract object

Examples:

- couple walking through a forest
- car driving along a mountain road
- motorcycle moving through a city
- boat crossing water
- train passing through countryside
- person cycling through a street
- animal running through a landscape
- product floating through an environment

The animation engine should be driven by scene configuration, not hard-coded behavior.

---

## 2. Layer Architecture

Prefer 4–6 layers:

1. Far Background
2. Mid Background
3. Ground / Environment
4. Main Subject
5. Foreground Elements
6. Atmospheric Effects

Not every scene requires all layers.

Example car scene:

    far-background  = distant mountains
    mid-background  = trees/buildings
    ground          = road
    subject         = car.png
    foreground      = roadside vegetation
    effects         = dust/light

Example boat scene:

    far-background  = sky
    mid-background  = mountains
    ground          = water
    subject         = boat.png
    foreground      = waves/reeds
    effects         = mist

---

## 3. Asset Structure

Use `/assets/` paths by default.

Recommended:

    /assets/
        far-background.jpg
        mid-background.jpg
        ground.jpg
        subject.png
        foreground.png

Keep filenames easy to replace.

Example:

```js
const sceneAssets = {
  farBackground: "/assets/far-background.jpg",
  midBackground: "/assets/mid-background.jpg",
  ground: "/assets/ground.jpg",
  subject: "/assets/subject.png",
  foreground: "/assets/foreground.png"
};
```

Do not embed images as base64 unless explicitly requested.

---

## 4. Main Subject Asset

Prefer a transparent PNG or WebP for the main subject.

Examples:

    car.png
    couple.png
    motorcycle.png
    boat.png
    person.png
    character.png

The asset should ideally have:

- transparent background
- clean edges
- appropriate perspective
- appropriate scale
- matching lighting
- optional natural shadow

Avoid surrounding scenery inside the subject asset.

---

## 5. Scroll Progress

Convert page scroll into normalized progress:

    0 → beginning
    1 → end

Example:

```js
function getProgress(section) {
  const rect = section.getBoundingClientRect();
  const scrollable = section.offsetHeight - window.innerHeight;

  if (scrollable <= 0) return 0;

  return Math.max(
    0,
    Math.min(1, -rect.top / scrollable)
  );
}
```

Use progress to control every animation property.

---

## 6. Sticky Scene

Preferred structure:

```html
<section class="parallax-section">

  <div class="parallax-stage">

    <div class="far-background"></div>
    <div class="mid-background"></div>
    <div class="ground"></div>

    <div class="subject">
      <img src="/assets/subject.png" alt="">
    </div>

    <div class="foreground"></div>
    <div class="effects"></div>

  </div>

</section>
```

CSS:

```css
.parallax-section {
  height: 400vh;
}

.parallax-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}
```

Typical scene lengths:

- 300vh — short
- 400vh — normal
- 500vh — cinematic
- 600vh+ — long journey

Make the value configurable.

---

## 7. Depth Speeds

Farther layers should generally move slower.

Useful starting values:

    far background  0.10–0.25
    mid background  0.25–0.45
    ground          0.45–0.75
    subject         0.80–1.20
    foreground      1.10–1.60

These are guidelines rather than fixed values.

The important relationship is:

    farther away → slower
    closer → faster

Do not make every layer move equally.

---

## 8. Camera Movement

Combine layer movement with a virtual camera.

Useful properties:

    cameraX
    cameraY
    cameraZoom
    cameraRotation
    cameraBlur
    cameraBrightness

Example:

```js
const cameraZoom = 1 + progress * 0.18;
const cameraY = progress * -30;
```

This can create the feeling of approaching a destination.

---

## 9. Main Subject Motion

Give the main subject independent motion.

Generic properties:

```js
const subjectMotion = {
  x: 120,
  y: -40,
  scale: 0.25,
  rotation: 2
};
```

Depending on the subject:

### Vehicle

Use:

- translateX
- translateY
- scale
- rotation
- optional motion blur

### Person

Use:

- translateX
- translateY
- scale
- subtle bob
- subtle rotation

### Boat

Use:

- translateX
- translateY
- gentle bob
- gentle rotation

### Airplane

Use:

- translateX
- translateY
- scale
- slight tilt

Do not apply walking animation to generic subjects.

---

## 10. Natural Secondary Motion

Subtle motion can prevent the subject from feeling like a sticker.

Examples:

- car → slight body movement
- boat → gentle bob
- person → subtle vertical motion
- animal → subtle body movement
- airplane → slight tilt
- motorcycle → slight lean
- product → floating motion

Example:

```js
const bob =
  Math.sin(progress * Math.PI * cycles) *
  amplitude *
  Math.sin(progress * Math.PI);
```

Keep secondary motion restrained.

---

## 11. Perspective Scaling

A subject approaching the camera should normally grow.

```js
const scale =
  startScale +
  (endScale - startScale) * progress;
```

Example:

    0%   → 0.75
    50%  → 0.95
    100% → 1.20

Avoid excessive scaling unless the scene intentionally requires it.

---

## 12. Foreground Occlusion

Foreground elements are critical for depth.

Possible foreground assets:

- leaves
- branches
- grass
- buildings
- rocks
- waves
- dust
- snow
- particles

Typical stacking:

```css
.foreground {
  z-index: 20;
}

.subject {
  z-index: 10;
}
```

Allow foreground elements to partially cross the subject.

This produces:

    background
        ↓
    subject
        ↓
    foreground

which is a strong depth cue.

---

## 13. Lighting and Atmosphere

Optional effects include:

- vignette
- fog
- sun glow
- dust
- light rays
- blur
- color grading
- soft shadows
- simulated depth of field

Example:

```css
.atmosphere {
  background:
    radial-gradient(
      circle at center,
      transparent 35%,
      rgba(0,0,0,.25) 100%
    );
}
```

Effects should support the subject, not hide it.

---

## 14. Story Timing

Use scroll progress as a narrative timeline.

A useful default:

    0%   establish environment
    15%  movement begins
    30%  subject movement becomes noticeable
    50%  strongest depth/camera movement
    65%  visual focal point
    80%  title/story appears
    90%  transition begins
    100% next section

Customize this for each scene.

Car example:

    0%   empty road
    20%  car enters
    40%  car travels
    60%  camera approaches
    75%  destination appears
    90%  title
    100% transition

Wedding example:

    0%   establish forest
    25%  couple moves
    50%  couple approaches
    70%  story title
    90%  invitation message
    100% wedding details

---

## 15. Text Animation

Keep text subordinate to the scene.

Useful effects:

- fade
- translate
- scale
- letter spacing
- blur-to-sharp
- mask reveal

Example:

```js
const textProgress =
  Math.max(0, Math.min(1, (progress - 0.55) / 0.20));

const opacity = textProgress;
const translateY = 30 * (1 - textProgress);
```

---

## 16. Smoothing

Raw scroll can feel robotic.

Use interpolation:

```js
current += (target - current) * 0.08;
```

Render with:

```js
requestAnimationFrame(render);
```

Prefer CSS transforms:

```css
transform: translate3d(...);
```

over continuously changing layout properties such as `top` and `left`.

---

## 17. Mobile

Treat mobile as a separate composition.

Adjust:

- layer scale
- subject width
- subject position
- camera movement
- scene height
- text position

Example:

```css
@media (max-width: 700px) {
  .subject {
    width: 80vw;
  }
}
```

Do not simply shrink the desktop composition.

---

## 18. Performance

Prefer:

```css
transform: translate3d(...);
```

Use:

```css
will-change: transform;
```

only on actively animated elements.

Prefer optimized:

- WebP
- AVIF
- optimized PNG

Avoid:

- huge uncompressed images
- excessive blur
- hundreds of DOM elements
- multiple unnecessary animation loops
- unnecessary layout recalculation

---

## 19. Accessibility

Decorative layers can use:

```html
aria-hidden="true"
```

Informative images should have useful `alt` text.

Support reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .parallax-section {
    height: auto;
  }

  .parallax-stage {
    position: relative;
  }
}
```

Provide a static or simplified version when reduced motion is requested.

---

## 20. Reusable Scene Configuration

Make the engine reusable through configuration:

```js
const sceneConfig = {
  assets: {
    farBackground: "/assets/far-background.jpg",
    midBackground: "/assets/mid-background.jpg",
    ground: "/assets/ground.jpg",
    subject: "/assets/subject.png",
    foreground: "/assets/foreground.png"
  },

  sectionHeight: 500,

  depth: {
    farBackground: 0.15,
    midBackground: 0.35,
    ground: 0.65,
    subject: 1.0,
    foreground: 1.35
  },

  subject: {
    startScale: 0.80,
    endScale: 1.15,
    x: 0,
    y: -20,
    rotation: 0
  },

  camera: {
    zoom: 0.18,
    y: -30,
    x: 0
  },

  text: {
    enabled: true,
    start: 0.55,
    end: 0.78
  }
};
```

The same engine should be able to handle:

    walking person
    car driving
    motorcycle
    boat
    train
    animal
    product
    character

without rewriting the animation engine.

---

## 21. Missing Assets

If only a background and subject exist, still build the effect.

If far background, mid background, and subject exist, simulate missing depth using:

- scaling
- blur
- gradients
- shadows
- atmospheric overlays

If only one flat image exists, recommend separating it into layers before attempting advanced parallax.

---

## 22. Consistent Asset Generation

When generating multiple assets for one scene, maintain:

- camera direction
- perspective
- lighting
- time of day
- color grading
- horizon position
- vanishing point
- lens feel
- environmental style

Example forest-road set:

    far background → distant trees + road vanishing point
    mid background → nearer trees + roadside vegetation
    ground → road surface + perspective
    subject → isolated person/vehicle/couple
    foreground → large leaves + branches

Consistency between layers is more important than making every individual image extremely detailed.

---

## 23. Avoid the Floating Sticker Effect

A transparent subject can look pasted onto the background.

Use:

- contact shadow
- ambient shadow
- matching color temperature
- slight atmospheric haze
- correct perspective scale
- foreground occlusion
- ground interaction

Examples:

### Vehicle

    road shadow
    wheel contact
    optional dust
    optional motion blur

### Person

    soft ground shadow
    foot contact
    foreground occlusion
    matching light

### Boat

    reflection
    wake
    water shadow
    mist

---

## 24. CSS vs GSAP vs Three.js

Use plain CSS + JavaScript when the scene uses:

- 2D images
- simple parallax
- scroll-driven movement
- camera zoom
- simple transitions

Use GSAP ScrollTrigger when the scene needs:

- complex timelines
- many coordinated animations
- precise scroll ranges
- advanced easing

Use Three.js when the scene needs:

- true 3D depth
- 3D camera
- 3D objects
- particles
- perspective distortion
- WebGL shaders
- complex spatial environments

Do not introduce Three.js simply because a project has parallax.

---

## 25. Recommended Default Stack

For most wedding, portfolio, storytelling, and marketing scenes:

    HTML
    CSS
    JavaScript
    requestAnimationFrame
    CSS transforms
    transparent PNG/WebP subject
    sticky scene
    normalized scroll progress

Start with this lightweight stack.

Move to GSAP or Three.js only when the visual requirements justify it.

---

## 26. Generic HTML Architecture

```html
<main>

  <section
    class="parallax-section"
    data-scene="journey"
  >

    <div class="parallax-stage">

      <div
        class="layer layer--far"
        aria-hidden="true"
      ></div>

      <div
        class="layer layer--mid"
        aria-hidden="true"
      ></div>

      <div
        class="layer layer--ground"
        aria-hidden="true"
      ></div>

      <div class="layer layer--subject">
        <img
          src="/assets/subject.png"
          alt=""
        />
      </div>

      <div
        class="layer layer--foreground"
        aria-hidden="true"
      ></div>

      <div
        class="layer layer--effects"
        aria-hidden="true"
      ></div>

      <div class="scene-content">
        <!-- narrative content -->
      </div>

    </div>

  </section>

</main>
```

---

## 27. Final Quality Checklist

Before delivering a generated parallax website:

- [ ] Assets use `/assets/` paths.
- [ ] Asset filenames are easy to replace.
- [ ] Far layer moves slowest.
- [ ] Mid layer moves faster than far layer.
- [ ] Ground has appropriate perspective movement.
- [ ] Main subject has independent movement.
- [ ] Subject can scale toward/away from camera.
- [ ] Foreground moves fastest when present.
- [ ] Scene uses a sticky viewport.
- [ ] Scroll controls the animation.
- [ ] Motion is smoothly interpolated.
- [ ] Text timing is configurable.
- [ ] Mobile layout is considered.
- [ ] Reduced-motion behavior exists.
- [ ] Images are not unnecessarily embedded as base64.
- [ ] No hard-coded assumption that the subject is a person.
- [ ] Scene configuration is reusable for different subjects.
- [ ] Next website section follows naturally.
- [ ] Optional layers can be omitted without breaking the scene.

---

## Core Principle

Think of scrolling as a **virtual camera controller**.

The desired hierarchy is:

    DEPTH
      ↓
    MOTION
      ↓
    CAMERA
      ↓
    STORY

not:

    IMAGE
      ↓
    IMAGE
      ↓
    IMAGE

The best parallax websites make the visitor feel that they are moving through a scene.
