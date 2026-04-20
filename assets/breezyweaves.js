/**
 * Breezyweaves — cinematic interaction layer.
 *
 * Responsibilities (all no-dep, no-framework, GPU-safe):
 *   1. Header shrink on scroll                     → body[data-bw-scrolled]
 *   2. Top scroll-progress bar                     → .bw-scroll-progress
 *   3. Hero parallax + gentle zoom scrub           → --bw-hero-scale / --bw-hero-shift
 *   4. IntersectionObserver reveals                → [data-bw-reveal], product grids
 *   5. Magnetic CTAs                               → [data-bw-magnet]
 *   6. Wishlist toggle (localStorage)              → .bw-wishlist-btn
 *   7. Free-shipping progress bar                  → [data-bw-free-ship-target]
 *   8. Sticky mobile ATC visibility                → body[data-bw-atc-visible]
 *   9. Announcement-bar marquee pause on hover
 *  10. Respect prefers-reduced-motion + pointer:coarse
 *
 * No external libraries. Loaded as a module via theme.liquid.
 */
(() => {
  'use strict';

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COARSE = window.matchMedia('(pointer: coarse)').matches;

  const raf = window.requestAnimationFrame || ((cb) => setTimeout(cb, 16));

  /* ───────────── 1. Header shrink on scroll ───────────── */
  const initHeaderScroll = () => {
    let lastY = -1;
    let ticking = false;
    const update = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      if (Math.abs(y - lastY) > 2) {
        document.body.dataset.bwScrolled = y > 24 ? '1' : '0';
        lastY = y;
      }
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          raf(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  };

  /* ───────────── 2. Scroll-progress bar ───────────── */
  const initScrollProgress = () => {
    const bar = document.createElement('div');
    bar.className = 'bw-scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      bar.style.setProperty('--bw-progress', pct.toFixed(2) + '%');
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          raf(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  };

  /* ───────────── 3. Hero parallax + zoom ───────────── */
  const initHeroParallax = () => {
    if (REDUCE) return;
    const heroes = document.querySelectorAll('.hero');
    if (!heroes.length) return;
    let ticking = false;
    const update = () => {
      heroes.forEach((hero) => {
        const rect = hero.getBoundingClientRect();
        // Only animate if hero is in/near viewport
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const progress = Math.min(
          1,
          Math.max(0, 1 - rect.bottom / (window.innerHeight + rect.height))
        );
        // Shift: up to -12% of its height (slow)
        const shift = -(progress * rect.height * 0.12);
        // Zoom: 1.02 → 1.09 across the hero
        const scale = 1.02 + progress * 0.07;
        hero.style.setProperty('--bw-hero-shift', shift.toFixed(1) + 'px');
        hero.style.setProperty('--bw-hero-scale', scale.toFixed(3));
      });
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          raf(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', update, { passive: true });
    update();
  };

  /* ───────────── 4. IntersectionObserver reveals ───────────── */
  const initReveals = () => {
    // Auto-tag product grids & collection lists
    document
      .querySelectorAll(
        '[data-section-type*="product-list"], ' +
          '[data-section-type*="collection-list"], ' +
          '[data-section-type*="featured-product"], ' +
          '.product-grid, .collection-list, .resource-list'
      )
      .forEach((section) => {
        const items = section.querySelectorAll(
          '.resource-list__item, .grid__item'
        );
        items.forEach((el, i) => {
          el.style.setProperty('--bw-index', i);
        });
        section.dataset.bwReveal = section.dataset.bwReveal || 'grid';
      });

    if (!('IntersectionObserver' in window)) {
      document
        .querySelectorAll('[data-bw-reveal]')
        .forEach((el) => el.setAttribute('data-bw-in', '1'));
      document
        .querySelectorAll('[data-bw-reveal="grid"]')
        .forEach((el) => el.setAttribute('data-bw-revealed', '1'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.dataset.bwReveal === 'grid') {
            el.setAttribute('data-bw-revealed', '1');
          } else {
            el.setAttribute('data-bw-in', '1');
          }
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    document
      .querySelectorAll('[data-bw-reveal]')
      .forEach((el) => io.observe(el));

    // Auto-tag headings in product-list / collection-list sections
    document
      .querySelectorAll(
        '[data-section-type*="product-list"] h2, ' +
          '[data-section-type*="product-list"] h3, ' +
          '[data-section-type*="collection-list"] h2, ' +
          '.breezy-fabric-story, .breezy-pullquote, .breezy-newsletter, ' +
          '.breezy-usp-strip, .breezy-insta-grid, .breezy-pdp-trust'
      )
      .forEach((el) => {
        if (!el.hasAttribute('data-bw-reveal')) {
          el.setAttribute('data-bw-reveal', '');
          io.observe(el);
        }
      });
  };

  /* ───────────── 5. Magnetic CTAs ───────────── */
  const initMagnetic = () => {
    if (REDUCE || COARSE) return;
    // Auto-tag hero primary buttons + add-to-cart buttons
    const autoTargets = document.querySelectorAll(
      '.hero .button--primary, .hero button.button, ' +
        '.breezy-cta, .breezy-newsletter button, ' +
        '.product-form__submit'
    );
    autoTargets.forEach((el) => el.setAttribute('data-bw-magnet', ''));

    const magnets = document.querySelectorAll('[data-bw-magnet]');
    magnets.forEach((el) => {
      let rect;
      const strength = 12;
      const onEnter = () => {
        rect = el.getBoundingClientRect();
      };
      const onMove = (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        el.style.setProperty('--bw-mx', dx * strength + 'px');
        el.style.setProperty('--bw-my', dy * strength + 'px');
      };
      const onLeave = () => {
        el.style.setProperty('--bw-mx', '0px');
        el.style.setProperty('--bw-my', '0px');
      };
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    });
  };

  /* ───────────── 6. Wishlist (localStorage) ───────────── */
  const WISHLIST_KEY = 'bw:wishlist';
  const loadWishlist = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'));
    } catch (e) {
      return new Set();
    }
  };
  const saveWishlist = (set) => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify([...set]));
    } catch (e) {
      /* quota / private mode */
    }
  };

  const updateWishlistBadge = (size) => {
    const badges = document.querySelectorAll(
      '[data-bw-wishlist-count], .wishlist-bubble'
    );
    badges.forEach((b) => {
      b.textContent = size > 0 ? size : '';
      b.style.display = size > 0 ? '' : 'none';
    });
  };

  const initWishlist = () => {
    const wishlist = loadWishlist();
    updateWishlistBadge(wishlist.size);

    // Mark existing wishlist buttons with stored state
    document.querySelectorAll('.bw-wishlist-btn').forEach((btn) => {
      const id = btn.dataset.productId;
      if (id && wishlist.has(id)) btn.setAttribute('aria-pressed', 'true');
    });

    // Delegated click handler (works for dynamically loaded cards)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.bw-wishlist-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.productId;
      if (!id) return;
      const set = loadWishlist();
      if (set.has(id)) {
        set.delete(id);
        btn.setAttribute('aria-pressed', 'false');
      } else {
        set.add(id);
        btn.setAttribute('aria-pressed', 'true');
      }
      saveWishlist(set);
      updateWishlistBadge(set.size);
    });
  };

  /* ───────────── 7. Free-shipping progress ───────────── */
  const initFreeShip = () => {
    const els = document.querySelectorAll('[data-bw-free-ship]');
    if (!els.length) return;
    const update = () => {
      els.forEach((el) => {
        const target = parseFloat(el.dataset.bwFreeShip || '100');
        const current = parseFloat(el.dataset.bwCurrent || '0');
        const pct = Math.min(100, Math.max(0, (current / target) * 100));
        const fill = el.querySelector('.bw-free-ship__fill');
        if (fill) fill.style.setProperty('--bw-free-ship-progress', pct + '%');
        const msg = el.querySelector('[data-bw-free-ship-msg]');
        if (msg) {
          const remaining = Math.max(0, target - current);
          msg.textContent =
            remaining <= 0
              ? '✨ You qualify for free US shipping!'
              : `You’re $${remaining.toFixed(2)} away from free shipping`;
        }
      });
    };
    update();
    document.addEventListener('cart:updated', update);
    document.addEventListener('bw:cart-updated', update);
  };

  /* ───────────── 8. Sticky mobile ATC ───────────── */
  const initStickyATC = () => {
    const pdp = document.querySelector('.template-product, main-product-component, .product');
    if (!pdp) return;
    const atc = document.querySelector(
      '.template-product .product-form__submit, .product-form__submit'
    );
    if (!atc) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          document.body.dataset.bwAtcVisible = entry.isIntersecting ? '0' : '1';
        });
      },
      { threshold: 0.1 }
    );
    io.observe(atc);
  };

  /* ───────────── 9. Announcement-bar marquee pause on hover ───────────── */
  const initAnnouncementHover = () => {
    const bar = document.querySelector('.announcement-bar');
    if (!bar) return;
    bar.addEventListener('pointerenter', () => {
      bar.style.animationPlayState = 'paused';
    });
    bar.addEventListener('pointerleave', () => {
      bar.style.animationPlayState = '';
    });
  };

  /* ───────────── Init ───────────── */
  const boot = () => {
    try { initHeaderScroll(); } catch (e) { console.warn('[bw] header scroll', e); }
    try { initScrollProgress(); } catch (e) { console.warn('[bw] scroll progress', e); }
    try { initHeroParallax(); } catch (e) { console.warn('[bw] hero parallax', e); }
    try { initReveals(); } catch (e) { console.warn('[bw] reveals', e); }
    try { initMagnetic(); } catch (e) { console.warn('[bw] magnet', e); }
    try { initWishlist(); } catch (e) { console.warn('[bw] wishlist', e); }
    try { initFreeShip(); } catch (e) { console.warn('[bw] free ship', e); }
    try { initStickyATC(); } catch (e) { console.warn('[bw] sticky atc', e); }
    try { initAnnouncementHover(); } catch (e) { console.warn('[bw] announcement', e); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Re-init reveals and wishlist state after Shopify section re-renders
  document.addEventListener('shopify:section:load', () => {
    try { initReveals(); } catch (e) { /* noop */ }
    try {
      const wishlist = loadWishlist();
      document.querySelectorAll('.bw-wishlist-btn').forEach((btn) => {
        const id = btn.dataset.productId;
        if (id && wishlist.has(id)) btn.setAttribute('aria-pressed', 'true');
      });
    } catch (e) { /* noop */ }
  });
})();
