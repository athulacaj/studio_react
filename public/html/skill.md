# JSON Website Generator

## Purpose

Generate a complete static HTML website where **every piece of content is driven from a single JavaScript object named `websiteData`**.

The generated website must support live editing by replacing `websiteData` and calling a single render function.

This architecture is intended for website builders, portfolio generators, AI editors, visual page editors, and no-code website generators.

---

# Core Principles

## 1. Single Source of Truth

All website content must exist inside one object.

```javascript
let websiteData = {
    hero: {
        content: {}
    }
};
```

Nothing displayed on the page may be hardcoded inside HTML templates.

### ✅ Good

```javascript
<h1>${websiteData.hero.content.title}</h1>
```

### ❌ Bad

```javascript
<h1>Welcome</h1>
```

---

## 2. Data Structure

Organize all website data into logical sections.

### Content Block Requirement

**Every section must contain a `content` block. All content belonging to that section must live inside its `content` block.**

The `content` block is the canonical location for the section's editable website content. Do not place section content directly beside `content`.

Example:

```javascript
let websiteData = {

    brand: {
        content: {}
    },

    navigation: {
        content: []
    },

    hero: {
        content: {}
    },

    about: {
        content: {}
    },

    services: {
        content: []
    },

    gallery: {
        content: []
    },

    portfolio: {
        content: []
    },

    team: {
        content: []
    },

    testimonials: {
        content: []
    },

    pricing: {
        content: []
    },

    faq: {
        content: []
    },

    contact: {
        content: {}
    },

    footer: {
        content: {}
    }

};
```

### Rule

Use:

```javascript
websiteData.hero.content.title
websiteData.about.content.description
websiteData.services.content[0].title
websiteData.gallery.content[0].image
```

Do **not** use:

```javascript
websiteData.hero.content.title
websiteData.services.content[0].title
websiteData.gallery.content[0].image
```

Every visible item on the website must originate from `websiteData.<section>.content`.

Section-level configuration that is not website content may exist outside `content` only when required by the renderer. Editable/visible website content must always be inside `content`.

---

# Required External Script

Every generated website **must always include** the Mizhiv connector script:

```html
<script src="https://cdn.mizhiv.com/assets/js/mizhiv_connector.js"></script>
```

The script must be present in every generated HTML file, regardless of which sections exist in `websiteData`.

Place it as a normal external `<script>` element in the HTML. Do not make its inclusion conditional on `websiteData` or on any section.

### Required Rule

The generated HTML must contain exactly this script reference:

```html
<script src="https://cdn.mizhiv.com/assets/js/mizhiv_connector.js"></script>
```

Do not:

- Remove the script when a section is missing.
- Load the script conditionally.
- Replace the URL with another URL.
- Hardcode the script contents into the HTML.
- Add multiple copies of the script.

Example:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- head content -->
</head>

<body>

    <div id="parent">
        <!-- generated sections -->
    </div>

    <script src="https://cdn.mizhiv.com/assets/js/mizhiv_connector.js"></script>

    <!-- other required scripts -->

</body>
</html>
```

The Mizhiv connector script is a **global website dependency**, not section content, and must remain present even when `websiteData` is empty or sections are removed during re-rendering.

# Required DOM Root

The generated HTML must have a `<div id="parent">` as the **first element immediately after `<body>`**. All generated website sections must be placed inside this `#parent` container.

Required structure:

```html
<body>
    <div id="parent">
        <!-- Generated sections -->
    </div>
</body>
```

The `#parent` element must always exist, even when sections are missing from `websiteData`. Do not place generated sections directly under `<body>` outside `#parent`.

# Rendering Rules

Every section must have its own render function.

# Conditional Section Rendering

Every section renderer **must conditionally render the section only when that section exists**.

The renderer must first check whether the section is available:

```javascript
if (!websiteData.hero) return;
```

or, when using a local variable:

```javascript
const hero = websiteData.hero;

if (!hero) return;
```

If the section exists, the renderer must then check the `content` block before rendering any content:

```javascript
if (!hero.content) return;
```

### Conditional Rendering of Individual Values

**Every individual content value must also be conditionally checked before it is rendered.**

Do not render empty, missing, `null`, or `undefined` values.

Example:

