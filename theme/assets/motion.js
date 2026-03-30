/* =============================================
   ALL IS WELL — MOTION SYSTEM v2
   Lenis smooth scroll + GSAP ScrollTrigger
   Tokens: /assets/base.css  (:root variables)
   ============================================= */

(function () {
  'use strict';

  /* ── Guard: Respect user's reduced-motion preference ── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    /* Still init non-animation modules (accordions, swatches, etc.) */
    _initNonAnimationModules();
    /* Ensure CSS-hidden elements become visible without transition */
    document.querySelectorAll(
      '.reveal, .slide-left, .slide-right, .scale-up, .fade-in, .stagger'
    ).forEach(el => el.classList.add('visible'));
    return;
  }

  /* ── Design-token mirrors (match base.css :root) ── */
  const TOKEN = {
    easeOutExpo : 'power4.out',   // ≈ cubic-bezier(0.16, 1, 0.3, 1)
    easeSmooth  : 'power3.out',
    durationFast: 0.3,
    durationMed : 0.5,
    durationSlow: 0.8,
  };

  const MOBILE_BREAKPOINT = 768;
  const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

  /* =============================================
     1. GSAP — Register ScrollTrigger plugin
     ============================================= */
  function _initScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
  }

  /* =============================================
     2. LENIS — Smooth scroll
        Lenis RAF is driven by GSAP's ticker so
        ScrollTrigger always reads accurate scroll pos.
     ============================================= */
  function _initLenis() {
    if (typeof Lenis === 'undefined') return null;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    const lenis = new Lenis({
      duration        : isTouch ? 1.0 : 1.2,
      easing          : t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      orientation     : 'vertical',
      smoothWheel     : !isTouch,   // wheel smoothing on desktop only
      syncTouch       : isTouch,    // sync with native iOS momentum — no fighting
      touchMultiplier : 1,
      wheelMultiplier : 1,
    });

    /* Disable CSS smooth-scroll to prevent double-smoothing */
    document.documentElement.style.scrollBehavior = 'auto';

    /* Drive Lenis on every GSAP RAF tick */
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* Keep ScrollTrigger in sync with Lenis scroll position */
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    return lenis;
  }

  /* =============================================
     3. HERO ENTRANCE
        Runs after the cinematic opener sweeps away.
        If no opener is present (non-homepage), plays
        immediately with a short delay.
     ============================================= */
  function _initHeroEntrance() {
    if (typeof gsap === 'undefined') return;

    const heroCard = document.querySelector('.hero-card');
    if (!heroCard) return;

    const opener  = document.getElementById('opener');
    const delay   = opener ? 1.6 : 0.3;

    const heading  = heroCard.querySelector('h1');
    const tagline  = heroCard.querySelector('.hero-tagline');
    const location = heroCard.querySelector('.hero-location');

    /* Hand off from CSS-class system → GSAP owns these elements */
    [heading, tagline, location].forEach(el => {
      if (!el) return;
      el.classList.remove('slide-left', 'slide-right', 'fade-in', 'reveal');
      gsap.set(el, { autoAlpha: 0, y: 48 });
    });

    /* Hero card starts slightly small + invisible */
    heroCard.classList.remove('scale-up');
    gsap.set(heroCard, { autoAlpha: 0, scale: 0.97, transformOrigin: 'center center' });

    const tl = gsap.timeline({ delay });

    /* Card fade-in */
    tl.to(heroCard, {
      autoAlpha : 1,
      scale     : 1,
      duration  : TOKEN.durationSlow,
      ease      : TOKEN.easeOutExpo,
    });

    /* Heading slides up */
    if (heading) {
      tl.to(heading, {
        autoAlpha : 1,
        y         : 0,
        duration  : 0.9,
        ease      : TOKEN.easeOutExpo,
      }, '-=0.55');
    }

    /* Tagline follows */
    if (tagline) {
      tl.to(tagline, {
        autoAlpha : 1,
        y         : 0,
        duration  : 0.75,
        ease      : TOKEN.easeSmooth,
      }, '-=0.65');
    }

    /* Location badge */
    if (location) {
      tl.to(location, {
        autoAlpha : 1,
        y         : 0,
        duration  : 0.7,
        ease      : TOKEN.easeSmooth,
      }, '-=0.55');
    }
  }

  /* =============================================
     4. SCROLL REVEALS
        GSAP ScrollTrigger adds `.visible` at the
        right viewport threshold so CSS transitions
        in base.css handle the actual animation.
        Hero children are excluded (handled above).
     ============================================= */
  function _initScrollReveals() {
    if (typeof ScrollTrigger === 'undefined') {
      _initFallbackReveals();
      return;
    }

    const heroCard   = document.querySelector('.hero-card');
    const selectors  = '.reveal, .slide-left, .slide-right, .scale-up, .fade-in, .stagger';

    document.querySelectorAll(selectors).forEach(el => {
      /* Skip hero children — those are owned by _initHeroEntrance */
      if (heroCard && heroCard.contains(el)) return;

      ScrollTrigger.create({
        trigger  : el,
        start    : 'top 88%',
        once     : true,
        onEnter  : () => el.classList.add('visible'),
      });
    });
  }

  /* Fallback when GSAP is unavailable */
  function _initFallbackReveals() {
    const els = document.querySelectorAll(
      '.reveal, .slide-left, .slide-right, .scale-up, .fade-in, .stagger'
    );
    if (!els.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    els.forEach(el => io.observe(el));
  }

  /* =============================================
     5. PARALLAX
        GSAP ScrollTrigger scrub on [data-parallax].
        Disabled on mobile to protect performance.
     ============================================= */
  function _initParallax() {
    if (typeof ScrollTrigger === 'undefined' || isMobile()) return;

    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed   = parseFloat(el.dataset.parallax) || 0.2;
      const trigger = el.closest('[class]') || el;

      gsap.fromTo(el,
        { yPercent: 0 },
        {
          yPercent     : speed * -80,
          ease         : 'none',
          scrollTrigger: {
            trigger,
            start : 'top bottom',
            end   : 'bottom top',
            scrub : true,
          },
        }
      );
    });
  }

  /* =============================================
     6. NAV SCROLL BEHAVIOR
        Adds enhanced depth to .nav-card after the
        user scrolls past the hero zone.
        Style injected here keeps header.liquid clean.
     ============================================= */
  function _initNavScroll() {
    if (typeof ScrollTrigger === 'undefined') return;

    const nav = document.querySelector('.nav-card');
    if (!nav) return;

    /* PDP has its own scroll handler in product-main.liquid — skip here */
    if (document.querySelector('.split-hero')) return;

    /* Inject nav scroll-state styles */
    const style = document.createElement('style');
    style.setAttribute('data-aiw', 'nav-scroll');
    style.textContent = `
      .nav-card {
        transition:
          box-shadow   0.4s ease,
          border-color 0.4s ease;
      }
      .nav-card.nav-scrolled {
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.45),
                    0 2px 12px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.07);
      }
    `;
    document.head.appendChild(style);

    ScrollTrigger.create({
      start   : 'top -100px',
      onUpdate: self => nav.classList.toggle('nav-scrolled', self.progress > 0),
    });
  }

  /* =============================================
     7. ACCORDION TOGGLE
     ============================================= */
  function _initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      const item = header.parentElement;

      header.addEventListener('click', () => item.classList.toggle('open'));

      header.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  /* =============================================
     8. COLOR SWATCH SELECTOR
        Updates the variant label <em> on selection.
     ============================================= */
  function _initColorSwatches() {
    document.querySelectorAll('.color-row, .color-swatches').forEach(container => {
      const swatches = container.querySelectorAll('.color-swatch');
      const label    = container.previousElementSibling?.querySelector('em');

      swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
          swatches.forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
          if (label && swatch.dataset.color) label.textContent = swatch.dataset.color;
        });

        swatch.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            swatch.click();
          }
        });
      });
    });
  }

  /* =============================================
     9. SIZE BUTTON SELECTOR
        Updates the variant label <em> on selection.
     ============================================= */
  function _initSizeButtons() {
    document.querySelectorAll('.size-row, .size-grid').forEach(container => {
      const buttons = container.querySelectorAll('.size-btn');
      const label   = container.previousElementSibling?.querySelector('em');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (label) label.textContent = btn.textContent.trim();
        });
      });
    });
  }

  /* =============================================
     10. ADD TO CART FEEDBACK
         Visual confirmation using --earth token.
     ============================================= */
  function _initATCFeedback() {
    document.querySelectorAll('.btn-primary[data-atc], .atc-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        if (this.disabled) return;
        const orig        = this.textContent.trim();
        this.textContent  = 'Added ✓';
        this.style.background = 'var(--earth)';
        this.style.color      = 'var(--card-bg)';
        setTimeout(() => {
          this.textContent  = orig;
          this.style.background = '';
          this.style.color      = '';
        }, 1600);
      });
    });
  }

  /* =============================================
     11. THUMBNAIL GALLERY
         Click-to-swap main product image.
     ============================================= */
  function _initThumbnails() {
    document.querySelectorAll('.product-gallery__thumb').forEach(thumb => {
      thumb.addEventListener('click', function () {
        const mainImg = document.getElementById('mainProductImage');
        if (mainImg && this.dataset.imageUrl) {
          mainImg.src = this.dataset.imageUrl;
        }
        document.querySelectorAll('.product-gallery__thumb')
          .forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  /* =============================================
     12. CINEMATIC OPENER CLEANUP
         Hides the overlay after its sweep animation.
         Refreshes ScrollTrigger to account for any
         layout shift caused by the overlay removal.
     ============================================= */
  function _initOpener() {
    const opener = document.getElementById('opener');
    if (!opener) return;

    opener.addEventListener('animationend', function (e) {
      if (e.animationName === 'openerSweep') {
        this.style.display = 'none';
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }
    });
  }

  /* =============================================
     NON-ANIMATION MODULES
     Always run regardless of GSAP availability.
     ============================================= */
  function _initNonAnimationModules() {
    _initAccordions();
    _initColorSwatches();
    _initSizeButtons();
    _initATCFeedback();
    _initThumbnails();
    _initOpener();
  }

  /* =============================================
     INIT — Boot sequence
     ============================================= */
  function init() {
    const gsapAvailable = typeof gsap !== 'undefined';

    if (gsapAvailable) {
      _initScrollTrigger();
      window.__lenis = _initLenis();
      _initHeroEntrance();
      _initScrollReveals();
      _initParallax();
      _initNavScroll();
    } else {
      /* Graceful degradation: CSS reveals via IntersectionObserver */
      console.warn('[All Is Well] GSAP unavailable — using IntersectionObserver fallback');
      _initFallbackReveals();
    }

    _initNonAnimationModules();
  }

  /* DOMContentLoaded guard */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
