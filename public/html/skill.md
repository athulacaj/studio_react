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
let websiteData = {};
```

Nothing displayed on the page may be hardcoded inside HTML templates.

### ✅ Good

```javascript
<h1>${websiteData.hero.title}</h1>
```

### ❌ Bad

```javascript
<h1>Welcome</h1>
```

---

## 2. Data Structure

Organize all content into logical sections.

Example

```javascript
let websiteData = {

    brand: {},

    navigation: [],

    hero: {},

    about: {},

    services: [],

    gallery: [],

    portfolio: [],

    team: [],

    testimonials: [],

    pricing: [],

    faq: [],

    contact: {},

    footer: {}

};
```

Every visible item on the website must originate from `websiteData`.

---

# Rendering Rules

Every section must have its own render function.

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
websiteData.services.map(...)
```

or

```javascript
websiteData.services.forEach(...)
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
websiteData.hero.image

websiteData.gallery[0].image

websiteData.team[0].photo
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

Example:

```javascript
websiteData.hero.title
```

renders

```html
<h1 class="hero-title">
```

Likewise,

```javascript
websiteData.about.description
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
websiteData.hero.button.text
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
websiteData.services[0].title
```

renders

```html
<h3 class="services-item services-item-0 services-title">
```

Another example

```javascript
websiteData.team[2].name
```

renders

```html
<h4 class="team-item team-item-2 team-name">
```

Gallery

```javascript
websiteData.gallery[4].image
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
    data-json-path="hero.title">
</h1>
```

Button

```html
<a
    class="hero-button-text"
    data-json-path="hero.button.text">
</a>
```

Service

```html
<h3
    class="services-title"
    data-json-path="services[0].title">
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
            data-json-path="hero.title">
            ${websiteData.hero.title}
        </h1>

        <p
            class="hero-description"
            data-json-path="hero.description">
            ${websiteData.hero.description}
        </p>

        <a
            href="${websiteData.hero.button.href}"
            class="hero-button hero-button-text"
            data-json-path="hero.button.text">
            ${websiteData.hero.button.text}
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
websiteData.blog
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
websiteData.blog[0].title
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
- Read all website content from `websiteData`.
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
- Reinitialize interactive components after every render.
- Add CSS classes representing the JSON path of every rendered value.
- Add `data-json-path` to every rendered element.
- Allow editors to identify clicked content from either CSS classes or `data-json-path`.
- Be modular and easy to extend.
- Support replacing the complete website by supplying a new `websiteData` object.
- Produce a single `index.html` unless the user explicitly requests a multi-file project.