```javascript
function renderHero() {

    const hero = websiteData.hero;

    if (!hero) return;
    if (!hero.content) return;

    const content = hero.content;

    let html = '';

    if (content.name) {
        html += `
            <h1
                class="hero-name"
                data-json-path="hero.content.name">
                ${content.name}
            </h1>
        `;
    }

    if (content.description) {
        html += `
            <p
                class="hero-description"
                data-json-path="hero.content.description">
                ${content.description}
            </p>
        `;
    }

    if (content.image) {
        html += `
            <img
                src="${content.image}"
                class="hero-image"
                data-json-path="hero.content.image"
                alt="">
        `;
    }

    document.getElementById("hero").innerHTML = html;
}
```

### Nested Values

Nested values must also be checked before rendering.

```javascript
if (content.button) {

    if (content.button.text && content.button.href) {

        html += `
            <a
                href="${content.button.href}"
                class="hero-button"
                data-json-path="hero.content.button">
                ${content.button.text}
            </a>
        `;

    }

}
```

Do not assume nested objects exist.

### Array Sections

For array-based sections, check the section, the `content` array, each item, and each individual property.

```javascript
function renderServices() {

    const section = websiteData.services;

    if (!section) return;
    if (!section.content) return;
    if (!Array.isArray(section.content)) return;

    const items = section.content;

    let html = '';

    items.forEach((item, index) => {

        if (!item) return;

        let itemHtml = '';

        if (item.title) {
            itemHtml += `
                <h3
                    class="services-title"
                    data-json-path="services.content[${index}].title">
                    ${item.title}
                </h3>
            `;
        }

        if (item.description) {
            itemHtml += `
                <p
                    class="services-description"
                    data-json-path="services.content[${index}].description">
                    ${item.description}
                </p>
            `;
        }

        if (item.image) {
            itemHtml += `
                <img
                    src="${item.image}"
                    class="services-image"
                    data-json-path="services.content[${index}].image"
                    alt="">
            `;
        }

        if (itemHtml) {
            html += `
                <article
                    class="services-item services-item-${index}"
                    data-json-path="services.content[${index}]">
                    ${itemHtml}
                </article>
            `;
        }

    });

    if (html) {
        document.getElementById("services").innerHTML = html;
    }
}
```

### Empty Sections

If a section does not exist, has no `content`, or has no renderable content, **do not render an empty section into the page**.

For example:

```javascript
if (!websiteData.about) return;
if (!websiteData.about.content) return;
```

For arrays:

```javascript
if (!websiteData.services) return;
if (!websiteData.services.content) return;
if (!Array.isArray(websiteData.services.content)) return;
if (websiteData.services.content.length === 0) return;
```

Individual array items should also be skipped when they are missing or contain no renderable values.

### Required Pattern

Every section renderer should follow this general pattern:

```javascript
function renderSection() {

    const section = websiteData.section;

    // 1. Check section
    if (!section) return;

    // 2. Check content
    if (!section.content) return;

    // 3. Check content type when required
    // if (!Array.isArray(section.content)) return;

    // 4. Check every value before rendering
    if (section.content.title) {
        // render title
    }

    if (section.content.description) {
        // render description
    }

}
```

**Never blindly access or render optional content.**

Bad:

```javascript
<h1>${content.title}</h1>
<p>${content.description}</p>
<img src="${content.image}">
```

Good:

```javascript
if (content.title) {
    // render title
}

if (content.description) {
    // render description
}

if (content.image) {
    // render image
}
```

This rule applies to **every section, every nested object, every array item, and every individual content value**.

Example

```javascript
renderNavbar();

renderHero();

renderAbout();

renderServices();

renderGallery();

renderPortfolio();

renderTeam();

renderTestimonials();

renderPricing();

renderFaq();

renderContact();

renderFooter();
```

Each renderer should only read data from `websiteData`.

Each renderer must conditionally check the section and its `content` block before rendering. Every optional content value must also be checked before it is rendered.

Example

```javascript
function renderHero() {

    const hero = websiteData.hero;

    document.getElementById("hero").innerHTML = `
        <h1 class="hero-title">${hero.title}</h1>
        <p class="hero-description">${hero.description}</p>
    `;

}
```

---

# Master Renderer

Always create a single function responsible for rendering the complete website.

```javascript
function renderDataAll(data) {

    if (data) {
        websiteData = data;
    }

    renderNavbar();
    renderHero();
    renderAbout();
    renderServices();
    renderGallery();
    renderPortfolio();
    renderTeam();
    renderTestimonials();
    renderPricing();
    renderFaq();
    renderContact();
    renderFooter();

    initializeComponents();

}
```

