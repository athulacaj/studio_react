import re

with open("public/templates/christian/index.html", "r") as f:
    content = f.read()

# Extract CSS
style_match = re.search(r"<style>(.*?)</style>", content, re.DOTALL)
css = style_match.group(1) if style_match else ""

# Extract Canvas logic
canvas_match = re.search(r"const canvas = document\.getElementById\(\"particleCanvas\"\);.*?animateParticles\(\);", content, re.DOTALL)
canvas_logic = canvas_match.group(0) if canvas_match else ""

html_template = """<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>Jonathan &amp; Sarah — Holy Matrimony Digital Invitation</title>
  <meta name="description"
    content="You are joyfully invited to the Holy Matrimony of Jonathan &amp; Sarah. Experience our interactive walk journey, celebration schedule, and RSVP." />

  <!-- Premium Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
    rel="stylesheet" />

  <style>
""" + css + """
  </style>
</head>

<body>
  <div id="parent">
    <!-- Generated sections will be injected here -->
  </div>

  <script src="https://cdn.mizhiv.com/assets/js/mizhiv_connector.js"></script>

  <script>
    /* ==========================================================================
       1. DATA ARCHITECTURE (websiteData)
       ========================================================================== */
    let websiteData = {
      activeTheme: "emerald",
      theme: [
        {
          id: "emerald",
          name: "Emerald Royal",
          colors: {
            primary: "#11261f",
            "primary-deep": "#06110d",
            "primary-light": "#1e3d32",
            accent: "#c9a44c",
            "accent-light": "#e8cf8d",
            "accent-dark": "#997828",
            "gold-glow": "rgba(201, 164, 76, 0.4)",
            bg: "#06110d",
            "surface-glass": "rgba(10, 24, 18, 0.85)",
            "surface-light": "rgba(255, 255, 255, 0.94)",
            border: "rgba(201, 164, 76, 0.35)",
            "border-glow": "rgba(201, 164, 76, 0.65)",
            "text-light": "#f7f2ea",
            "text-muted": "#9daea4"
          }
        },
        {
          id: "navy",
          name: "Midnight Navy",
          colors: {
            primary: "#0b192c",
            "primary-deep": "#050b14",
            "primary-light": "#152e4d",
            accent: "#d4af37",
            "accent-light": "#f3e5be",
            "accent-dark": "#aa8c2c",
            "gold-glow": "rgba(212, 175, 55, 0.4)",
            bg: "#050b14",
            "surface-glass": "rgba(11, 25, 44, 0.85)",
            "surface-light": "rgba(255, 255, 255, 0.94)",
            border: "rgba(212, 175, 55, 0.35)",
            "border-glow": "rgba(212, 175, 55, 0.65)",
            "text-light": "#f8f9fa",
            "text-muted": "#a0aab5"
          }
        },
        {
          id: "burgundy",
          name: "Burgundy Velvet",
          colors: {
            primary: "#3a131a",
            "primary-deep": "#1c0a0c",
            "primary-light": "#541b25",
            accent: "#dfa773",
            "accent-light": "#f5d4b5",
            "accent-dark": "#b3855a",
            "gold-glow": "rgba(223, 167, 115, 0.4)",
            bg: "#1c0a0c",
            "surface-glass": "rgba(58, 19, 26, 0.85)",
            "surface-light": "rgba(255, 255, 255, 0.94)",
            border: "rgba(223, 167, 115, 0.35)",
            "border-glow": "rgba(223, 167, 115, 0.65)",
            "text-light": "#fdf8f5",
            "text-muted": "#bba4a7"
          }
        }
      ],
      opening: {
        content: {
          monogram: "J & S",
          eyebrow: "The Holy Matrimony",
          title: "Jonathan & Sarah",
          description: "Before the sacred journey unfolds, step inside to celebrate a blessed covenant of faith, hope, and love.",
          buttonText: "Open Invitation",
          hint: "Scroll to walk together"
        }
      },
      audio: {
        content: {
          audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_c97a8e03e5.mp3?filename=romantic-wedding-piano-111978.mp3",
          label: "Music"
        }
      },
      walkEngine: {
        content: {
          videoUrl: "./toEdit-transparent.webm",
          firstFrame: "./first-frame.png",
          lastFrame: "./last-frame.png",
          backdropUrl: "./cathedral-bg.jpg",
          scrollHint: "Scroll to walk together"
        }
      },
      stage1_welcome: {
        content: {
          badge: "The Holy Matrimony",
          groom: "Jonathan Edwards",
          bride: "Sarah Grace",
          verse: "Therefore what God has joined together, let no one separate.",
          citation: "— Mark 10:9 —"
        }
      },
      stage2_countdown: {
        content: {
          badge: "Save The Date",
          dateText: "Saturday, December 20, 2026",
          description: "Together with our parents, we count down the moments until we speak our sacred vows before God.",
          targetDate: "2026-12-20T14:30:00"
        }
      },
      stage3_ceremony: {
        content: {
          badge: "The Holy Ceremony",
          venue: "St. Peter's Cathedral Sanctuary",
          time: "2:30 PM – 4:00 PM",
          address: "100 Cathedral Way, San Francisco, CA 94108",
          subtext: "Please be seated by 2:15 PM for the sacred prelude",
          mapUrl: "https://maps.google.com/?q=St.+Peter's+Cathedral",
          mapLabel: "📍 Get Directions",
          calendarLabel: "📅 Add to Calendar"
        }
      },
      stage4_reception: {
        content: {
          badge: "Evening Celebration",
          venue: "The Grand Crystal Conservatory",
          time: "6:00 PM – 11:00 PM",
          address: "450 Garden Promenade, San Francisco, CA 94109",
          subtext: "Attire: Black Tie / Formal Evening Elegance",
          mapUrl: "https://maps.google.com/?q=The+Grand+Crystal+Conservatory",
          mapLabel: "📍 Get Directions",
          calendarLabel: "📅 Add to Calendar"
        }
      },
      stage5_story: {
        content: [
          {
            year: "2021 • First Met",
            title: "Fellowship Meeting",
            description: "A greeting over coffee sparked shared purpose and faith."
          },
          {
            year: "2022 • Courtship",
            title: "Growing in Grace",
            description: "Through shared prayers and hikes, friendship grew into devotion."
          },
          {
            year: "2025 • The Proposal",
            title: "Sunset Covenant",
            description: "Overlooking the ocean, a ring and a promise for eternity."
          },
          {
            year: "2026 • Forever",
            title: "Holy Matrimony",
            description: "Standing before God and loved ones to become one flesh."
          }
        ]
      },
      stage6_rsvp: {
        content: {
          badge: "United in Christ ✦ RSVP",
          heading: "Celebrate With Us",
          buttonLabel: "Confirm My RSVP",
          registryHeading: "🎁 Wishing Well: First National Bank 1234-5678-9012",
          bankAccount: "1234-5678-9012-3456",
          copyLabel: "📋 Copy Bank Info"
        }
      }
    };

    /* ==========================================================================
       2. THEME ENGINE
       ========================================================================== */
    function getActiveTheme() {
      if (!Array.isArray(websiteData.theme)) return null;
      const themes = websiteData.theme.filter(Boolean);
      if (!themes.length) return null;
      
      const urlParams = new URLSearchParams(window.location.search);
      const themeParam = urlParams.get('theme');
      
      if (themeParam) {
        const isValidTheme = themes.some(theme => theme.id === themeParam);
        if (isValidTheme) {
          websiteData.activeTheme = themeParam;
        }
      }
      return themes.find(theme => theme.id === websiteData.activeTheme) || themes[0];
    }

    function applyActiveTheme() {
      const theme = getActiveTheme();
      if (!theme || !theme.colors) return;
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--theme-${key}`, value);
        }
      });
    }

    /* ==========================================================================
       3. RENDERERS
       ========================================================================== */

    function renderOpening() {
      const section = websiteData.opening;
      if (!section || !section.content) return '';
      const c = section.content;

      return `
        <div class="opening-screen" id="openingScreen">
          <div class="opening-curtain left"></div>
          <div class="opening-curtain right"></div>
          <div class="opening-center">
            ${c.monogram ? `<div class="opening-monogram">
              <span class="opening-monogram-text" data-json-path="opening.content.monogram">${c.monogram}</span>
              <div class="monogram-ring ring-1"></div>
              <div class="monogram-ring ring-2"></div>
            </div>` : ''}
            
            ${c.eyebrow ? `<div class="opening-hint" data-json-path="opening.content.eyebrow">${c.eyebrow}</div>` : ''}
            ${c.title ? `<h1 class="opening-title font-display gold-gradient-text" data-json-path="opening.content.title">${c.title}</h1>` : ''}
            ${c.description ? `<p class="opening-desc" data-json-path="opening.content.description">${c.description}</p>` : ''}
            
            ${c.buttonText ? `<button class="btn-open-invitation" id="btnOpenInvitation" data-json-path="opening.content.buttonText">
              ${c.buttonText}
              <div class="btn-glow"></div>
            </button>` : ''}
            
            ${c.hint ? `<div class="scroll-down-hint">
              <span data-json-path="opening.content.hint">${c.hint}</span>
              <div class="scroll-arrow"></div>
            </div>` : ''}
          </div>
        </div>
      `;
    }

    function renderAudio() {
      const section = websiteData.audio;
      if (!section || !section.content) return '';
      const c = section.content;
      
      return `
        <audio id="weddingAudio" loop preload="none">
          <source src="${c.audioUrl}" type="audio/mp3" data-json-path="audio.content.audioUrl" />
        </audio>
        <div class="floating-audio-pill" id="audioToggleBtn">
          <div class="sound-bars" id="soundBars">
            <div class="sound-bar"></div>
            <div class="sound-bar"></div>
            <div class="sound-bar"></div>
          </div>
          <span class="audio-label font-display" id="audioLabel" data-json-path="audio.content.label">${c.label}</span>
        </div>
      `;
    }

    function renderWalkControls() {
      return `
        <button class="btn-auto-walk" id="btnAutoWalk">
          <span>▶</span> Auto Walk
        </button>

        <div class="stage-nav-dots">
          <div class="nav-dot-item active" onclick="jumpToStage(0)">
            <div class="nav-dot-point"></div>
            <span class="nav-dot-label">Welcome</span>
          </div>
          <div class="nav-dot-item" onclick="jumpToStage(1)">
            <div class="nav-dot-point"></div>
            <span class="nav-dot-label">Save the Date</span>
          </div>
          <div class="nav-dot-item" onclick="jumpToStage(2)">
            <div class="nav-dot-point"></div>
            <span class="nav-dot-label">Ceremony</span>
          </div>
          <div class="nav-dot-item" onclick="jumpToStage(3)">
            <div class="nav-dot-point"></div>
            <span class="nav-dot-label">Reception</span>
          </div>
          <div class="nav-dot-item" onclick="jumpToStage(4)">
            <div class="nav-dot-point"></div>
            <span class="nav-dot-label">Our Story</span>
          </div>
          <div class="nav-dot-item" onclick="jumpToStage(5)">
            <div class="nav-dot-point"></div>
            <span class="nav-dot-label">RSVP</span>
          </div>
        </div>

        <div class="fixed-bottom-bar">
          <div class="timeline-track">
            <div class="timeline-fill" id="timelineFill"></div>
          </div>
          <div class="timeline-time-label font-display" id="timelineTimeLabel">0:00 / 0:10</div>
        </div>
      `;
    }

    function renderStageCards() {
      let cardsHtml = '';
      
      // Stage 0: Welcome
      const s1 = websiteData.stage1_welcome;
      if (s1 && s1.content) {
        cardsHtml += `
          <div class="stage-card active" id="stageCard0">
            ${s1.content.badge ? `<div class="stage-badge" data-json-path="stage1_welcome.content.badge">${s1.content.badge}</div>` : ''}
            <h2 class="stage-heading">
              ${s1.content.groom ? `<span id="groomNameText" data-json-path="stage1_welcome.content.groom">${s1.content.groom}</span>` : ''}
              <span class="font-script" style="color: var(--theme-accent); font-size: 1.4em; vertical-align: middle; margin: 0 0.15em;">&amp;</span>
              ${s1.content.bride ? `<span id="brideNameText" data-json-path="stage1_welcome.content.bride">${s1.content.bride}</span>` : ''}
            </h2>
            <div class="ornate-divider">
              <span style="color: var(--theme-accent);">✦</span>
            </div>
            ${s1.content.verse ? `<p class="stage-desc font-script" id="bibleVerseBox" style="font-size: 1.7rem; color: #fff;" data-json-path="stage1_welcome.content.verse">"${s1.content.verse}"</p>` : ''}
            ${s1.content.citation ? `<p class="stage-desc" id="bibleVerseCit" style="font-size: 0.85rem; letter-spacing: 0.1em; color: var(--theme-accent);" data-json-path="stage1_welcome.content.citation">${s1.content.citation}</p>` : ''}
          </div>
        `;
      }

      // Stage 1: Countdown
      const s2 = websiteData.stage2_countdown;
      if (s2 && s2.content) {
        cardsHtml += `
          <div class="stage-card" id="stageCard1">
            ${s2.content.badge ? `<div class="stage-badge" data-json-path="stage2_countdown.content.badge">${s2.content.badge}</div>` : ''}
            <h2 class="stage-heading" id="weddingDateHero" data-json-path="stage2_countdown.content.dateText">${s2.content.dateText || ''}</h2>
            ${s2.content.description ? `<p class="stage-desc" data-json-path="stage2_countdown.content.description">${s2.content.description}</p>` : ''}
            <div class="countdown-grid">
              <div class="countdown-item">
                <div class="countdown-num" id="cdDays">00</div>
                <div class="countdown-label">Days</div>
              </div>
              <div class="countdown-item">
                <div class="countdown-num" id="cdHours">00</div>
                <div class="countdown-label">Hours</div>
              </div>
              <div class="countdown-item">
                <div class="countdown-num" id="cdMinutes">00</div>
                <div class="countdown-label">Mins</div>
              </div>
              <div class="countdown-item">
                <div class="countdown-num" id="cdSeconds">00</div>
                <div class="countdown-label">Secs</div>
              </div>
            </div>
          </div>
        `;
      }

      // Stage 2: Ceremony
      const s3 = websiteData.stage3_ceremony;
      if (s3 && s3.content) {
        cardsHtml += `
          <div class="stage-card" id="stageCard2">
            ${s3.content.badge ? `<div class="stage-badge" data-json-path="stage3_ceremony.content.badge">${s3.content.badge}</div>` : ''}
            <h2 class="stage-heading" data-json-path="stage3_ceremony.content.venue">${s3.content.venue || ''}</h2>
            ${s3.content.time ? `<div class="event-time-pill" data-json-path="stage3_ceremony.content.time"><span>⛪</span> ${s3.content.time}</div>` : ''}
            <p class="stage-desc" style="margin-bottom: 0.8rem;">
              <span data-json-path="stage3_ceremony.content.address">${s3.content.address || ''}</span><br />
              ${s3.content.subtext ? `<span style="font-size: 0.85em; opacity: 0.8;" data-json-path="stage3_ceremony.content.subtext">${s3.content.subtext}</span>` : ''}
            </p>
            <div class="event-btn-row">
              ${s3.content.mapUrl && s3.content.mapLabel ? `<a href="${s3.content.mapUrl}" target="_blank" rel="noopener" class="btn-glass-action" data-json-path="stage3_ceremony.content.mapLabel">${s3.content.mapLabel}</a>` : ''}
              ${s3.content.calendarLabel ? `<button class="btn-glass-action" onclick="addToCalendar('ceremony')" data-json-path="stage3_ceremony.content.calendarLabel">${s3.content.calendarLabel}</button>` : ''}
            </div>
          </div>
        `;
      }

      // Stage 3: Reception
      const s4 = websiteData.stage4_reception;
      if (s4 && s4.content) {
        cardsHtml += `
          <div class="stage-card" id="stageCard3">
            ${s4.content.badge ? `<div class="stage-badge" data-json-path="stage4_reception.content.badge">${s4.content.badge}</div>` : ''}
            <h2 class="stage-heading" data-json-path="stage4_reception.content.venue">${s4.content.venue || ''}</h2>
            ${s4.content.time ? `<div class="event-time-pill" data-json-path="stage4_reception.content.time"><span>🥂</span> ${s4.content.time}</div>` : ''}
            <p class="stage-desc" style="margin-bottom: 0.8rem;">
              <span data-json-path="stage4_reception.content.address">${s4.content.address || ''}</span><br />
              ${s4.content.subtext ? `<span style="font-size: 0.85em; opacity: 0.8;" data-json-path="stage4_reception.content.subtext">${s4.content.subtext}</span>` : ''}
            </p>
            <div class="event-btn-row">
              ${s4.content.mapUrl && s4.content.mapLabel ? `<a href="${s4.content.mapUrl}" target="_blank" rel="noopener" class="btn-glass-action" data-json-path="stage4_reception.content.mapLabel">${s4.content.mapLabel}</a>` : ''}
              ${s4.content.calendarLabel ? `<button class="btn-glass-action" onclick="addToCalendar('reception')" data-json-path="stage4_reception.content.calendarLabel">${s4.content.calendarLabel}</button>` : ''}
            </div>
          </div>
        `;
      }

      // Stage 4: Story
      const s5 = websiteData.stage5_story;
      if (s5 && Array.isArray(s5.content)) {
        let storyChips = '';
        s5.content.forEach((item, idx) => {
          if (!item) return;
          storyChips += `
            <div class="story-chip" data-json-path="stage5_story.content[${idx}]">
              ${item.year ? `<div class="story-chip-yr" data-json-path="stage5_story.content[${idx}].year">${item.year}</div>` : ''}
              ${item.title ? `<div class="story-chip-title" data-json-path="stage5_story.content[${idx}].title">${item.title}</div>` : ''}
              ${item.description ? `<p class="story-chip-desc" data-json-path="stage5_story.content[${idx}].description">${item.description}</p>` : ''}
            </div>
          `;
        });
        cardsHtml += `
          <div class="stage-card" id="stageCard4" style="justify-content: center; text-align: center;">
            <div class="stage-badge">Our Journey</div>
            <h2 class="stage-heading" style="font-size: clamp(1.5rem, 3.2vw, 2.2rem);">A Story of Grace</h2>
            <div class="story-chips-grid">
              ${storyChips}
            </div>
          </div>
        `;
      }

      // Stage 5: RSVP
      const s6 = websiteData.stage6_rsvp;
      if (s6 && s6.content) {
        cardsHtml += `
          <div class="stage-card" id="stageCard5">
            ${s6.content.badge ? `<div class="stage-badge" data-json-path="stage6_rsvp.content.badge">${s6.content.badge}</div>` : ''}
            ${s6.content.heading ? `<h2 class="stage-heading" style="font-size: clamp(1.5rem, 3.2vw, 2.2rem);" data-json-path="stage6_rsvp.content.heading">${s6.content.heading}</h2>` : ''}
            
            <form class="rsvp-mini-form" onsubmit="handleRsvpSubmit(event)">
              <div class="form-mini-row">
                <input class="input-glass" type="text" id="rsvpName" placeholder="Your Name(s) *" required />
                <select class="input-glass" id="rsvpAttendance" required>
                  <option value="attending">Joyfully Attending</option>
                  <option value="declining">Regretfully Declining</option>
                </select>
              </div>
              <button type="submit" class="btn-submit-gold" data-json-path="stage6_rsvp.content.buttonLabel">
                ${s6.content.buttonLabel || 'Submit'}
              </button>
            </form>

            <div class="registry-mini-strip">
              ${s6.content.registryHeading ? `<span data-json-path="stage6_rsvp.content.registryHeading">${s6.content.registryHeading}</span>` : ''}
              ${s6.content.bankAccount && s6.content.copyLabel ? `
                <button class="btn-glass-action" style="padding: 4px 12px; font-size: 0.68rem;"
                  onclick="copyToClipboard('${s6.content.bankAccount}', this)" data-json-path="stage6_rsvp.content.copyLabel">
                  ${s6.content.copyLabel}
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }

      return `<div class="stage-content-wrap" id="stageContentWrap">${cardsHtml}</div>`;
    }

    function renderWalkEngine() {
      const section = websiteData.walkEngine;
      if (!section || !section.content) return '';
      const c = section.content;

      return `
        <div class="fixed-stage" id="fixedStage">
          ${c.backdropUrl ? `<div class="sanctuary-bg" id="sanctuaryBg" style="background-image: url('${c.backdropUrl}')" data-json-path="walkEngine.content.backdropUrl"></div>` : '<div class="sanctuary-bg" id="sanctuaryBg"></div>'}
          <div class="sanctuary-overlay"></div>
          <div class="sanctuary-rays" id="sanctuaryRays"></div>

          <canvas id="particleCanvas"></canvas>

          ${c.scrollHint ? `<div class="scroll-hint-chip" id="scrollHintChip">
            <span class="pulse-dot"></span> <span data-json-path="walkEngine.content.scrollHint">${c.scrollHint}</span>
          </div>` : ''}

          <div class="couple-stage-wrap">
            <div class="couple-ground-shadow"></div>
            ${c.firstFrame ? `<img src="${c.firstFrame}" id="firstFrameImg" class="couple-frame-image" data-json-path="walkEngine.content.firstFrame" />` : ''}
            ${c.videoUrl ? `<video id="walkVideo" class="couple-video-layer" src="${c.videoUrl}" playsinline muted preload="auto" disableRemotePlayback data-json-path="walkEngine.content.videoUrl"></video>` : ''}
            ${c.lastFrame ? `<img src="${c.lastFrame}" id="lastFrameImg" class="couple-frame-image" data-json-path="walkEngine.content.lastFrame" />` : ''}
          </div>

          ${renderStageCards()}
        </div>
      `;
    }

    function renderRsvpModal() {
      return `
        <div class="rsvp-success-modal" id="rsvpSuccessModal">
          <div class="rsvp-success-card">
            <div style="font-size: 2.8rem; color: var(--theme-accent); margin-bottom: 0.8rem;">✨ ✝ ✨</div>
            <h3 style="font-family: var(--font-serif); font-size: 1.9rem; color: #ffffff; margin-bottom: 0.5rem;">
              Praise God!
            </h3>
            <p style="color: var(--theme-text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;" id="rsvpSuccessMsg">
              Your RSVP has been joyfully received. We eagerly look forward to celebrating God's blessing with you!
            </p>
            <button class="btn-submit-gold" style="width: auto; padding: 10px 32px;" onclick="closeRsvpSuccess()">
              Close
            </button>
          </div>
        </div>
      `;
    }

    /* ==========================================================================
       4. MASTER RENDERER & INITIALIZATION
       ========================================================================== */
    function renderDataAll(data) {
      if (data) {
        websiteData = data;
      }
      
      applyActiveTheme();

      let html = '';
      html += renderOpening();
      html += renderAudio();
      html += renderWalkControls();
      html += renderWalkEngine();
      html += renderRsvpModal();

      document.getElementById("parent").innerHTML = html;

      // Re-initialize DOM components after innerHTML clears event listeners
      initializeComponents();
    }

    /* ==========================================================================
       5. ENGINE LOGIC & EVENT BINDINGS
       ========================================================================== */
    let walkVideo, firstFrameImg, lastFrameImg, sanctuaryBg, sanctuaryRays;
    let timelineFill, timelineTimeLabel, scrollHintChip;
    let weddingAudio, openingScreen, btnOpenInvitation;
    
    let targetProgress = 0;
    let currentProgress = 0;
    let currentActiveStage = 0;
    let isAutoWalking = false;
    let isTicking = false;
    let isRendering = false;
    let engineStarted = false;
    
    // Canvas vars
    let canvas, ctx;
    let particles = [];
    let canvasAnimFrame = null;

    function initializeComponents() {
      walkVideo = document.getElementById("walkVideo");
      firstFrameImg = document.getElementById("firstFrameImg");
      lastFrameImg = document.getElementById("lastFrameImg");
      sanctuaryBg = document.getElementById("sanctuaryBg");
      sanctuaryRays = document.getElementById("sanctuaryRays");
      timelineFill = document.getElementById("timelineFill");
      timelineTimeLabel = document.getElementById("timelineTimeLabel");
      scrollHintChip = document.getElementById("scrollHintChip");
      weddingAudio = document.getElementById("weddingAudio");
      openingScreen = document.getElementById("openingScreen");
      btnOpenInvitation = document.getElementById("btnOpenInvitation");

      // Bind Curtain Logic
      if (btnOpenInvitation) {
        btnOpenInvitation.addEventListener("click", () => {
          if (!openingScreen) return;
          try {
            weddingAudio.play().then(() => {
              const bars = document.getElementById("soundBars");
              if (bars) bars.classList.add("playing");
              const lbl = document.getElementById("audioLabel");
              if (lbl) lbl.textContent = "Pause";
            }).catch(e => console.log("Audio autoplay prevented"));
          } catch(e) {}
          
          openingScreen.classList.add("opening");
          document.body.style.overflow = "hidden";
          setTimeout(() => {
            openingScreen.classList.add("is-open");
            document.body.style.overflow = "";
          }, 1300);
        });
      }

      // Audio toggle
      const audioToggleBtn = document.getElementById("audioToggleBtn");
      if (audioToggleBtn && weddingAudio) {
        audioToggleBtn.addEventListener("click", () => {
          if (weddingAudio.paused) {
            weddingAudio.play();
            document.getElementById("soundBars").classList.add("playing");
            document.getElementById("audioLabel").textContent = "Pause";
          } else {
            weddingAudio.pause();
            document.getElementById("soundBars").classList.remove("playing");
            document.getElementById("audioLabel").textContent = "Music";
          }
        });
      }

      // Auto Walk
      const btnAutoWalk = document.getElementById("btnAutoWalk");
      if (btnAutoWalk) {
        btnAutoWalk.addEventListener("click", () => {
          if (isAutoWalking) stopAutoWalk();
          else startAutoWalk();
        });
      }

      // Start the core engines once
      if (!engineStarted) {
        engineStarted = true;
        
        window.addEventListener("scroll", () => {
          if (!isTicking) {
            requestAnimationFrame(() => {
              targetProgress = getNormalizedScroll();
              if (!isRendering) {
                isRendering = true;
                lastRenderTime = performance.now();
                requestAnimationFrame(renderVideoFrame);
              }
              isTicking = false;
            });
            isTicking = true;
          }
        }, { passive: true });
        
        window.addEventListener("wheel", () => { if (isAutoWalking) stopAutoWalk(); }, { passive: true });
        window.addEventListener("touchstart", () => { if (isAutoWalking) stopAutoWalk(); }, { passive: true });

        // Start video loop
        isRendering = true;
        requestAnimationFrame(renderVideoFrame);
      }
      
      // Initialize Canvas
      canvas = document.getElementById("particleCanvas");
      if (canvas) {
        ctx = canvas.getContext("2d");
        window.removeEventListener("resize", resizeCanvas);
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        particles = [];
        for (let i = 0; i < 40; i++) particles.push(new Particle());
        if (canvasAnimFrame) cancelAnimationFrame(canvasAnimFrame);
        animateParticles();
      }
      
      updateCountdown();
    }

    /* Core video engine logic */
    const VIDEO_DURATION = 10.0;
    const NUM_STAGES = 6;
    let lastRenderTime = performance.now();

    function getNormalizedScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.max(0, Math.min(1, window.scrollY / scrollable));
    }

    function renderVideoFrame(now) {
      if (!isRendering) return;
      if (!now) now = performance.now();
      const dt = Math.min(now - lastRenderTime, 32);
      lastRenderTime = now;

      const diff = targetProgress - currentProgress;
      currentProgress += diff * (dt * 0.005);
      const p = Math.max(0, Math.min(1, currentProgress));

      if (walkVideo) {
        const duration = walkVideo.duration || VIDEO_DURATION;
        const targetTime = p * duration;
        if (!walkVideo.seeking && Math.abs(walkVideo.currentTime - targetTime) > 0.08) {
          walkVideo.currentTime = targetTime;
        }
      }

      if (firstFrameImg && lastFrameImg) {
        if (p <= 0.015) {
          firstFrameImg.style.opacity = "1";
          lastFrameImg.style.opacity = "0";
        } else if (p >= 0.97) {
          firstFrameImg.style.opacity = "0";
          lastFrameImg.style.opacity = "1";
        } else {
          firstFrameImg.style.opacity = "0";
          lastFrameImg.style.opacity = "0";
        }
      }

      if (sanctuaryBg) {
        const bgScale = 1.0 + p * 0.06;
        sanctuaryBg.style.transform = `scale(${bgScale}) translateZ(0)`;
      }

      if (sanctuaryRays) {
        sanctuaryRays.style.opacity = 0.4 + Math.sin(p * Math.PI) * 0.45;
      }

      updateStageCards(p);

      if (timelineFill) {
        timelineFill.style.transform = `scaleX(${p})`;
      }
      if (timelineTimeLabel) {
        const currentSec = (p * 10).toFixed(1);
        timelineTimeLabel.textContent = `0:${currentSec < 10 ? '0' : ''}${Math.floor(currentSec)} / 0:10`;
      }
      
      if (scrollHintChip) {
        scrollHintChip.style.opacity = p > 0.04 ? "0.3" : "1";
      }

      if (Math.abs(diff) < 0.0005 && !isAutoWalking) {
        currentProgress = targetProgress;
        isRendering = false;
        return;
      }

      requestAnimationFrame(renderVideoFrame);
    }

    function updateStageCards(p) {
      let activeIndex = 0;
      if (p < 0.16) activeIndex = 0;
      else if (p < 0.34) activeIndex = 1;
      else if (p < 0.52) activeIndex = 2;
      else if (p < 0.70) activeIndex = 3;
      else if (p < 0.86) activeIndex = 4;
      else activeIndex = 5;

      if (activeIndex !== currentActiveStage) {
        currentActiveStage = activeIndex;
        for (let i = 0; i < NUM_STAGES; i++) {
          const card = document.getElementById(`stageCard${i}`);
          if (card) {
            if (i === activeIndex) card.classList.add("active");
            else card.classList.remove("active");
          }
        }
        const dotItems = document.querySelectorAll(".nav-dot-item");
        dotItems.forEach((dot, idx) => {
          if (idx === activeIndex) dot.classList.add("active");
          else dot.classList.remove("active");
        });
      }
    }

    function jumpToStage(stageIndex) {
      if (isAutoWalking) stopAutoWalk();
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (stageIndex / (NUM_STAGES - 1)) * scrollable;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }

    function startAutoWalk() {
      isAutoWalking = true;
      const btn = document.getElementById("btnAutoWalk");
      if (btn) btn.innerHTML = "<span>⏸</span> Pause Walk";
      
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const startScroll = window.scrollY;
      const targetScroll = scrollable;
      const startTime = performance.now();
      const duration = 14000;

      function step(now) {
        if (!isAutoWalking) return;
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        const easeP = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        window.scrollTo(0, startScroll + (targetScroll - startScroll) * easeP);
        if (p < 1) requestAnimationFrame(step);
        else stopAutoWalk();
      }
      requestAnimationFrame(step);
    }

    function stopAutoWalk() {
      isAutoWalking = false;
      const btn = document.getElementById("btnAutoWalk");
      if (btn) btn.innerHTML = "<span>▶</span> Auto Walk";
    }
    
    /* Particles logic */
    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.type = Math.random() > 0.4 ? "petal" : "ember";
        this.x = Math.random() * (canvas ? canvas.width : 1000);
        this.y = initial ? Math.random() * (canvas ? canvas.height : 1000) : -20;
        this.size = this.type === "petal" ? 5 + Math.random() * 7 : 1.5 + Math.random() * 2.5;
        this.speedY = 0.5 + Math.random() * 1.1;
        this.speedX = (Math.random() - 0.5) * 0.7;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = this.type === "petal" ? 0.35 + Math.random() * 0.4 : 0.4 + Math.random() * 0.5;
      }
      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.01) * 0.5 + this.speedX;
        this.rotation += this.rotSpeed;
        if (canvas && this.y > canvas.height + 20) this.reset(false);
      }
      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (this.type === "petal") {
          ctx.fillStyle = `rgba(255, 250, 240, ${this.opacity})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(232, 207, 141, ${this.opacity})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(201, 164, 76, 0.8)";
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    function animateParticles() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      canvasAnimFrame = requestAnimationFrame(animateParticles);
    }
    
    function updateCountdown() {
      if (!websiteData.stage2_countdown || !websiteData.stage2_countdown.content) return;
      const target = new Date(websiteData.stage2_countdown.content.targetDate || "2026-12-20T14:30:00").getTime();
      const now = new Date().getTime();
      const difference = target - now;

      const eDays = document.getElementById("cdDays");
      const eHours = document.getElementById("cdHours");
      const eMins = document.getElementById("cdMinutes");
      const eSecs = document.getElementById("cdSeconds");
      
      if (!eDays) return;

      if (difference <= 0) {
        eDays.textContent = "00"; eHours.textContent = "00"; eMins.textContent = "00"; eSecs.textContent = "00";
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      eDays.textContent = String(days).padStart(2, "0");
      eHours.textContent = String(hours).padStart(2, "0");
      eMins.textContent = String(minutes).padStart(2, "0");
      eSecs.textContent = String(seconds).padStart(2, "0");
    }
    setInterval(updateCountdown, 1000);

    /* RSVP & Copy helpers */
    function handleRsvpSubmit(e) {
      e.preventDefault();
      const name = document.getElementById("rsvpName").value;
      const attendance = document.getElementById("rsvpAttendance").value;
      const successModal = document.getElementById("rsvpSuccessModal");
      const successMsg = document.getElementById("rsvpSuccessMsg");
      if (attendance === "attending") {
        successMsg.innerHTML = `Dear <strong>${name}</strong>,<br>Thank you so much! Your attendance has been joyfully recorded. We look forward to celebrating God's blessing together!`;
      } else {
        successMsg.innerHTML = `Dear <strong>${name}</strong>,<br>Thank you for letting us know. You will be dearly remembered in our prayers!`;
      }
      if (successModal) successModal.classList.add("active");
    }

    function closeRsvpSuccess() {
      const modal = document.getElementById("rsvpSuccessModal");
      if (modal) modal.classList.remove("active");
    }

    function copyToClipboard(text, btnElement) {
      navigator.clipboard.writeText(text).then(() => {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = "✓ Copied!";
        btnElement.style.background = "var(--theme-accent)";
        btnElement.style.color = "var(--theme-primary-deep)";
        setTimeout(() => {
          btnElement.innerHTML = originalText;
          btnElement.style.background = "";
          btnElement.style.color = "";
        }, 2000);
      }).catch(err => console.error("Copy failed", err));
    }

    function addToCalendar(eventType) {
      const isCeremony = eventType === 'ceremony';
      const title = isCeremony ? "Jonathan & Sarah's Holy Matrimony Ceremony" : "Jonathan & Sarah's Wedding Reception";
      const start = isCeremony ? "20261220T143000" : "20261220T180000";
      const end = isCeremony ? "20261220T160000" : "20261220T230000";
      const location = isCeremony ? "St. Peter's Cathedral, 100 Cathedral Way, San Francisco, CA" : "The Grand Crystal Conservatory, 450 Garden Promenade, San Francisco, CA";
      const desc = "You are warmly invited to celebrate the holy matrimony of Jonathan & Sarah.";

      const icsData = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
        `SUMMARY:${title}`, `DESCRIPTION:${desc}`, `LOCATION:${location}`,
        `DTSTART:${start}`, `DTEND:${end}`, "STATUS:CONFIRMED",
        "END:VEVENT", "END:VCALENDAR"
      ].join("\\n");

      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `jonathan-sarah-${eventType}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    /* ==========================================================================
       6. LIVE UPDATES & INIT
       ========================================================================== */
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "UPDATE_DATA") {
        renderDataAll(event.data.data);
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
      renderDataAll();
    });

  </script>
</body>
</html>
"""

with open("public/templates/christian/index.html", "w") as f:
    f.write(html_template)
