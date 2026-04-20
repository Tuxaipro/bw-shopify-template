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

  /* ───────────── 4. IntersectionObserver reveals ─────────────
     Safety principle: never hide anything unless we are certain JS can
     observe it. If IntersectionObserver isn't available, mark everything
     visible immediately. Also apply a 2s safety timeout that forces
     reveal on any still-hidden card, so the page never stays blank. */
  const initReveals = () => {
    const hasIO = 'IntersectionObserver' in window;

    // Collect product/collection card containers by ANY of the common
    // markers Shopify themes expose. Cast a wide net.
    const cardContainers = document.querySelectorAll(
      '.resource-list, .product-grid, .collection-list, ' +
        'product-list-component, collection-list-component, ' +
        '[class*="product-list"] ul, [class*="collection-list"] ul'
    );

    const observedItems = [];

    cardContainers.forEach((container) => {
      const items = container.querySelectorAll(
        '.resource-list__item, .grid__item, li.product-card, li'
      );
      items.forEach((el, i) => {
        // Only tag genuine card-like children (skip headers/buttons/etc.)
        if (
          !el.matches(
            '.resource-list__item, .grid__item, li.product-card, ' +
              'li:has(product-card), li:has(.product-card), ' +
              'li:has(.card-product), li:has([class*="collection-card"])'
          )
        ) {
          return;
        }
        el.style.setProperty('--bw-index', i % 8); // cap stagger at 8
        el.setAttribute('data-bw-card-reveal', '');
        observedItems.push(el);
      });
    });

    // Observe utility-level [data-bw-reveal] elements + the card items.
    const utilityEls = document.querySelectorAll('[data-bw-reveal]');

    // Fallback: no IntersectionObserver → reveal everything now.
    if (!hasIO) {
      utilityEls.forEach((el) => el.setAttribute('data-bw-in', '1'));
      observedItems.forEach((el) => el.setAttribute('data-bw-in', '1'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute('data-bw-in', '1');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    utilityEls.forEach((el) => io.observe(el));
    observedItems.forEach((el) => io.observe(el));

    // Auto-tag hook headings + custom editorial blocks as reveals too.
    document
      .querySelectorAll(
        '.breezy-fabric-story, .breezy-pullquote, .breezy-newsletter, ' +
          '.breezy-usp-strip, .breezy-insta-grid, .breezy-pdp-trust, ' +
          '.product-list h2, .product-list h3, .collection-list h2'
      )
      .forEach((el) => {
        if (!el.hasAttribute('data-bw-reveal')) {
          el.setAttribute('data-bw-reveal', '');
          io.observe(el);
        }
      });

    // Safety net: after 2 seconds, force-reveal anything still hidden
    // (e.g. items that were already in-viewport before the observer
    // attached, or observer edge cases in older browsers).
    setTimeout(() => {
      document
        .querySelectorAll(
          '[data-bw-reveal]:not([data-bw-in="1"]), ' +
            '[data-bw-card-reveal]:not([data-bw-in="1"])'
        )
        .forEach((el) => el.setAttribute('data-bw-in', '1'));
    }, 2000);

    // Belt-and-suspenders: immediately reveal any card already in viewport
    // at init time (covers initial above-the-fold content).
    requestAnimationFrame(() => {
      [...utilityEls, ...observedItems].forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.setAttribute('data-bw-in', '1');
          io.unobserve(el);
        }
      });
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

  /* ───────────── Product card DOM relocation ─────────────
     The product-card snippet injects four helper nodes as direct children
     of <product-card>: .bw-card-overlay, .bw-card-meta, .bw-card-rating,
     .bw-card-swatches. We relocate them into their correct visual homes:
       - .bw-card-overlay  → into the media well (.product-card__media / .card-gallery)
       - .bw-card-meta, .bw-card-rating, .bw-card-swatches → inside .product-card__content
     This is idempotent: we bail if the node is already in the right parent.
  */
  const initProductCards = () => {
    const cards = document.querySelectorAll('product-card, .product-card, .card-product');
    cards.forEach((card) => {
      if (card.dataset.bwEnhanced === '1') return;

      const media =
        card.querySelector('.product-card__media') ||
        card.querySelector('.card-gallery') ||
        card.querySelector('[class*="card-gallery"]') ||
        card.querySelector('[class*="product-card__media"]');

      const content =
        card.querySelector('.product-card__content') ||
        card.querySelector('.card-product__content') ||
        card.querySelector('[class*="product-card__content"]');

      // Relocate overlay into media well
      const overlay = card.querySelector(':scope > .bw-card-overlay');
      if (overlay && media && overlay.parentElement !== media) {
        media.appendChild(overlay);
      }

      // Relocate meta / rating / swatches into content area (appended in order)
      if (content) {
        [
          ':scope > .bw-card-meta',
          ':scope > .bw-card-rating',
          ':scope > .bw-card-swatches',
        ].forEach((sel) => {
          const node = card.querySelector(sel);
          if (node && node.parentElement !== content) {
            content.appendChild(node);
          }
        });
      }

      card.dataset.bwEnhanced = '1';
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
    try { initProductCards(); } catch (e) { console.warn('[bw] product cards', e); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Re-init reveals, card enhancements, and wishlist state after Shopify section re-renders
  document.addEventListener('shopify:section:load', () => {
    try { initReveals(); } catch (e) { /* noop */ }
    try { initProductCards(); } catch (e) { /* noop */ }
    try {
      const wishlist = loadWishlist();
      document.querySelectorAll('.bw-wishlist-btn').forEach((btn) => {
        const id = btn.dataset.productId;
        if (id && wishlist.has(id)) btn.setAttribute('aria-pressed', 'true');
      });
    } catch (e) { /* noop */ }
  });
})();