All rendering must go through this function.

---

# Live Updates

The generated website must support live editing using `window.postMessage`.

```javascript
window.addEventListener("message", function (event) {

    if (event.data && event.data.type === "UPDATE_DATA") {

        renderDataAll(event.data.data);

    }

});
```

This allows external editors and builders to instantly update the page without reloading.

---

# Initial Render

Always render the website after the DOM is ready.

```javascript
document.addEventListener("DOMContentLoaded", function () {

    renderDataAll();

});
```

---

# Dynamic Rendering

Whenever rendering arrays, always use loops.

Preferred

```javascript
websiteData.services.content.map(...)
```

or

```javascript
websiteData.services.content.forEach(...)
```

Never manually duplicate cards.

---

# Theme System

All branding must come from JSON.

Example

```javascript
brand: {

    name,

    logo,

    theme: {

        primary,

        secondary,

        gradient,

        accent,

        font,

        border

    }

}
```

Never hardcode:

- Colors
- Gradients
- Fonts
- Logos
- Branding

---

# Images

Every image URL must come from `websiteData`.

Example

```javascript
websiteData.hero.content.image

websiteData.gallery.content[0].image

websiteData.team.content[0].photo
```

Never hardcode image URLs inside HTML.

---

# Icons

Store icon names in JSON.

Example

```javascript
{
    title: "Photography",
    icon: "camera"
}
```

The renderer should use the icon library to generate icons dynamically.

---

# Navigation

Navigation must also come from JSON.

Example

```javascript
navigation: [

    {
        title: "Home",
        href: "#hero"
    },

    {
        title: "Services",
        href: "#services"
    }

]
```

Never hardcode navigation items.

---

# Buttons

Every button should come from JSON.

Example

```javascript
hero: {

    button: {

        text: "Explore",

        href: "#portfolio"

    }

}
```

---

# JSON Path CSS Class Mapping (NEW)

Every visible element rendered from `websiteData` **must include one or more CSS classes representing its JSON path**.

This enables visual editors to determine exactly which JSON property generated a clicked HTML element.

## Purpose

When a user clicks an element, the editor should be able to determine the corresponding JSON field simply by reading the element's CSS classes.

## Content Block Path Rule

Because every section has a `content` block, JSON paths must include the `content` segment.

Examples:

```text
hero.content.title
hero.content.button.text
services.content[0].title
gallery.content[4].image
```

For array sections, the array is always `websiteData.<section>.content`.

For object sections, editable fields are always `websiteData.<section>.content.<field>`.

This rule must be followed by renderers, CSS path classes, and `data-json-path` attributes.

Example:

```javascript
websiteData.hero.content.title
```

renders

```html
<h1 class="hero-title">
```

Likewise,

```javascript
websiteData.about.content.description
```

renders

```html
<p class="about-description">
```

---

## Nested Objects

Nested properties should concatenate keys using hyphens.

Example

```javascript
websiteData.hero.content.button.text
```

becomes

```html
<a class="hero-button hero-button-text">
```

or

```html
<a class="hero-button-text">
```

---

## Arrays

Array items should include both:

- the collection class
- the item index
- the property class

Example

```javascript
websiteData.services.content[0].title
```

renders

```html
<h3 class="services-item services-item-0 services-title">
```

Another example

```javascript
websiteData.team.content[2].name
```

renders

```html
<h4 class="team-item team-item-2 team-name">
```

Gallery

```javascript
websiteData.gallery.content[4].image
```

renders

```html
<img class="gallery-item gallery-item-4 gallery-image">
```

---

## Entire Components

Container elements should also receive classes representing their source.

Example

```html
<section id="hero" class="hero"></section>

<section id="services" class="services"></section>

<div class="service-card services-item services-item-0"></div>
```

---

## Data Attributes (Recommended)

In addition to CSS classes, include a data attribute describing the exact JSON path.

Example

```html
<h1
    class="hero-title"
    data-json-path="hero.content.title">
</h1>
```

Button

```html
<a
    class="hero-button-text"
    data-json-path="hero.content.button.text">
</a>
```

Service

```html
<h3
    class="services-title"
    data-json-path="services.content[0].title">
</h3>
```

This makes editor integration significantly easier.

---

## Click Detection

Editors can determine the selected JSON field using either:

```javascript
element.dataset.jsonPath
```

or

```javascript
element.classList
```

Example

```javascript
document.addEventListener("click", function(event){

    const element = event.target;

    console.log(element.dataset.jsonPath);

});
```

---

## Rendering Example

```javascript
function renderHero() {

    document.getElementById("hero").innerHTML = `
        <h1
            class="hero-title"
            data-json-path="hero.content.title">
            ${websiteData.hero.content.title}
        </h1>

        <p
            class="hero-description"
            data-json-path="hero.description">
            ${websiteData.hero.content.description}
        </p>

        <a
            href="${websiteData.hero.content.button.href}"
            class="hero-button hero-button-text"
            data-json-path="hero.content.button.text">
            ${websiteData.hero.content.button.text}
        </a>
    `;

}
```

---

# Component Initialization

After rendering the website, initialize all JavaScript components.

Example

```javascript
function initializeComponents() {

    lucide.createIcons();

    initScrollAnimations();

    initSlider();

    initCounters();

    initAccordion();

}
```

Only call this from `renderDataAll()`.

---

# No Duplicate State

Never create variables like

```javascript
let hero;

let services;

let about;
```

Always access data directly from

```javascript
websiteData
```

---

# Extensibility

Adding a new section should only require:

1.

```javascript
websiteData.blog.content
```

2.

```javascript
renderBlog();
```

3.

```javascript
renderDataAll();
```

No other code should require modification.

The same JSON path naming rules automatically apply to all new sections.

Example

```javascript
websiteData.blog.content[0].title
```

renders

```html
<h2
    class="blog-title blog-item blog-item-0"
    data-json-path="blog[0].title">
</h2>
```

---

# HTML Rules

Use semantic HTML.

Every major section should have its own container.

Example

```html
<section id="hero" class="hero"></section>

<section id="about" class="about"></section>

<section id="services" class="services"></section>

<section id="portfolio" class="portfolio"></section>

<section id="gallery" class="gallery"></section>

<section id="team" class="team"></section>

<section id="pricing" class="pricing"></section>

<section id="faq" class="faq"></section>

<section id="contact" class="contact"></section>

<footer id="footer" class="footer"></footer>
```

---

# JavaScript Rules

- Prefer template literals.
- Keep functions small.
- Avoid duplicated HTML.
- Avoid duplicated logic.
- Separate rendering from behavior.
- Keep rendering functions independent.
- Every rendered element must include JSON path classes.
- Every rendered element should include `data-json-path`.

---

# Folder Structure

```
index.html

css/
    style.css

js/
    data.js
    render.js
    events.js
    app.js
```

---

# Output Requirements

The generated website **must**:

- Use a single `websiteData` object as the only source of truth.
- Every website section must contain a `content` block.
- Read all editable/visible website content from `websiteData.<section>.content`.
- For array sections, iterate over `websiteData.<section>.content`.
- Never hardcode visible text, images, links, colors, branding, or icons.
- Create a `renderDataAll(data)` function.
- Support live updates using:

```javascript
window.addEventListener("message", function (event) {

    if (event.data && event.data.type === "UPDATE_DATA") {
        renderDataAll(event.data.data);
    }

});
```

- Render all array-based sections dynamically.
- Check that each section exists before rendering it.
- Check that each section's `content` block exists before rendering its content.
- Check every individual content value before rendering it.
- Check nested objects and array items before accessing their properties.
- Do not render empty sections or empty content elements.
- Reinitialize interactive components after every render.
- Add CSS classes representing the JSON path of every rendered value.
- Add `data-json-path` to every rendered element.
- Allow editors to identify clicked content from either CSS classes or `data-json-path`.
- Be modular and easy to extend.
- Support replacing the complete website by supplying a new `websiteData` object.
- Produce a single `index.html` unless the user explicitly requests a multi-file project.



---------------       -----------------------------------------------




## Parent Communication

The generated website must communicate with its parent window using `window.postMessage`.

For maximum compatibility, all outgoing messages should use `"*"` as the `targetOrigin`.

```javascript
window.parent.postMessage(message, "*");
```

This allows the generated website to work whether it is embedded on the same origin or a different origin without requiring additional configuration.

---

## Element Click Events

The generated website **must** register a global click listener.

```javascript
document.addEventListener("click", function (event) {

    console.log("clicked");

    const jsonPath = event.target.dataset.jsonPath;

    if (!jsonPath) return;

    window.parent.postMessage({
        type: "ELEMENT_CLICKED",
        jsonPath
    }, "*");

});
```

---

## Requirements

This event listener must:

* Be included in every generated website.
* Be initialized automatically.
* Remain active after every call to `renderDataAll()`.
* Work for dynamically rendered elements.
* Send the selected element's `data-json-path` to the parent window.
* Use `"*"` as the `targetOrigin`.
* Be usable by external applications without modification.

---

## Message Format

Whenever a rendered element is clicked, the website should send:

```javascript
window.parent.postMessage({
    type: "ELEMENT_CLICKED",
    jsonPath: event.target.dataset.jsonPath
}, "*");
```

Example messages

```javascript
{
    type: "ELEMENT_CLICKED",
    jsonPath: "hero.title"
}
```

```javascript
{
    type: "ELEMENT_CLICKED",
    jsonPath: "services[0]"
}
```

```javascript
{
    type: "ELEMENT_CLICKED",
    jsonPath: "gallery[4].image"
}
```

---

## JSON Path Requirement

Since editor communication depends on `data-json-path`, **every HTML element created by the renderer must include a valid `data-json-path` attribute**.

This includes:

* Root section containers
* Parent wrapper elements
* Child wrapper elements
* Cards
* Grid items
* Navigation items
* Buttons
* Links
* Images
* Icons
* SVG elements
* Forms
* Inputs
* Labels
* Headings
* Paragraphs
* List items
* Every dynamically rendered HTML element

There are **no exceptions**.

---

## Public Communication Contract

The generated website must expose the following communication contract.

### Parent → Website

```javascript
{
    type: "UPDATE_DATA",
    data: websiteData
}
```

### Website → Parent

```javascript
{
    type: "ELEMENT_CLICKED",
    jsonPath: "hero.title"
}
```

Future communication between the generated website and external editors should continue using the same `window.postMessage` pattern.

---

---------------       -----------------------------------------------

# Performance Optimization

Generated websites must be optimized for low-end devices. Poor performance causes the page to hang, animate poorly, or fail to load entirely on budget phones and slow networks.

Apply all of the following rules in every generated website.

---

## 1. Font Preconnect

Always add `preconnect` hints **before** any Google Fonts or external font `<link>` tags.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

### ✅ Good

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
```

### ❌ Bad

```html
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
```

Missing `preconnect` blocks rendering while the browser opens a DNS + TLS connection.

---

## 2. Hero Image Preload

The hero image is the largest contentful paint element. Always preload it so the browser fetches it as early as possible.

Add this inside `<head>`, before any scripts:

```html
<link rel="preload" as="image" href="{websiteData.hero.content.image}" />
```

If the image URL comes from data, inject this tag dynamically right before `renderHero()` runs:

```javascript
function preloadHeroImage() {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = websiteData.hero.content.image;
    document.head.appendChild(link);
}
```

Call `preloadHeroImage()` as the very first step in `renderDataAll()`.

---

## 3. `will-change` — Do Not Apply Globally

`will-change` forces the GPU to allocate a compositing layer. Applying it to many elements at once exhausts GPU memory on low-end devices and causes the page to hang or crash.

### ❌ Bad — Applied to all elements at page load

```css
.fade-in-section {
    will-change: opacity, transform; /* Applied to ALL sections simultaneously */
}

.gallery-item img {
    will-change: transform; /* Applied to all gallery images simultaneously */
}
```

### ✅ Good — Apply only when needed, reset immediately after

```css
/* Remove will-change from the base rule */
.fade-in-section {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 1s ease, transform 1s ease;
}

/* Apply temporarily during animation only */
.fade-in-section.animating {
    will-change: opacity, transform;
}

/* Reset after animation completes */
.fade-in-section.visible {
    opacity: 1;
    transform: translateY(0);
    will-change: auto;
}
```

Apply and remove `will-change` using the IntersectionObserver:

```javascript
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animating');
                requestAnimationFrame(() => {
                    entry.target.classList.add('visible');
                    entry.target.classList.remove('animating');
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
}
```

---

## 4. Scroll Handler — Always Use `requestAnimationFrame`

Never run DOM reads or writes directly inside a scroll event handler. Scroll events fire hundreds of times per second. Without throttling, every pixel of scroll triggers layout recalculation and forced reflow, causing jank and freezes.

### ❌ Bad — Runs on every scroll event

```javascript
window.onscroll = () => {
    const scroll = window.scrollY;
    navbar.classList.toggle('scrolled', scroll > 100);
    heroImage.style.transform = `translateY(${scroll * 0.3}px)`;
};
```

### ✅ Good — Throttled with `requestAnimationFrame`

```javascript
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const scroll = window.scrollY;

            navbar.classList.toggle('nav-scrolled', scroll > 100);

            if (heroImage && scroll < window.innerHeight) {
                heroImage.style.transform = `translateY(${scroll * 0.3}px) scale(1.1)`;
            }

            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });
```

Always add `{ passive: true }` to scroll listeners. This tells the browser the handler will never call `preventDefault()`, allowing it to scroll on a separate thread without waiting for JavaScript.

---

## 5. Lazy Load iFrames with IntersectionObserver

iFrames (e.g. Google Maps) are extremely heavy. Even with `loading="lazy"`, they are parsed and can block the main thread if injected into the DOM at page load.

Always defer iframe `src` injection until the iframe is about to enter the viewport.

### ❌ Bad — iFrame loads at page start

```javascript
function renderLocations() {
    document.getElementById('location').innerHTML = events.map(event => `
        <iframe src="${event.locationUrl}" loading="lazy"></iframe>
    `).join('');
}
```

### ✅ Good — Inject `src` only when visible

```javascript
function renderLocations() {
    document.getElementById('location').innerHTML = events.map(event => `
        <iframe data-src="${event.locationUrl}" loading="lazy"></iframe>
    `).join('');
}

function initLazyIframes() {
    const iframes = document.querySelectorAll('iframe[data-src]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.src = entry.target.dataset.src;
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '300px' });

    iframes.forEach(iframe => observer.observe(iframe));
}
```

Call `initLazyIframes()` inside `initializeComponents()`.

---

## 6. `backdrop-filter` — Use Only When Supported

`backdrop-filter: blur()` is one of the most GPU-intensive CSS properties. On low-end devices it causes visible stuttering, especially when triggered by scroll events.

### ❌ Bad — Always applied

```css
.nav-scrolled {
    backdrop-filter: blur(12px);
}
```

### ✅ Good — Apply only when the browser can handle it

```css
.nav-scrolled {
    background-color: rgba(250, 249, 246, 0.95);
}

@supports (backdrop-filter: blur(12px)) {
    .nav-scrolled {
        background-color: rgba(250, 249, 246, 0.85);
        backdrop-filter: blur(12px);
    }
}
```

Devices that do not support `backdrop-filter` fall back to a solid semi-transparent background color.

---

## 7. Tailwind CDN — Development Only

Using the Tailwind CDN (`https://cdn.tailwindcss.com`) is acceptable for prototyping and development. It must **never** be used in production.

The CDN downloads the full Tailwind framework (~350 KB uncompressed) and parses all CSS classes in the browser at runtime. This is extremely slow on low-end devices and significantly delays time-to-first-paint.

### ❌ Bad — CDN in a deployed website

```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
```

### ✅ Good — Compiled CSS for production

For production, build Tailwind through its CLI or PostCSS pipeline and ship only the CSS classes that are actually used. The output is typically 5–15 KB.

If the generated website must remain a single self-contained HTML file, use a minimal inline `<style>` block with only the required utility classes instead of loading the full CDN.

---

## 8. Gallery Images — Always Use `loading="lazy"`

Gallery images are below the fold. Always add `loading="lazy"` so the browser only fetches them when they are about to enter the viewport.

### ✅ Required

```html
<img src="${img.src}" alt="Gallery photo" loading="lazy" />
```

Additionally, provide a `width` and `height` attribute or use `aspect-ratio` in CSS to prevent cumulative layout shift (CLS) as images load.

```html
<img src="${img.src}" alt="Gallery photo" loading="lazy" width="740" height="450" />
```

---

## 9. Reduced Motion Accessibility

Some users configure their OS to reduce animations. Always respect the `prefers-reduced-motion` media query. Ignoring it can cause motion sickness and also reduces load on low-end hardware.

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

Add this at the end of every `<style>` block.

---

## 10. Loader Removal

Always hide the preloader after all rendering and component initialization is complete, not before.

### ✅ Good — Hide loader last

```javascript
function initializeComponents() {
    initScrollAnimations();
    initNavbarScroll();
    initLazyIframes();
    initRsvpForm();
    hideLoader(); // Always call last
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => loader.classList.add('hidden'), 300);
    }
}
```

### ❌ Bad — Hiding loader before rendering completes

```javascript
hideLoader();
renderGallery(); // Gallery renders after loader is already gone
```

---

## Performance Checklist

Apply this checklist to every generated website before delivery.

| Check | Required |
|---|---|
| `preconnect` before all Google Fonts `<link>` tags | ✅ |
| Hero image preloaded dynamically | ✅ |
| `will-change` not applied globally in CSS | ✅ |
| `will-change` reset to `auto` after animation | ✅ |
| Scroll handler wrapped in `requestAnimationFrame` | ✅ |
| Scroll listener uses `{ passive: true }` | ✅ |
| iFrames use `data-src` and lazy IntersectionObserver | ✅ |
| `backdrop-filter` inside `@supports` block | ✅ |
| Tailwind CDN not used in production | ✅ |
| All gallery images use `loading="lazy"` | ✅ |
| `prefers-reduced-motion` block included | ✅ |
| Loader hidden only after all rendering completes | ✅ |



---

# Image Object Position

All rendered images must support a configurable `object-position` value driven by `websiteData`.

## Rule

Every image rendered from JSON must read its `object-position` from the corresponding image data in JSON. The JSON property name must be `objectPosition`.

The default value must be `50% 50%` when `objectPosition` is missing, empty, `null`, or `undefined`.

### Example JSON

```javascript
let websiteData = {
    hero: {
        content: {
            image: "https://example.com/hero.jpg",
            objectPosition: "30% 20%"
        }
    },
    gallery: {
        content: [
            {
                image: "https://example.com/photo.jpg",
                objectPosition: "70% 40%"
            }
        ]
    }
};
```

### Rendering Rule

For every rendered image, use the JSON value with a `50% 50%` fallback:

```javascript
const objectPosition = content.objectPosition || "50% 50%";
```

Then apply it to the image:

```html
<img
    src="${content.image}"
    style="object-position: ${objectPosition};"
    data-json-path="hero.content.image"
    alt="">
```

For array items:

```javascript
const objectPosition = item.objectPosition || "50% 50%";
```

```html
<img
    src="${item.image}"
    style="object-position: ${objectPosition};"
    data-json-path="gallery.content[${index}].image"
    alt="">
```

### Requirements

- Every rendered image must support JSON-driven `object-position`.
- Each image must be independently customizable through its JSON data.
- Default to `50% 50%` when `objectPosition` is not provided.
- Do not hardcode a different image position in individual renderers.
- This applies to hero, gallery, portfolio, team, service, and all other images rendered from `websiteData`.
- When the image uses `object-fit: cover`, `object-position` must control which portion of the image remains visible.
- The image URL and `objectPosition` must come from `websiteData`.

### CSS

Images that are cropped should support the position normally:

```css
img {
    object-fit: cover;
    object-position: 50% 50%;
}
```

The renderer-provided inline `object-position` must override the default CSS position.

### Complete Example

```javascript
if (content.image) {
    const objectPosition = content.objectPosition || "50% 50%";

    html += `
        <img
            src="${content.image}"
            class="hero-image"
            style="object-position: ${objectPosition};"
            data-json-path="hero.content.image"
            alt="">
    `;
}
```

The renderer must always use the JSON value when provided and `50% 50%` only as the fallback.


## DOM Removal for Missing Sections

When a section is missing from the new `websiteData`, the renderer must **remove the existing section element from the DOM**, not merely return. This is required because `renderDataAll(data)` may replace previously rendered data.

Required pattern:

```javascript
function renderHero() {
    const hero = websiteData.hero;

    if (!hero) {
        document.getElementById("hero")?.remove();
        return;
    }

    if (!hero.content) {
        document.getElementById("hero")?.remove();
        return;
    }

    // render hero...
}
```

Prefer a shared helper:

```javascript
function removeSection(sectionId) {
    document.getElementById(sectionId)?.remove();
}
```

Then:

```javascript
if (!hero) {
    removeSection("hero");
    return;
}
```

For array sections, also remove the section when `content` is missing, is not an array, is empty, or produces no renderable HTML.

Every renderer must therefore handle both states:

- Section exists → render/update it.
- Section does not exist → remove its old DOM element.

