document.addEventListener('DOMContentLoaded', () => {

  // scroll to hash target or top on page load
  const scrollTarget = sessionStorage.getItem('scrollTo') || (location.hash ? location.hash.slice(1) : null);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  document.documentElement.style.scrollBehavior = 'auto';
  const mainEl = document.querySelector('main');
  if (scrollTarget) {
    sessionStorage.removeItem('scrollTo');
    const el = document.getElementById(scrollTarget);
    if (el && mainEl) {
      mainEl.style.scrollBehavior = 'auto';
      requestAnimationFrame(() => {
        el.scrollIntoView();
        requestAnimationFrame(() => {
          mainEl.style.scrollBehavior = '';
          document.documentElement.style.scrollBehavior = '';
        });
      });
    }
  } else {
    window.scrollTo(0, 0);
    if (mainEl) {
      mainEl.style.scrollBehavior = 'auto';
      mainEl.scrollTop = 0;
      requestAnimationFrame(() => {
        mainEl.style.scrollBehavior = '';
        document.documentElement.style.scrollBehavior = '';
      });
    }
  }

  // -- inject animation styles --
  const style = document.createElement('style');
  style.textContent = `
    .hero-tag, .hero-title, .hero-sub, .hero-links {
      opacity: 1;
    }
    .nav-links a { position: relative; }
    .nav-links a::after {
      content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1.5px;
      background: var(--accent); transition: width 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .nav-links a.active { color: var(--text); }
    .nav-links a.active::after { width: 100%; }
    .contact-form { transition: opacity 0.4s ease, transform 0.4s ease; }
    .contact-form.hiding { opacity: 0; transform: translateY(8px); pointer-events: none; }
    .form-success { opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s; }
    .form-success.show { display: block; opacity: 1; transform: translateY(0); }
    .hero-glow {
      position: fixed; pointer-events: none; width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%);
      transform: translate(-50%,-50%); z-index: 1; opacity: 0; transition: opacity 0.3s ease;
    }
    .hero-glow.visible { opacity: 1; }
    .hero-typing-cursor {
      animation: blink-cursor 0.8s step-end infinite;
      font-weight: 300;
    }
    @keyframes blink-cursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
    .hero-sentence {
      opacity: 0; transform: translateY(12px);
      transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1);
      display: inline-block;
    }
    .hero-sentence.visible {
      opacity: 1; transform: translateY(0) !important;
    }
    .project-card-featured { transition: opacity 0.35s ease, transform 0.35s ease; }
    .project-card-featured.crossfade-out { opacity: 0; transform: scale(0.98); }
    .project-card-featured.crossfade-in { opacity: 1; transform: scale(1); }
  `;
  document.head.appendChild(style);


  // ========================================
  // 1. STATUS BAR TYPING (terminal style)
  // ========================================
  const statusMessages = [
    'currently doomscrolling insta',
    'stressing about life',
    'waiting on mcat results',
    'prepping for harvard summer',
    'building landmarkdiff',
    'studying for classes',
    'overzealousness',
    '<3?',
    'debugging at 2am',
    'one more episode...',
  ];

  const statusText = document.getElementById('statusText');
  if (statusText) {
    let msgIdx = 0;
    let typing = false;
    const CHAR_DELAY = 40;
    const INTERVAL = 45000;

    const eraseText = (text, pos, cb) => {
      if (pos < 0) {
        statusText.textContent = '';
        cb();
        return;
      }
      statusText.textContent = text.slice(0, pos);
      setTimeout(() => eraseText(text, pos - 1, cb), CHAR_DELAY * 0.6);
    };

    const typeText = (text, pos, cb) => {
      if (pos > text.length) {
        cb();
        return;
      }
      statusText.textContent = text.slice(0, pos);
      setTimeout(() => typeText(text, pos + 1, cb), CHAR_DELAY);
    };

    const cycleStatus = () => {
      if (typing) return;
      typing = true;
      const currentText = statusText.textContent;
      msgIdx = (msgIdx + 1) % statusMessages.length;
      const nextText = statusMessages[msgIdx];

      eraseText(currentText, currentText.length - 1, () => {
        typeText(nextText, 0, () => {
          typing = false;
        });
      });
    };

    setInterval(cycleStatus, INTERVAL);
  }


  // ========================================
  // 2. HERO DESCRIPTION - line-by-line reveal
  // ========================================
  const heroBlurb = document.querySelector('.hero-blurb') || document.getElementById('heroTyping');
  if (heroBlurb) {
    const fullText = "junior. uw. biochemistry + neuroscience. two active labs, three institutions, and an unreasonable number of terminal windows. this summer i'm headed to harvard medical school. long term? maybe a surgeon. maybe a scientist. probably both.";

    // split on ". " but keep the period
    const sentences = fullText.split(/(?<=\.)\s+/);
    heroBlurb.innerHTML = '';

    const spans = sentences.map((sentence) => {
      const span = document.createElement('span');
      span.classList.add('hero-sentence');
      span.textContent = sentence + ' ';
      heroBlurb.appendChild(span);
      return span;
    });

    // stagger reveal after page load
    setTimeout(() => {
      spans.forEach((span, i) => {
        setTimeout(() => span.classList.add('visible'), i * 200);
      });
    }, 800);
  }


  // ========================================
  // 3. HERO ELEMENT REVEAL (tag, title, links)
  // ========================================
  const heroEls = ['.hero-tag', '.hero-title', '.hero-links'];
  heroEls.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (el) setTimeout(() => el.classList.add('revealed'), 200 + i * 150);
  });


  // ========================================
  // 4. NAV SCROLL + STATUS BAR HIDE
  // ========================================
  const nav = document.getElementById('nav');
  const statusBar = document.querySelector('.status-bar');
  let lastScrollY = 0;
  let ticking = false;

  const onNavScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 50);

    if (statusBar) {
      if (y > 100) {
        statusBar.style.transform = 'translateY(-100%)';
        statusBar.style.transition = 'transform 0.3s ease';
        if (nav) nav.style.top = '0';
      } else {
        statusBar.style.transform = 'translateY(0)';
        if (nav) nav.style.top = '33px';
      }
    }

    lastScrollY = y;
    ticking = false;
  };

  const requestNavScroll = () => {
    if (!ticking) {
      requestAnimationFrame(onNavScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestNavScroll, { passive: true });
  onNavScroll();


  // ========================================
  // 5. ACTIVE NAV SECTION HIGHLIGHTING
  // ========================================
  const navLinksAll = document.querySelectorAll('#navLinks a[href^="#"]');
  const sections = Array.from(navLinksAll)
    .map(l => ({ link: l, el: document.getElementById(l.getAttribute('href').slice(1)) }))
    .filter(s => s.el);
  let activeLink = null;

  const updateNav = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    let cur = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].el.offsetTop <= y) { cur = sections[i].link; break; }
    }
    if (cur !== activeLink) {
      if (activeLink) activeLink.classList.remove('active');
      if (cur) cur.classList.add('active');
      activeLink = cur;
    }
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();


  // ========================================
  // 6. MOBILE NAV TOGGLE
  // ========================================
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(l =>
      l.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      })
    );
  }


  // ========================================
  // 7. SCROLL ANIMATIONS (IntersectionObserver)
  // ========================================
  const sectionSelectors = '.section-label, .section-intro, .about-grid, .research-card, .clinical-card, .project-card, .project-card-featured, .projects-small-grid, .service-item, .mentorship-block, .pub-item, .tools-group, .contact-text, .contact-form, .shadow-group, .clinical-grid, .shadowing-details';
  document.querySelectorAll('.section').forEach(section => {
    section.querySelectorAll(sectionSelectors).forEach((el, i) => {
      if (!el.classList.contains('fade-in')) {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${i * 0.05}s`;
      }
    });
  });

  const scrollObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        scrollObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => scrollObs.observe(el));


  // ========================================
  // 8. STAT COUNTERS WITH OVERSHOOT
  // ========================================
  const statNums = document.querySelectorAll('.stat-num');
  let statsAnimated = false;

  const animateStat = (el, target, overshoot, suffix, delay) => {
    setTimeout(() => {
      const duration = target > 100 ? 1500 : 800;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        if (elapsed < duration) {
          const progress = elapsed / duration;
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target).toLocaleString() + suffix;
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString() + suffix;
        }
      };
      requestAnimationFrame(step);
    }, delay);
  };

  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !statsAnimated) {
        statsAnimated = true;

        statNums.forEach((el, i) => {
          // terminal windows — smart time-of-day + date-seeded logic
          if (el.dataset.terminalSmart !== undefined) {
            const updateTerminals = () => {
              const now = new Date();
              const hour = now.getHours();
              // day seed: changes daily (day-of-year)
              const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
              const daySeed = (dayOfYear * 13 + 7) % 5; // 0-4 range variation

              // base by time of day: more terminals during work hours
              let base;
              if (hour >= 1 && hour < 7) base = 1;          // sleeping
              else if (hour >= 7 && hour < 9) base = 3;      // waking up
              else if (hour >= 9 && hour < 12) base = 7;     // morning grind
              else if (hour >= 12 && hour < 14) base = 5;    // lunch break
              else if (hour >= 14 && hour < 18) base = 8;    // afternoon deep work
              else if (hour >= 18 && hour < 21) base = 6;    // evening wind down
              else if (hour >= 21 && hour < 24) base = 9;    // late night grind
              else base = 4;                                   // midnight

              // daily variation: +/- 0-2 from day seed
              const variation = (daySeed % 3) - 1; // -1, 0, or 1
              const val = Math.max(1, Math.min(12, base + variation));
              el.textContent = val;
            };
            updateTerminals();
            setInterval(updateTerminals, 60000);
            return;
          }

          let target = parseInt(el.dataset.target || '0');
          const baseOvershoot = parseInt(el.dataset.overshoot || target);
          const suffix = el.dataset.suffix || '';
          const autoInc = parseFloat(el.dataset.autoIncrement || '0');
          const baseDate = el.dataset.baseDate;

          if (autoInc && baseDate) {
            const days = (Date.now() - new Date(baseDate).getTime()) / 86400000;
            target += Math.floor(days * autoInc);
          }

          // scale overshoot proportionally with auto-increment growth
          const growth = target - parseInt(el.dataset.target || '0');
          const overshoot = baseOvershoot + growth;

          animateStat(el, target, overshoot, suffix, i * 80);
        });

        statsObs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const aboutStats = document.getElementById('aboutStats');
  if (aboutStats) statsObs.observe(aboutStats);


  // ========================================
  // 9. HERO CURSOR GLOW (desktop only)
  // ========================================
  const hero = document.querySelector('.hero');
  if (hero && !('ontouchstart' in window)) {
    const glow = document.createElement('div');
    glow.classList.add('hero-glow');
    document.body.appendChild(glow);
    let glowVisible = false;
    let glowRaf = null;

    hero.addEventListener('mouseenter', () => {
      glowVisible = true;
      glow.classList.add('visible');
    });
    hero.addEventListener('mouseleave', () => {
      glowVisible = false;
      glow.classList.remove('visible');
    });
    hero.addEventListener('mousemove', e => {
      if (!glowVisible || glowRaf) return;
      glowRaf = requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glowRaf = null;
      });
    });
  }


  // ========================================
  // 10. PROJECTS VIEWER (tab sidebar + card)
  // ========================================
  {
    const tabs = document.querySelectorAll('.proj-tab');
    const cards = document.querySelectorAll('.proj-card');
    const prevBtn = document.querySelector('.proj-prev');
    const nextBtn = document.querySelector('.proj-next');
    let currentProj = 0;

    const showProj = (idx) => {
      currentProj = idx;
      cards.forEach(c => c.classList.toggle('active', +c.dataset.proj === idx));
      // hide active project's tab, show all others
      tabs.forEach(t => {
        const ti = +t.dataset.proj;
        t.style.display = (ti === idx) ? 'none' : '';
        t.classList.toggle('active', ti === idx);
      });
    };

    tabs.forEach(t => t.addEventListener('click', () => showProj(+t.dataset.proj)));

    if (prevBtn) prevBtn.addEventListener('click', () => {
      showProj((currentProj - 1 + cards.length) % cards.length);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      showProj((currentProj + 1) % cards.length);
    });

    // initial state: hide active tab
    showProj(0);
  }


  // ========================================
  // 11. NYAN CAT BEHAVIOR (CSS class-driven states)
  // ========================================
  const nyanCat = document.querySelector('.nyan-cat');
  if (nyanCat) {
    let nyanScrollTimer = null;
    let nyanIdleTimer = null;
    let nyanLastY = window.scrollY;

    const setNyanState = (state) => {
      nyanCat.classList.remove('is-running', 'is-idle', 'is-sleeping');
      nyanCat.classList.add(state);
    };

    const setNyanIdle = () => {
      setNyanState('is-idle');
      nyanIdleTimer = setTimeout(() => {
        setNyanState('is-sleeping');
      }, 5000);
    };

    setNyanIdle();

    window.addEventListener('scroll', () => {
      nyanLastY = window.scrollY;

      clearTimeout(nyanIdleTimer);
      clearTimeout(nyanScrollTimer);

      setNyanState('is-running');

      nyanScrollTimer = setTimeout(setNyanIdle, 200);
    }, { passive: true });
  }


  // ========================================
  // 12. GEAR CAT
  // ========================================
  const gearCat = document.querySelector('.gear-cat');
  const gearScene = document.querySelector('.gear-scene');
  if (gearCat && gearScene) {
    const gearClasses = ['on-gear-1', 'on-gear-2', 'on-gear-3'];
    let currentGear = 0;

    const removeAllGearClasses = () => {
      gearClasses.forEach(c => gearCat.classList.remove(c));
    };

    const jumpToGear = () => {
      let nextGear;
      do {
        nextGear = Math.floor(Math.random() * gearClasses.length);
      } while (nextGear === currentGear && gearClasses.length > 1);

      removeAllGearClasses();
      currentGear = nextGear;
      gearCat.classList.add(gearClasses[currentGear]);

      // schedule next jump at random interval 3-8s
      const delay = 3000 + Math.random() * 5000;
      setTimeout(jumpToGear, delay);
    };

    // start on gear 1
    gearCat.classList.add(gearClasses[0]);
    const initialDelay = 3000 + Math.random() * 5000;
    setTimeout(jumpToGear, initialDelay);
  }


  // ========================================
  // 13. SCROLL CAT (existing #scrollCat)
  // ========================================
  const catEl = document.getElementById('scrollCat');
  const catSprite = document.getElementById('catSprite');
  if (catEl && catSprite) {
    let catLastScroll = window.scrollY;
    let catScrollTimer = null;
    let catSleepTimer = null;
    let catState = 'idle';

    const setCatState = (state) => {
      if (state === catState) return;
      catState = state;
      catSprite.className = 'cat-sprite cat-' + state;
    };

    setCatState('idle');

    window.addEventListener('scroll', () => {
      const dir = window.scrollY > catLastScroll ? 'right' : 'left';
      catLastScroll = window.scrollY;
      setCatState('run-' + dir);

      clearTimeout(catScrollTimer);
      clearTimeout(catSleepTimer);
      catScrollTimer = setTimeout(() => {
        setCatState('idle');
        catSleepTimer = setTimeout(() => {
          if (catState === 'idle') setCatState('sleep');
        }, 5000);
      }, 150);
    }, { passive: true });

    // start sleeping after initial idle
    setTimeout(() => {
      if (catState === 'idle') setCatState('sleep');
    }, 3000);
  }


  // ========================================
  // 14. FORM SUBMIT
  // ========================================
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const termLine1 = document.getElementById('termLine1');
  const termLine2 = document.getElementById('termLine2');
  const termLine3 = document.getElementById('termLine3');
  const termLine4 = document.getElementById('termLine4');
  const termInput = document.getElementById('termInput');

  const typeText = (el, text, speed) => {
    return new Promise(resolve => {
      let i = 0;
      el.innerHTML = '';
      const tick = () => {
        if (i < text.length) {
          el.innerHTML += text[i];
          i++;
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      };
      tick();
    });
  };

  const resetForm = () => {
    success.classList.remove('show');
    if (termLine1) termLine1.innerHTML = '';
    if (termLine2) termLine2.innerHTML = '';
    if (termLine3) termLine3.style.display = 'none';
    if (termLine4) { termLine4.innerHTML = ''; termLine4.style.display = 'none'; }
    if (termInput) termInput.value = '';
    form.reset();
    form.classList.remove('hiding');
    form.style.visibility = '';
    form.style.position = '';
  };

  if (form && success) {
    let promptActive = false;

    form.addEventListener('submit', e => {
      e.preventDefault();
      form.classList.add('hiding');
      setTimeout(async () => {
        form.style.visibility = 'hidden';
        form.style.position = 'absolute';
        success.classList.add('show');
        await typeText(termLine1, '$ sending email...', 35);
        await new Promise(r => setTimeout(r, 600));
        await typeText(termLine2, '\u2713 delivered. encrypted.', 25);
        await new Promise(r => setTimeout(r, 500));
        termLine3.style.display = 'flex';
        termInput.value = '';
        termInput.focus();
        promptActive = true;
      }, 400);
    });

    if (termInput) {
      termInput.addEventListener('keydown', async (e) => {
        if (!promptActive) return;
        const key = e.key.toLowerCase();
        if (key !== 'y' && key !== 'n') {
          e.preventDefault();
          return;
        }
        promptActive = false;
        if (key === 'y') {
          termInput.value = 'y';
          termInput.disabled = true;
          await new Promise(r => setTimeout(r, 400));
          resetForm();
        } else {
          termInput.value = 'n';
          termInput.disabled = true;
          termLine4.style.display = 'block';
          await typeText(termLine4, 'ok! have a nice day :>', 30);
          await new Promise(r => setTimeout(r, 600));
          const termLine5 = document.createElement('div');
          termLine5.className = 'term-line';
          termLine4.parentElement.appendChild(termLine5);
          await typeText(termLine5, '$ press any key to return _', 30);
          const returnHandler = () => {
            document.removeEventListener('keydown', returnHandler);
            resetForm();
          };
          document.addEventListener('keydown', returnHandler);
        }
      });
    }
  }


  // ========================================
  // 14b. LINKS TOGGLE
  // ========================================
  {
    const linksToggle = document.getElementById('linksToggle');
    const linksPanel = document.getElementById('linksPanel');
    const linksHide = document.getElementById('linksHide');
    if (linksToggle && linksPanel) {
      linksToggle.addEventListener('click', () => {
        linksPanel.classList.toggle('open');
      });
    }
    if (linksHide) {
      linksHide.addEventListener('click', () => {
        linksPanel.classList.remove('open');
      });
    }
  }

  // ========================================
  // 15b. FOOTER ARROW TOGGLE
  // ========================================
  {
    const footerArrow = document.getElementById('footerArrow');
    const siteFooter = document.getElementById('siteFooter');
    if (footerArrow && siteFooter) {
      footerArrow.addEventListener('click', () => {
        siteFooter.classList.toggle('open');
        footerArrow.classList.toggle('open');
      });
    }
  }

  // ========================================
  // 15a. POND TOGGLE
  // ========================================
  let pondActive = true;
  const pondToggle = document.getElementById('pondToggle');
  const pondScene = document.getElementById('pondScene');
  if (pondToggle && pondScene) {
    pondToggle.addEventListener('click', () => {
      pondActive = !pondActive;
      pondScene.style.opacity = pondActive ? '1' : '0';
      pondScene.style.transition = 'opacity 0.4s ease';
      pondToggle.classList.toggle('off', !pondActive);
      pondToggle.textContent = pondActive ? 'pond' : 'pond off';
      // toggle section pond canvases too
      sectionCanvases.forEach(cv => {
        cv.style.opacity = pondActive ? '1' : '0';
        cv.style.transition = 'opacity 0.4s ease';
      });
    });
  }

  // pond bridge — connects hero and about section ponds visually
  const pondBridge = {};

  // ========================================
  // 15b. MONTE CARLO RAINDROPS — pond scene
  // ========================================
  const canvas = document.getElementById('rippleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const drops = [];
    const MAX_DROPS = 22;
    const A = [200, 255, 0]; // accent

    let W = 0, H = 0;
    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    pondBridge.hero = { drops, getW: () => W, getH: () => H };

    // --- lily pads (no flowers, well-spaced, avoid text zone) ---
    // text occupies roughly left 45% of the hero
    const TEXT_ZONE = 0.42;
    const leaves = [];
    const leafPositions = [
      // left of "somewhere" — above and below text
      { x: 0.08, y: 0.08 },
      { x: 0.18, y: 0.85 },
      { x: 0.35, y: 0.92 },
      { x: 0.05, y: 0.55 },
      // right side of canvas
      { x: 0.55, y: 0.15 },
      { x: 0.78, y: 0.30 },
      { x: 0.92, y: 0.60 },
      { x: 0.60, y: 0.78 },
    ];
    for (let i = 0; i < leafPositions.length; i++) {
      const jx = (Math.random() - 0.5) * 0.06;
      const jy = (Math.random() - 0.5) * 0.06;
      leaves.push({
        x: leafPositions[i].x + jx,
        y: leafPositions[i].y + jy,
        size: 20 + Math.random() * 28,
        rot: Math.random() * Math.PI * 2,
        sliceAngle: -0.3 + Math.random() * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.0003,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.0004 + Math.random() * 0.0003,
        hasFlower: false
      });
    }

    // --- duck society: 10 solo adults + 1-2 mama families with babies ---
    const ducks = [];
    const CRUISE_SPEED = 0.00055;
    const MAX_TURN = 0.008;
    const BABY_DIST = 0.024;
    const SOLO_COUNT = 5 + Math.floor(Math.random() * 3); // 5-7 solo
    const FAMILY_COUNT = 1 + Math.floor(Math.random() * 2); // 1 or 2 families
    const TOTAL_ADULTS = SOLO_COUNT + FAMILY_COUNT; // 7-9 total
    const NEIGHBOR_DIST = 0.12;
    const SEPARATION_DIST = 0.06;

    // parametric path — Lissajous with prime harmonics, 25 min full loop
    const PATH_DURATION = 25 * 60 * 1000;
    const TAU = Math.PI * 2;
    const pathPos = (t, variant) => {
      const a = TAU * t;
      const v = variant * 0.73;
      return {
        x: 0.50 + 0.42 * Math.sin(a * 3 + v) + 0.10 * Math.sin(a * 7 + 1.2 + v * 1.3) + 0.05 * Math.cos(a * 13 + 0.7 - v * 0.8),
        y: 0.50 + 0.40 * Math.cos(a * 5 + 0.8 + v * 1.1) + 0.10 * Math.cos(a * 11 + 2.1 - v * 0.9) + 0.05 * Math.sin(a * 17 + 1.5 + v * 1.4),
      };
    };

    const pathStart = Date.now();
    const globalT0 = Math.random();

    for (let i = 0; i < TOTAL_ADULTS; i++) {
      const t0 = (globalT0 + i / TOTAL_ADULTS) % 1.0;
      const pos = pathPos(t0, i);
      const nxt = pathPos(t0 + 0.0001, i);
      const h = Math.atan2(nxt.y - pos.y, nxt.x - pos.x);

      // last FAMILY_COUNT ducks are mamas with babies
      const isMama = (i >= SOLO_COUNT);
      const babies = [];
      if (isMama) {
        const babyCount = 3 + Math.floor(Math.random() * 3); // 3-5 babies
        for (let b = 0; b < babyCount; b++) {
          babies.push({
            x: pos.x - Math.cos(h) * BABY_DIST * (b + 1),
            y: pos.y - Math.sin(h) * BABY_DIST * (b + 1),
            heading: h, wobble: b * 1.1,
          });
        }
      }

      // mamas are always female; solos are random male/female
      const sex = isMama ? 'f' : (Math.random() < 0.5 ? 'm' : 'f');
      ducks.push({
        x: pos.x, y: pos.y,
        heading: h,
        speed: CRUISE_SPEED * (0.85 + Math.random() * 0.30),
        wobble: Math.random() * TAU,
        driftPhase: Math.random() * TAU,
        size: isMama ? 14 : 10 + Math.random() * 4,
        variant: i,
        pathOffset: t0,
        isMama,
        babies,
        sex,
        quackTimer: 0,
        restTimer: 0, // frames remaining to stay still
      });
    }

    // track cursor for duck interaction
    let cursorX = -1, cursorY = -1;
    canvas.parentElement.style.pointerEvents = 'auto';
    canvas.parentElement.addEventListener('mousemove', (e) => {
      const r = canvas.parentElement.getBoundingClientRect();
      cursorX = (e.clientX - r.left) / W;
      cursorY = (e.clientY - r.top) / H;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
      cursorX = -1; cursorY = -1;
    });

    // text zone bounds (normalized) — shared between spawnDrop and draw
    const boxR = 0.46, boxT = 0.18, boxB = 0.84;

    const spawnDrop = () => {
      let x, y, attempts = 0;
      do {
        x = Math.random() * W;
        y = Math.random() * H;
        attempts++;
        // avoid only the actual text box area (with small padding)
      } while (x / W < boxR + 0.03 && y / H > boxT - 0.03 && y / H < boxB + 0.03 && attempts < 20);
      const maxR = 50 + Math.random() * 180;
      const rings = 3 + Math.floor(Math.random() * 5);
      const speed = 0.12 + Math.random() * 0.22;
      const peakAlpha = 0.06 + Math.random() * 0.16;
      drops.push({ x, y, r: 0, maxR, rings, speed, peakAlpha });
    };

    // seed
    for (let i = 0; i < 12; i++) {
      spawnDrop();
      const d = drops[drops.length - 1];
      d.r = Math.random() * d.maxR;
    }

    const drawLeaf = (lx, ly, sz, rot, sliceAngle) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);

      const notchWidth = 0.35;
      const startAngle = sliceAngle + notchWidth;
      const endAngle = sliceAngle + Math.PI * 2 - notchWidth;

      // shadow
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(2, 2, sz, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();

      // main pad
      const grad = ctx.createRadialGradient(0, 0, sz * 0.1, 0, 0, sz);
      grad.addColorStop(0, 'rgba(50, 90, 30, 0.45)');
      grad.addColorStop(0.6, 'rgba(35, 70, 20, 0.38)');
      grad.addColorStop(1, 'rgba(25, 55, 15, 0.30)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, sz, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // edge highlight
      ctx.beginPath();
      ctx.arc(0, 0, sz, startAngle, endAngle);
      ctx.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // notch lines
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(startAngle) * sz, Math.sin(startAngle) * sz);
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(endAngle) * sz, Math.sin(endAngle) * sz);
      ctx.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},0.10)`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // radial veins
      for (let v = 0; v < 8; v++) {
        const va = startAngle + (v / 8) * (endAngle - startAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(va) * sz * 0.85, Math.sin(va) * sz * 0.85);
        ctx.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},0.05)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.restore();
    };

    // top-down duck drawing (reference: publicdomainvectors duckling top view)
    const drawDuck = (dx, dy, sz, heading, isBaby, sex) => {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(heading);

      if (isBaby) {
        const s = sz * 0.40;

        // shadow
        ctx.beginPath();
        ctx.ellipse(2, 2, s * 0.9, s * 0.65, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.fill();

        // egg-shaped body (wider at back)
        ctx.beginPath();
        ctx.ellipse(-s * 0.08, 0, s * 0.75, s * 0.58, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 225, 50, 0.55)';
        ctx.fill();

        // wing bumps
        ctx.beginPath();
        ctx.ellipse(-s * 0.12, -s * 0.35, s * 0.38, s * 0.18, -0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 215, 40, 0.35)';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-s * 0.12, s * 0.35, s * 0.38, s * 0.18, 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 215, 40, 0.35)';
        ctx.fill();

        // round head (big for baby proportions)
        ctx.beginPath();
        ctx.arc(s * 0.48, 0, s * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 230, 55, 0.60)';
        ctx.fill();

        // beak — small orange oval
        ctx.beginPath();
        ctx.ellipse(s * 0.82, 0, s * 0.20, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240, 160, 40, 0.55)';
        ctx.fill();

        // eyes
        ctx.beginPath();
        ctx.arc(s * 0.52, -s * 0.18, 0.9, 0, Math.PI * 2);
        ctx.arc(s * 0.52, s * 0.18, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 15, 15, 0.60)';
        ctx.fill();

        // tiny wake
        ctx.beginPath();
        ctx.moveTo(-s * 0.75, 0);
        ctx.lineTo(-s * 1.0, -s * 0.18);
        ctx.moveTo(-s * 0.75, 0);
        ctx.lineTo(-s * 1.0, s * 0.18);
        ctx.strokeStyle = 'rgba(200, 255, 0, 0.04)';
        ctx.lineWidth = 0.3;
        ctx.stroke();

      } else {
        const s = sz;

        // shadow
        ctx.beginPath();
        ctx.ellipse(3, 3, s * 1.0, s * 0.65, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.fill();

        // male: darker body with blue-green speculum; female: warm brown tawny
        const isMale = sex === 'm';
        const bg = ctx.createRadialGradient(-s * 0.1, 0, s * 0.15, 0, 0, s * 0.85);
        if (isMale) {
          bg.addColorStop(0, 'rgba(120, 110, 90, 0.52)');
          bg.addColorStop(0.5, 'rgba(100, 90, 75, 0.42)');
          bg.addColorStop(1, 'rgba(80, 70, 55, 0.22)');
        } else {
          bg.addColorStop(0, 'rgba(180, 140, 70, 0.52)');
          bg.addColorStop(0.5, 'rgba(160, 120, 55, 0.42)');
          bg.addColorStop(1, 'rgba(140, 100, 40, 0.22)');
        }
        ctx.beginPath();
        ctx.ellipse(-s * 0.05, 0, s * 0.85, s * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.strokeStyle = isMale ? 'rgba(140, 130, 110, 0.18)' : 'rgba(200, 170, 90, 0.18)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // wings
        const wingFill = isMale ? 'rgba(95, 85, 65, 0.35)' : 'rgba(155, 115, 50, 0.35)';
        const wingStroke = isMale ? 'rgba(130, 120, 100, 0.14)' : 'rgba(190, 150, 70, 0.14)';
        ctx.beginPath();
        ctx.ellipse(-s * 0.08, -s * 0.34, s * 0.50, s * 0.20, -0.12, 0, Math.PI * 2);
        ctx.fillStyle = wingFill;
        ctx.fill();
        ctx.strokeStyle = wingStroke;
        ctx.lineWidth = 0.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(-s * 0.08, s * 0.34, s * 0.50, s * 0.20, 0.12, 0, Math.PI * 2);
        ctx.fillStyle = wingFill;
        ctx.fill();
        ctx.strokeStyle = wingStroke;
        ctx.lineWidth = 0.4;
        ctx.stroke();

        // tail point
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, 0);
        ctx.lineTo(-s * 1.1, -s * 0.1);
        ctx.lineTo(-s * 1.15, 0);
        ctx.lineTo(-s * 1.1, s * 0.1);
        ctx.closePath();
        ctx.fillStyle = 'rgba(140, 105, 45, 0.30)';
        ctx.fill();

        // head — male: iridescent green; female: warm brown
        const hx = s * 0.58;
        const headSz = s * 0.38;
        ctx.beginPath();
        ctx.arc(hx, 0, headSz, 0, Math.PI * 2);
        ctx.fillStyle = isMale ? 'rgba(25, 100, 55, 0.55)' : 'rgba(160, 115, 55, 0.52)';
        ctx.fill();

        // beak — warm orange
        ctx.beginPath();
        ctx.ellipse(hx + headSz * 0.9, 0, headSz * 0.38, headSz * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240, 175, 40, 0.55)';
        ctx.fill();

        // eyes
        ctx.beginPath();
        ctx.arc(hx + headSz * 0.08, -headSz * 0.38, 1.1, 0, Math.PI * 2);
        ctx.arc(hx + headSz * 0.08, headSz * 0.38, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 15, 15, 0.60)';
        ctx.fill();

        // wake V
        for (let w = 0; w < 4; w++) {
          const wo = -s * (1.2 + w * 0.38);
          const ws = s * (0.16 + w * 0.11);
          ctx.beginPath();
          ctx.moveTo(wo, 0);
          ctx.lineTo(wo - s * 0.22, -ws);
          ctx.moveTo(wo, 0);
          ctx.lineTo(wo - s * 0.22, ws);
          ctx.strokeStyle = `rgba(200, 255, 0, ${(0.045 - w * 0.01).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const now = Date.now();

      // --- ripples ---
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.r += d.speed;
        const progress = d.r / d.maxR;
        if (progress > 1) { drops.splice(i, 1); continue; }

        const fade = progress < 0.12
          ? progress / 0.12
          : 1 - ((progress - 0.12) / 0.88);

        let boost = 0;
        for (let j = 0; j < drops.length; j++) {
          if (j === i) continue;
          const o = drops[j];
          const dist = Math.hypot(d.x - o.x, d.y - o.y);
          if (dist < d.r + o.r && dist > Math.abs(d.r - o.r)) {
            boost += 0.04;
          }
        }
        boost = Math.min(boost, 0.15);

        for (let ring = 0; ring < d.rings; ring++) {
          const ringOffset = ring * (d.maxR / d.rings) * 0.3;
          const ringR = d.r - ringOffset;
          if (ringR <= 0) continue;
          const ringFade = fade * (1 - ring * 0.12);
          const alpha = (d.peakAlpha + boost) * ringFade;
          if (alpha <= 0.004) continue;
          ctx.beginPath();
          ctx.arc(d.x, d.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},${alpha.toFixed(3)})`;
          ctx.lineWidth = ring === 0 ? 1.2 : 0.7;
          ctx.stroke();
        }
      }

      // --- lily pads ---
      for (const l of leaves) {
        l.rot += l.rotSpeed;
        l.drift += l.driftSpeed;
        const lx = l.x * W + Math.sin(l.drift) * 8;
        const ly = l.y * H + Math.cos(l.drift * 0.7) * 5;
        drawLeaf(lx, ly, l.size, l.rot, l.sliceAngle);
      }

      // cursor acts as invisible lily pad (avoidance only, no visual)

      // --- 10 adult ducks — society with flocking, separation, path following ---
      const elapsed = Date.now() - pathStart;

      for (let di = 0; di < ducks.length; di++) {
        const dk = ducks[di];
        dk.wobble += 0.008;
        dk.driftPhase += 0.004;

        // solo ducks sometimes rest near another duck — if opposite sex, both stop face-to-face and show a tiny heart
        if (dk.restTimer > 0) {
          dk.restTimer--;
          // if kissing, gently slide toward partner so they touch beak-to-beak
          if (dk._kissPartner >= 0) {
            const partner = ducks[dk._kissPartner];
            if (partner.restTimer > 0 && partner._kissPartner === di) {
              // face each other
              dk.heading = Math.atan2(partner.y - dk.y, partner.x - dk.x);
              // nudge together until beaks nearly touch (gap ~ 1.5 duck sizes in normalized coords)
              const dist = Math.hypot(dk.x - partner.x, dk.y - partner.y);
              const touchDist = (dk.size + partner.size) * 1.5 / W;
              if (dist > touchDist) {
                dk.x += (partner.x - dk.x) * 0.03;
                dk.y += (partner.y - dk.y) * 0.03;
              }
            }
          }
          drawDuck(dk.x * W, dk.y * H, dk.size, dk.heading, false, dk.sex);
          // draw tiny heart between the pair only when BOTH are stopped
          if (dk._kissPartner >= 0 && dk.restTimer > 30) {
            const partner = ducks[dk._kissPartner];
            if (partner.restTimer > 0 && partner._kissPartner === di) {
              const mx = (dk.x + partner.x) / 2;
              const my = (dk.y + partner.y) / 2;
              const heartPhase = (dk.restTimer % 60) / 60;
              const hy = my * H - dk.size * 2.2 - Math.sin(heartPhase * Math.PI * 2) * 3;
              const hx = mx * W;
              const hsz = 2.5;
              const hAlpha = Math.min(1, (dk.restTimer - 30) / 60) * 0.6;
              ctx.save();
              ctx.translate(hx, hy);
              ctx.beginPath();
              ctx.moveTo(0, hsz * 0.3);
              ctx.bezierCurveTo(-hsz, -hsz * 0.5, -hsz * 0.2, -hsz * 1.2, 0, -hsz * 0.4);
              ctx.bezierCurveTo(hsz * 0.2, -hsz * 1.2, hsz, -hsz * 0.5, 0, hsz * 0.3);
              ctx.fillStyle = `rgba(255, 100, 120, ${hAlpha.toFixed(2)})`;
              ctx.fill();
              ctx.restore();
            }
          }
          continue;
        }
        if (!dk.isMama && Math.random() < 0.0003) {
          dk._kissPartner = -1;
          for (let j = 0; j < ducks.length; j++) {
            if (j === di) continue;
            const nd = ducks[j];
            if (nd.isMama || nd.restTimer > 0) continue;
            if (nd.sex === dk.sex) continue;
            if (Math.hypot(dk.x - nd.x, dk.y - nd.y) < 0.15) {
              const duration = 150 + Math.floor(Math.random() * 200);
              dk.restTimer = duration;
              nd.restTimer = duration;
              dk._kissPartner = j;
              nd._kissPartner = di;
              break;
            }
          }
        }

        // follow individual parametric path
        const pathT = (dk.pathOffset + elapsed / PATH_DURATION) % 1.0;
        const target = pathPos(pathT, dk.variant);
        const ddx = target.x - dk.x;
        const ddy = target.y - dk.y;
        const desired = Math.atan2(ddy, ddx);
        let diff = desired - dk.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turnAmt = diff * 0.025;
        dk.heading += Math.max(-MAX_TURN, Math.min(MAX_TURN, turnAmt));

        // --- social forces ---
        let socialX = 0, socialY = 0;

        // avoid ALL baby ducks — including own babies (babies are solid entities)
        for (const fam of ducks) {
          for (const baby of fam.babies) {
            const bx = dk.x - baby.x;
            const by = dk.y - baby.y;
            const bd = Math.hypot(bx, by);
            if (bd < SEPARATION_DIST && bd > 0) {
              const str = Math.pow((SEPARATION_DIST - bd) / SEPARATION_DIST, 0.5);
              const force = (fam === dk) ? 2.5 : 3.5; // gentler for own babies to avoid jitter
              socialX += (bx / bd) * str * force;
              socialY += (by / bd) * str * force;
            }
          }
        }

        for (let j = 0; j < ducks.length; j++) {
          if (j === di) continue;
          const other = ducks[j];
          const dx = dk.x - other.x;
          const dy = dk.y - other.y;
          const dist = Math.hypot(dx, dy);

          // separation — strong, no overlap allowed
          if (dist < SEPARATION_DIST && dist > 0) {
            const str = Math.pow((SEPARATION_DIST - dist) / SEPARATION_DIST, 0.5);
            socialX += (dx / dist) * str * 4.0;
            socialY += (dy / dist) * str * 4.0;
          }
          // dispersion — medium range push to spread across map
          else if (dist < 0.25 && dist > 0) {
            const str = (0.25 - dist) / 0.25;
            socialX += (dx / dist) * str * 0.4;
            socialY += (dy / dist) * str * 0.4;
          }
          // mild alignment — nearby ducks tend to swim similar direction
          if (dist < NEIGHBOR_DIST && dist > SEPARATION_DIST) {
            const alignStr = 0.0005;
            socialX += Math.cos(other.heading) * alignStr;
            socialY += Math.sin(other.heading) * alignStr;
          }
        }

        // --- avoidance forces ---
        let avoidX = socialX, avoidY = socialY;

        // mamas get wall avoidance to stay on screen
        if (dk.isMama && dk.babies.length > 0) {
          const WALL = 0.12;
          if (dk.x < WALL) avoidX += Math.pow((WALL - dk.x) / WALL, 0.5) * 2.5;
          if (dk.x > 1 - WALL) avoidX -= Math.pow((dk.x - (1 - WALL)) / WALL, 0.5) * 2.5;
          if (dk.y < WALL) avoidY += Math.pow((WALL - dk.y) / WALL, 0.5) * 2.5;
          if (dk.y > 1 - WALL) avoidY -= Math.pow((dk.y - (1 - WALL)) / WALL, 0.5) * 2.5;
        }

        // nav bar
        if (dk.y < 0.14) avoidY += Math.pow((0.14 - dk.y) / 0.14, 0.5) * 3;

        // text box — much stronger for mamas (hard boundary)
        // text box — all ducks strongly avoid, hard clamp
        const TB = 0.28;
        const cpx = Math.min(Math.max(dk.x, 0), boxR);
        const cpy = Math.min(Math.max(dk.y, boxT), boxB);
        const boxDist = Math.hypot(dk.x - cpx, dk.y - cpy);
        if (boxDist < TB && boxDist > 0) {
          const str = Math.pow((TB - boxDist) / TB, 0.5);
          avoidX += ((dk.x - cpx) / boxDist) * str * 12.0;
          avoidY += ((dk.y - cpy) / boxDist) * str * 12.0;
        }
        // hard push if inside or near text box
        if (dk.x < boxR + 0.06 && dk.y > boxT - 0.06 && dk.y < boxB + 0.06) {
          avoidX += 10.0;
        }
        // hard clamp — never enter text box
        if (dk.x < boxR + 0.08 && dk.y > boxT - 0.08 && dk.y < boxB + 0.08) {
          dk.x = Math.max(dk.x, boxR + 0.08);
        }

        // lily pads — strong repulsion, no touching
        const hasBabies = dk.isMama && dk.babies.length > 0;
        for (const l of leaves) {
          const lx = l.x + Math.sin(l.drift) * 8 / W;
          const ly = l.y + Math.cos(l.drift * 0.7) * 5 / H;
          const lilyR = hasBabies ? (l.size + 90) : (l.size + 60);
          const avR = lilyR / Math.min(W, H);
          const dist = Math.hypot(dk.x - lx, dk.y - ly);
          if (dist < avR && dist > 0) {
            const str = Math.pow((avR - dist) / avR, 0.5);
            const lilyForce = hasBabies ? 8.0 : 3.5;
            avoidX += ((dk.x - lx) / dist) * str * lilyForce;
            avoidY += ((dk.y - ly) / dist) * str * lilyForce;
          }
          // hard push mamas out of lily pad zone
          if (hasBabies) {
            const hardR = (l.size + 50) / Math.min(W, H);
            if (dist < hardR && dist > 0) {
              dk.x += ((dk.x - lx) / dist) * 0.003;
              dk.y += ((dk.y - ly) / dist) * 0.003;
            }
          }
        }

        // cursor
        if (cursorX > 0 && cursorY > 0) {
          const cAvR = 0.30;
          const cdist = Math.hypot(dk.x - cursorX, dk.y - cursorY);
          if (cdist < cAvR && cdist > 0) {
            const str = Math.pow((cAvR - cdist) / cAvR, 0.4);
            avoidX += ((dk.x - cursorX) / cdist) * str * 7.0;
            avoidY += ((dk.y - cursorY) / cdist) * str * 7.0;
            dk.speed = Math.max(dk.speed, CRUISE_SPEED * (2.0 + str * 2.5));
          }
        }

        // apply avoidance
        const avMag = Math.hypot(avoidX, avoidY);
        if (avMag > 0.01) {
          const avAngle = Math.atan2(avoidY, avoidX);
          let avDiff = avAngle - dk.heading;
          while (avDiff > Math.PI) avDiff -= Math.PI * 2;
          while (avDiff < -Math.PI) avDiff += Math.PI * 2;
          dk.heading += Math.sign(avDiff) * Math.min(Math.abs(avDiff), MAX_TURN * 5 * Math.min(avMag, 1.5));
        }

        // move forward
        dk.speed += (CRUISE_SPEED - dk.speed) * 0.05;
        dk.x += Math.cos(dk.heading) * dk.speed;
        dk.y += Math.sin(dk.heading) * dk.speed;

        // body sway
        const driftAmt = Math.sin(dk.driftPhase) * 0.00018;
        dk.x += Math.cos(dk.heading + Math.PI / 2) * driftAmt;
        dk.y += Math.sin(dk.heading + Math.PI / 2) * driftAmt;

        // mamas with babies stay on screen
        if (dk.isMama && dk.babies.length > 0) {
          dk.x = Math.max(0.03, Math.min(0.97, dk.x));
          dk.y = Math.max(0.03, Math.min(0.97, dk.y));
        }

        // solo duck went offscreen — respawn another from opposite edge
        if (!dk.isMama && (dk.x < -0.08 || dk.x > 1.08 || dk.y < -0.08 || dk.y > 1.08)) {
          // pick a random edge to enter from opposite side
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) { dk.x = -0.05; dk.y = 0.1 + Math.random() * 0.8; dk.heading = 0; }
          else if (edge === 1) { dk.x = 1.05; dk.y = 0.1 + Math.random() * 0.8; dk.heading = Math.PI; }
          else if (edge === 2) { dk.y = -0.05; dk.x = 0.1 + Math.random() * 0.8; dk.heading = Math.PI / 2; }
          else { dk.y = 1.05; dk.x = 0.1 + Math.random() * 0.8; dk.heading = -Math.PI / 2; }
          // reset path offset so it has a fresh destination
          dk.pathOffset = (elapsed / PATH_DURATION + Math.random() * 0.1) % 1.0;
        }

        while (dk.heading > Math.PI) dk.heading -= Math.PI * 2;
        while (dk.heading < -Math.PI) dk.heading += Math.PI * 2;

        drawDuck(dk.x * W, dk.y * H, dk.size, dk.heading, false, dk.sex);

        // communication — nearby ducks occasionally send quack ripples
        dk.quackTimer--;
        if (dk.quackTimer <= 0) {
          // check if any neighbor is close enough to "talk" to
          for (let j = 0; j < ducks.length; j++) {
            if (j === di) continue;
            const d2 = Math.hypot(dk.x - ducks[j].x, dk.y - ducks[j].y);
            if (d2 < NEIGHBOR_DIST && Math.random() < 0.002) {
              // small quack ripple at duck position
              drops.push({
                x: dk.x * W, y: dk.y * H,
                r: 0, maxR: 20 + Math.random() * 25,
                rings: 2, speed: 0.15,
                peakAlpha: 0.06,
              });
              dk.quackTimer = 120 + Math.floor(Math.random() * 300); // cooldown
              break;
            }
          }
          if (dk.quackTimer <= 0) dk.quackTimer = 30;
        }

        // baby ducks — follow mama at consistent distance
        if (dk.babies.length > 0) {
          for (let b = 0; b < dk.babies.length; b++) {
            const baby = dk.babies[b];
            const leader = b === 0 ? dk : dk.babies[b - 1];
            const bdx = leader.x - baby.x;
            const bdy = leader.y - baby.y;
            const bdist = Math.hypot(bdx, bdy);
            if (bdist > BABY_DIST) {
              const tx = leader.x - (bdx / bdist) * BABY_DIST;
              const ty = leader.y - (bdy / bdist) * BABY_DIST;
              const follow = 0.10 + Math.min((bdist - BABY_DIST) * 5, 0.20);
              baby.x += (tx - baby.x) * follow;
              baby.y += (ty - baby.y) * follow;
            }
            if (bdist > 0.002) {
              const dh = Math.atan2(bdy, bdx);
              let hd = dh - baby.heading;
              while (hd > Math.PI) hd -= Math.PI * 2;
              while (hd < -Math.PI) hd += Math.PI * 2;
              baby.heading += hd * 0.15;
            }
            baby.wobble += 0.018;
            drawDuck(baby.x * W, baby.y * H, dk.size, baby.heading, true, dk.sex);

            // very rare: baby grows into adult duck (once every ~15 min on avg)
            if (!baby._grown && Math.random() < 0.000002) {
              baby._grown = true;
              const newSex = Math.random() < 0.5 ? 'm' : 'f';
              ducks.push({
                x: baby.x, y: baby.y,
                heading: baby.heading,
                speed: CRUISE_SPEED * (0.85 + Math.random() * 0.30),
                wobble: Math.random() * TAU,
                driftPhase: Math.random() * TAU,
                size: 10 + Math.random() * 3,
                variant: ducks.length,
                pathOffset: (globalT0 + ducks.length * 0.07) % 1.0,
                isMama: false,
                babies: [],
                sex: newSex,
                quackTimer: 0,
              });
              dk.babies.splice(b, 1);
              b--;
            }
          }
        }
      }

      // after 2 hours on page, a female solo duck gets a new baby family
      if (elapsed > 2 * 60 * 60 * 1000) {
        const spawnCandidate = ducks.find(d => !d.isMama && d.sex === 'f' && !d._spawned2h);
        if (spawnCandidate) {
          spawnCandidate._spawned2h = true;
          spawnCandidate.isMama = true;
          for (let b = 0; b < 3; b++) {
            spawnCandidate.babies.push({
              x: spawnCandidate.x - Math.cos(spawnCandidate.heading) * BABY_DIST * (b + 1),
              y: spawnCandidate.y - Math.sin(spawnCandidate.heading) * BABY_DIST * (b + 1),
              heading: spawnCandidate.heading, wobble: b * 1.1,
            });
          }
        }
      }

      // spawn drops
      if (drops.length < MAX_DROPS && Math.random() < 0.025) spawnDrop();

      // bridge: spawn ripple near top of about section
      if (pondBridge.about && Math.random() < 0.008) {
        const aw = pondBridge.about.getW();
        const ah = pondBridge.about.getH();
        if (aw > 0 && pondBridge.about.drops.length < 40) {
          pondBridge.about.drops.push({
            x: Math.random() * aw,
            y: Math.random() * ah * 0.10,
            r: 0, maxR: 30 + Math.random() * 50,
            rings: 2 + Math.floor(Math.random() * 2),
            speed: 0.08 + Math.random() * 0.12,
            peak: 0.03 + Math.random() * 0.04
          });
        }
      }

      requestAnimationFrame(draw);
    };
    draw();
  }


  // ========================================
  // 15b. SHADOWING ACCORDION (one at a time + staircase entrance)
  // ========================================
  {
    const accordion = document.getElementById('shadowingAccordion');
    if (accordion) {
      const groups = accordion.querySelectorAll('.shadow-group');
      groups.forEach(g => {
        g.addEventListener('toggle', () => {
          if (g.open) {
            groups.forEach(o => { if (o !== g) o.open = false; });
          }
        });
      });
      // staircase entrance on scroll
      const stairObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            groups.forEach(g => g.classList.add('stair-in'));
            stairObs.disconnect();
          }
        });
      }, { threshold: 0.2 });
      stairObs.observe(accordion);
    }
  }

  // ========================================
  // 16. SECTION POND BACKGROUNDS
  // ========================================
  // non-grey: ducks + lily pads, no ripples
  // grey (section-alt): ripples only, no ducks
  // about: ducks + lily pads + ripples (bridge to hero)
  const pondSections = ['about', 'research', 'clinical', 'projects', 'leadership', 'publications', 'tools', 'mentorship'];
  const AC = [200, 255, 0];
  const sectionCanvases = [];
  const isMobilePond = window.innerWidth <= 768;

  pondSections.forEach(id => {
    const sec = document.getElementById(id);
    if (!sec) return;
    if (isMobilePond) return; // no section ponds on mobile
    sec.style.position = 'relative';
    sec.style.overflow = 'hidden';

    const cv = document.createElement('canvas');
    sectionCanvases.push(cv);
    cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    sec.insertBefore(cv, sec.firstChild);

    const sctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let sw = 0, sh = 0;

    // compute text content bounding boxes (normalized 0-1) relative to section
    let textBoxes = [];
    const computeTextBoxes = () => {
      textBoxes = [];
      if (sw === 0 || sh === 0) return;
      const secRect = sec.getBoundingClientRect();
      // find meaningful content blocks — go deeper to find about-text and about-stats separately
      const targets = sec.querySelectorAll('.about-grid, .section-label, .section-intro, .research-grid, .clinical-grid, .clinical-grid-1, .clinical-grid-2, .proj-viewer, .service-grid, .pub-scroll, .tools-grid, .mentor-contact-grid, .shadowing-details, .subsection-label');
      if (targets.length > 0) {
        for (const el of targets) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          textBoxes.push({
            l: (r.left - secRect.left) / sw,
            t: (r.top - secRect.top) / sh,
            r: (r.right - secRect.left) / sw,
            b: (r.bottom - secRect.top) / sh,
          });
        }
      } else {
        // fallback: use container children
        const container = sec.querySelector('.container');
        if (!container) return;
        for (const child of container.children) {
          const r = child.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          textBoxes.push({
            l: (r.left - secRect.left) / sw,
            t: (r.top - secRect.top) / sh,
            r: (r.right - secRect.left) / sw,
            b: (r.bottom - secRect.top) / sh,
          });
        }
      }
    };

    const sResize = () => {
      sw = sec.offsetWidth; sh = sec.offsetHeight;
      cv.width = sw * dpr; cv.height = sh * dpr;
      cv.style.width = sw + 'px'; cv.style.height = sh + 'px';
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      computeTextBoxes();
    };
    sResize();
    window.addEventListener('resize', sResize);
    // recompute once fonts loaded
    setTimeout(computeTextBoxes, 500);
    if (id === 'about') {
      pondBridge.about = { drops: sDrops, getW: () => sw, getH: () => sh };
    }

    // helper: check if a normalized point is inside any text box (with padding)
    const insideTextBox = (nx, ny, pad) => {
      for (const tb of textBoxes) {
        if (nx > tb.l - pad && nx < tb.r + pad && ny > tb.t - pad && ny < tb.b + pad) return true;
      }
      return false;
    };

    const isAbout = (id === 'about');
    const isAlt = sec.classList.contains('section-alt');

    // alt sections (grey bg) only get ripples — no ducks or lily pads
    // section lily pads — about gets more (4-6), others (2-4) — avoid text areas
    const sLeaves = [];
    const padCount = isAlt ? 0 : (isAbout ? (3 + Math.floor(Math.random() * 2)) : (1 + Math.floor(Math.random() * 3)));
    for (let i = 0; i < padCount; i++) {
      let lx, ly, attempts = 0;
      do {
        lx = 0.1 + Math.random() * 0.8;
        ly = 0.1 + Math.random() * 0.8;
        attempts++;
      } while (insideTextBox(lx, ly, 0.05) && attempts < 30);
      sLeaves.push({
        x: lx, y: ly,
        size: 10 + Math.random() * 14,
        rot: Math.random() * Math.PI * 2,
        slice: -0.3 + Math.random() * 0.6,
        rotSpd: (Math.random() - 0.5) * 0.0003,
        drift: Math.random() * Math.PI * 2,
        driftSpd: 0.0003 + Math.random() * 0.0003,
        flower: Math.random() < 0.2
      });
    }
    // bridge lily pads near top of about to connect with hero pond
    if (id === 'about') {
      [{ x: 0.12, y: 0.04 }, { x: 0.75, y: 0.05 }, { x: 0.50, y: 0.02 }].forEach(bp => {
        sLeaves.push({
          x: bp.x + (Math.random() - 0.5) * 0.04,
          y: bp.y + Math.random() * 0.02,
          size: 10 + Math.random() * 12,
          rot: Math.random() * Math.PI * 2,
          slice: -0.3 + Math.random() * 0.6,
          rotSpd: (Math.random() - 0.5) * 0.0003,
          drift: Math.random() * Math.PI * 2,
          driftSpd: 0.0003 + Math.random() * 0.0003,
          flower: false
        });
      });
    }

    // cursor tracking for section ducks
    let sCurX = -1, sCurY = -1;
    sec.addEventListener('mousemove', (e) => {
      const r = sec.getBoundingClientRect();
      sCurX = (e.clientX - r.left) / sw;
      sCurY = (e.clientY - r.top) / sh;
    });
    sec.addEventListener('mouseleave', () => { sCurX = -1; sCurY = -1; });

    // section ripples — grey (alt) sections only
    const sDrops = [];
    const sMaxDrops = 35;
    const sSpawn = () => {
      if (!isAlt && id !== 'about') return; // ripples on grey sections + about (bridge)
      let x, y, att = 0;
      do {
        x = Math.random() * sw;
        y = Math.random() * sh;
        att++;
      } while (insideTextBox(x / sw, y / sh, 0.03) && att < 20);
      sDrops.push({
        x, y, r: 0,
        maxR: 25 + Math.random() * 60,
        rings: 2 + Math.floor(Math.random() * 2),
        speed: 0.08 + Math.random() * 0.12,
        peak: 0.03 + Math.random() * 0.05
      });
    };
    if (isAlt || id === 'about') {
      for (let i = 0; i < (id === 'about' ? 8 : 12); i++) {
        sSpawn();
        sDrops[sDrops.length - 1].r = Math.random() * sDrops[sDrops.length - 1].maxR;
      }
    }

    // section ducks — about gets more ducks + Lissajous pathing
    const sDuckSpeed = 0.00035;
    const sDuckMaxTurn = 0.010;
    const sBabyDist = 0.030;
    const sSepDist = 0.08;
    const sPickWP = (fx, fy) => {
      let best = null, bestD = 0;
      for (let i = 0; i < 12; i++) {
        const x = 0.08 + Math.random() * 0.84;
        const y = 0.08 + Math.random() * 0.84;
        if (insideTextBox(x, y, 0.08)) continue;
        const d = Math.hypot(x - (fx || 0.5), y - (fy || 0.5));
        if (d > bestD) { bestD = d; best = { x, y }; }
      }
      return best || { x: 0.8 + Math.random() * 0.15, y: 0.5 };
    };

    // Lissajous parametric path (15-min loop) — section-unique via id hash
    const sPathDur = 15 * 60 * 1000;
    const sPathStart = Date.now();
    // each section gets different frequency set based on id
    const idHash = id.split('').reduce((h, c) => h * 31 + c.charCodeAt(0), 0);
    const sFreqs = [3 + (idHash % 3), 5 + ((idHash >> 2) % 3), 7 + ((idHash >> 4) % 2), 11 + ((idHash >> 6) % 2), 13, 17];
    const sPathPos = (t, v) => {
      const a = Math.PI * 2 * t;
      const vv = v * 0.73;
      return {
        x: 0.50 + 0.46 * Math.sin(a * sFreqs[0] + vv) + 0.10 * Math.sin(a * sFreqs[2] + 1.2 + vv * 1.3) + 0.05 * Math.cos(a * sFreqs[4] + 0.7 - vv * 0.8),
        y: 0.50 + 0.44 * Math.cos(a * sFreqs[1] + 0.8 + vv * 1.1) + 0.10 * Math.cos(a * sFreqs[3] + 2.1 - vv * 0.9) + 0.05 * Math.sin(a * sFreqs[5] + 1.5 + vv * 1.4),
      };
    };

    // spawn position that's definitely outside text boxes
    const safeSpawn = () => {
      // try open areas: top strip, bottom strip, left/right edges
      const zones = [
        () => ({ x: 0.1 + Math.random() * 0.8, y: 0.03 + Math.random() * 0.12 }), // top
        () => ({ x: 0.1 + Math.random() * 0.8, y: 0.85 + Math.random() * 0.12 }), // bottom
        () => ({ x: 0.02 + Math.random() * 0.08, y: 0.2 + Math.random() * 0.6 }), // left edge
        () => ({ x: 0.90 + Math.random() * 0.08, y: 0.2 + Math.random() * 0.6 }), // right edge
      ];
      for (let attempts = 0; attempts < 20; attempts++) {
        const zone = zones[Math.floor(Math.random() * zones.length)];
        const p = zone();
        if (!insideTextBox(p.x, p.y, 0.08)) return p;
      }
      return { x: 0.5, y: 0.92 }; // fallback bottom center
    };

    const secDucks = [];
    if (!isAlt) {
    const mamaPos = safeSpawn();
    const sInitH = Math.random() * Math.PI * 2;
    const sBabies = [];
    for (let b = 0; b < 3; b++) {
      sBabies.push({
        x: mamaPos.x - Math.cos(sInitH) * sBabyDist * (b + 1),
        y: mamaPos.y - Math.sin(sInitH) * sBabyDist * (b + 1),
        heading: sInitH, wobble: b * 1.1,
      });
    }
    // mama duck — always visible
    secDucks.push({
      x: mamaPos.x, y: mamaPos.y,
      heading: sInitH, speed: sDuckSpeed,
      wobble: 0, driftPhase: Math.random() * Math.PI * 2,
      size: 13, isMama: true,
      targetX: 0, targetY: 0,
      babies: sBabies,
      sex: 'f',
      variant: 0, pathOffset: Math.random(),
      restTimer: 0, _kissPartner: -1,
    });
    // about: 4-5 solo adults, others: 2-3 — all spawn in visible areas
    const sSoloCount = isAbout ? (4 + Math.floor(Math.random() * 2)) : (2 + Math.floor(Math.random() * 2));
    for (let si = 0; si < sSoloCount; si++) {
      const sp = safeSpawn();
      const swp = sPickWP(sp.x, sp.y);
      secDucks.push({
        x: sp.x, y: sp.y,
        heading: Math.random() * Math.PI * 2,
        speed: sDuckSpeed * (0.85 + Math.random() * 0.3),
        wobble: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        size: 10 + Math.random() * 3, isMama: false,
        targetX: swp.x, targetY: swp.y,
        babies: [],
        sex: Math.random() < 0.5 ? 'm' : 'f',
        variant: si + 1, pathOffset: (si + 1) * 0.13 + Math.random() * 0.05,
        restTimer: 0, _kissPartner: -1,
      });
    }
    } // end if (!isAlt)

    // section duck drawing (simplified, uses sctx)
    const drawSecDuck = (dx, dy, sz, heading, isBaby, sex) => {
      sctx.save();
      sctx.translate(dx, dy);
      sctx.rotate(heading);

      if (isBaby) {
        const s = sz * 0.40;
        sctx.beginPath();
        sctx.ellipse(-s * 0.08, 0, s * 0.75, s * 0.58, 0, 0, Math.PI * 2);
        sctx.fillStyle = 'rgba(255, 225, 50, 0.50)';
        sctx.fill();
        sctx.beginPath();
        sctx.arc(s * 0.48, 0, s * 0.42, 0, Math.PI * 2);
        sctx.fillStyle = 'rgba(255, 230, 55, 0.55)';
        sctx.fill();
        sctx.beginPath();
        sctx.ellipse(s * 0.82, 0, s * 0.20, s * 0.12, 0, 0, Math.PI * 2);
        sctx.fillStyle = 'rgba(240, 160, 40, 0.50)';
        sctx.fill();
        sctx.beginPath();
        sctx.arc(s * 0.52, -s * 0.18, 0.8, 0, Math.PI * 2);
        sctx.arc(s * 0.52, s * 0.18, 0.8, 0, Math.PI * 2);
        sctx.fillStyle = 'rgba(15, 15, 15, 0.55)';
        sctx.fill();
      } else {
        const s = sz;
        const isMale = sex === 'm';
        // body — male: darker grey-brown; female: warm tawny
        sctx.beginPath();
        sctx.ellipse(-s * 0.05, 0, s * 0.85, s * 0.55, 0, 0, Math.PI * 2);
        sctx.fillStyle = isMale ? 'rgba(120, 110, 90, 0.48)' : 'rgba(180, 140, 70, 0.48)';
        sctx.fill();
        sctx.strokeStyle = isMale ? 'rgba(140, 130, 110, 0.15)' : 'rgba(200, 170, 90, 0.15)';
        sctx.lineWidth = 0.4;
        sctx.stroke();
        // wings
        const wf = isMale ? 'rgba(95, 85, 65, 0.30)' : 'rgba(155, 115, 50, 0.30)';
        sctx.beginPath();
        sctx.ellipse(-s * 0.08, -s * 0.34, s * 0.50, s * 0.20, -0.12, 0, Math.PI * 2);
        sctx.fillStyle = wf;
        sctx.fill();
        sctx.beginPath();
        sctx.ellipse(-s * 0.08, s * 0.34, s * 0.50, s * 0.20, 0.12, 0, Math.PI * 2);
        sctx.fillStyle = wf;
        sctx.fill();
        // tail
        sctx.beginPath();
        sctx.moveTo(-s * 0.8, 0);
        sctx.lineTo(-s * 1.1, -s * 0.08);
        sctx.lineTo(-s * 1.12, 0);
        sctx.lineTo(-s * 1.1, s * 0.08);
        sctx.closePath();
        sctx.fillStyle = isMale ? 'rgba(100, 90, 70, 0.28)' : 'rgba(140, 105, 45, 0.28)';
        sctx.fill();
        // head — male: iridescent green; female: warm brown
        const hx = s * 0.58, hs = s * 0.38;
        sctx.beginPath();
        sctx.arc(hx, 0, hs, 0, Math.PI * 2);
        sctx.fillStyle = isMale ? 'rgba(25, 100, 55, 0.50)' : 'rgba(160, 115, 55, 0.48)';
        sctx.fill();
        // beak
        sctx.beginPath();
        sctx.ellipse(hx + hs * 0.9, 0, hs * 0.38, hs * 0.2, 0, 0, Math.PI * 2);
        sctx.fillStyle = 'rgba(240, 175, 40, 0.50)';
        sctx.fill();
        // eyes
        sctx.beginPath();
        sctx.arc(hx + hs * 0.08, -hs * 0.38, 0.9, 0, Math.PI * 2);
        sctx.arc(hx + hs * 0.08, hs * 0.38, 0.9, 0, Math.PI * 2);
        sctx.fillStyle = 'rgba(15, 15, 15, 0.55)';
        sctx.fill();
        // wake
        for (let w = 0; w < 3; w++) {
          const wo = -s * (1.2 + w * 0.35);
          const ws = s * (0.14 + w * 0.10);
          sctx.beginPath();
          sctx.moveTo(wo, 0); sctx.lineTo(wo - s * 0.2, -ws);
          sctx.moveTo(wo, 0); sctx.lineTo(wo - s * 0.2, ws);
          sctx.strokeStyle = `rgba(200, 255, 0, ${(0.04 - w * 0.01).toFixed(3)})`;
          sctx.lineWidth = 0.4;
          sctx.stroke();
        }
      }
      sctx.restore();
    };

    let sAnimating = false;
    const sDraw = () => {
      if (!sAnimating) return;
      sctx.clearRect(0, 0, sw, sh);

      // ripples
      for (let i = sDrops.length - 1; i >= 0; i--) {
        const d = sDrops[i];
        d.r += d.speed;
        const p = d.r / d.maxR;
        if (p > 1) { sDrops.splice(i, 1); continue; }
        const fade = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88;
        for (let ring = 0; ring < d.rings; ring++) {
          const rr = d.r - ring * (d.maxR / d.rings) * 0.3;
          if (rr <= 0) continue;
          const a = d.peak * fade * (1 - ring * 0.15);
          if (a <= 0.003) continue;
          sctx.beginPath();
          sctx.arc(d.x, d.y, rr, 0, Math.PI * 2);
          const rc = isAlt ? [140, 180, 160] : AC; // softer blue-green on grey sections
          sctx.strokeStyle = `rgba(${rc[0]},${rc[1]},${rc[2]},${a.toFixed(3)})`;
          sctx.lineWidth = ring === 0 ? 0.8 : 0.5;
          sctx.stroke();
        }
      }

      // lily pads
      for (const l of sLeaves) {
        l.rot += l.rotSpd;
        l.drift += l.driftSpd;
        const lx = l.x * sw + Math.sin(l.drift) * 6;
        const ly = l.y * sh + Math.cos(l.drift * 0.7) * 4;

        sctx.save();
        sctx.translate(lx, ly);
        sctx.rotate(l.rot);
        const nw = 0.35;
        const sa = l.slice + nw, ea = l.slice + Math.PI * 2 - nw;

        sctx.beginPath();
        sctx.moveTo(0, 0);
        sctx.arc(2, 2, l.size, sa, ea);
        sctx.closePath();
        sctx.fillStyle = 'rgba(0,0,0,0.18)';
        sctx.fill();

        const g = sctx.createRadialGradient(0, 0, l.size * 0.1, 0, 0, l.size);
        g.addColorStop(0, 'rgba(50,90,30,0.35)');
        g.addColorStop(1, 'rgba(25,55,15,0.22)');
        sctx.beginPath();
        sctx.moveTo(0, 0);
        sctx.arc(0, 0, l.size, sa, ea);
        sctx.closePath();
        sctx.fillStyle = g;
        sctx.fill();

        sctx.beginPath();
        sctx.arc(0, 0, l.size, sa, ea);
        sctx.strokeStyle = `rgba(${AC[0]},${AC[1]},${AC[2]},0.10)`;
        sctx.lineWidth = 0.7;
        sctx.stroke();

        sctx.restore();
      }

      // section ducks — all adults with steering + avoidance
      const sElapsed = Date.now() - sPathStart;
      for (let sdi = 0; sdi < secDucks.length; sdi++) {
        const sd = secDucks[sdi];
        sd.wobble += 0.008;
        sd.driftPhase += 0.004;

        // rest + kiss behavior for section ducks
        if (sd.restTimer > 0) {
          sd.restTimer--;
          if (sd._kissPartner >= 0) {
            const sp = secDucks[sd._kissPartner];
            if (sp.restTimer > 0 && sp._kissPartner === sdi) {
              sd.heading = Math.atan2(sp.y - sd.y, sp.x - sd.x);
              const dist = Math.hypot(sd.x - sp.x, sd.y - sp.y);
              const touchDist = (sd.size + sp.size) * 1.5 / sw;
              if (dist > touchDist) {
                sd.x += (sp.x - sd.x) * 0.03;
                sd.y += (sp.y - sd.y) * 0.03;
              }
            }
          }
          drawSecDuck(sd.x * sw, sd.y * sh, sd.size, sd.heading, false, sd.sex);
          if (sd._kissPartner >= 0 && sd.restTimer > 30) {
            const sp = secDucks[sd._kissPartner];
            if (sp.restTimer > 0 && sp._kissPartner === sdi) {
              const mx = (sd.x + sp.x) / 2;
              const my = (sd.y + sp.y) / 2;
              const heartPhase = (sd.restTimer % 60) / 60;
              const hy = my * sh - sd.size * 2.2 - Math.sin(heartPhase * Math.PI * 2) * 3;
              const hx = mx * sw;
              const hsz = 2.5;
              const hAlpha = Math.min(1, (sd.restTimer - 30) / 60) * 0.6;
              sctx.save();
              sctx.translate(hx, hy);
              sctx.beginPath();
              sctx.moveTo(0, hsz * 0.3);
              sctx.bezierCurveTo(-hsz, -hsz * 0.5, -hsz * 0.2, -hsz * 1.2, 0, -hsz * 0.4);
              sctx.bezierCurveTo(hsz * 0.2, -hsz * 1.2, hsz, -hsz * 0.5, 0, hsz * 0.3);
              sctx.fillStyle = `rgba(255, 100, 120, ${hAlpha.toFixed(2)})`;
              sctx.fill();
              sctx.restore();
            }
          }
          // still draw babies if mama is resting
          for (let b = 0; b < sd.babies.length; b++) {
            const baby = sd.babies[b];
            drawSecDuck(baby.x * sw, baby.y * sh, sd.size, baby.heading, true, sd.sex);
          }
          continue;
        }
        if (!sd.isMama && Math.random() < 0.0003) {
          sd._kissPartner = -1;
          for (let j = 0; j < secDucks.length; j++) {
            if (j === sdi) continue;
            const nd = secDucks[j];
            if (nd.isMama || nd.restTimer > 0) continue;
            if (nd.sex === sd.sex) continue;
            if (Math.hypot(sd.x - nd.x, sd.y - nd.y) < 0.15) {
              const duration = 150 + Math.floor(Math.random() * 200);
              sd.restTimer = duration;
              nd.restTimer = duration;
              sd._kissPartner = j;
              nd._kissPartner = sdi;
              break;
            }
          }
        }

        // Lissajous parametric pathing — unique per section via id hash
        const sPathT = (sd.pathOffset + sElapsed / sPathDur) % 1.0;
        const sTarget = sPathPos(sPathT, sd.variant + id.charCodeAt(0) * 0.1);
        const sddx = sTarget.x - sd.x;
        const sddy = sTarget.y - sd.y;

        // fallback waypoint if parametric target is inside text
        if (insideTextBox(sTarget.x, sTarget.y, 0.08)) {
          // skip toward parametric path, pick a safe waypoint instead
          if (Math.hypot(sd.targetX - sd.x, sd.targetY - sd.y) < 0.10 || insideTextBox(sd.targetX, sd.targetY, 0.08)) {
            const wp = sPickWP(sd.x, sd.y);
            sd.targetX = wp.x; sd.targetY = wp.y;
          }
          const fbx = sd.targetX - sd.x, fby = sd.targetY - sd.y;
          const fbDesired = Math.atan2(fby, fbx);
          let fbDiff = fbDesired - sd.heading;
          while (fbDiff > Math.PI) fbDiff -= Math.PI * 2;
          while (fbDiff < -Math.PI) fbDiff += Math.PI * 2;
          sd.heading += Math.max(-sDuckMaxTurn, Math.min(sDuckMaxTurn, fbDiff * 0.025));
        } else {
          const sDesired = Math.atan2(sddy, sddx);
          let sDiff = sDesired - sd.heading;
          while (sDiff > Math.PI) sDiff -= Math.PI * 2;
          while (sDiff < -Math.PI) sDiff += Math.PI * 2;
          sd.heading += Math.max(-sDuckMaxTurn, Math.min(sDuckMaxTurn, sDiff * 0.025));
        }

        // avoidance forces
        let sAvX = 0, sAvY = 0;

        // wall avoidance (about section: weaker top wall so ducks swim near hero boundary)
        const SW = 0.10;
        if (sd.x < SW) sAvX += Math.pow((SW - sd.x) / SW, 0.5) * 1.5;
        if (sd.x > 1 - SW) sAvX -= Math.pow((sd.x - (1 - SW)) / SW, 0.5) * 1.5;
        if (sd.y < SW) sAvY += Math.pow((SW - sd.y) / SW, 0.5) * (isAbout ? 0.3 : 1.5);
        if (sd.y > 1 - SW) sAvY -= Math.pow((sd.y - (1 - SW)) / SW, 0.5) * 1.5;

        // separation from other section ducks
        for (let sj = 0; sj < secDucks.length; sj++) {
          if (sj === sdi) continue;
          const o = secDucks[sj];
          const dx = sd.x - o.x, dy = sd.y - o.y;
          const d = Math.hypot(dx, dy);
          if (d < sSepDist && d > 0) {
            const str = Math.pow((sSepDist - d) / sSepDist, 0.5);
            sAvX += (dx / d) * str * 3.0;
            sAvY += (dy / d) * str * 3.0;
          }
          // avoid other ducks' babies
          for (const baby of o.babies) {
            const bx = sd.x - baby.x, by = sd.y - baby.y;
            const bd = Math.hypot(bx, by);
            if (bd < sSepDist && bd > 0) {
              const str = Math.pow((sSepDist - bd) / sSepDist, 0.5);
              sAvX += (bx / bd) * str * 3.0;
              sAvY += (by / bd) * str * 3.0;
            }
          }
        }
        // mama avoids own babies too
        for (const baby of sd.babies) {
          const bx = sd.x - baby.x, by = sd.y - baby.y;
          const bd = Math.hypot(bx, by);
          if (bd < sSepDist * 0.6 && bd > 0) {
            const str = Math.pow((sSepDist * 0.6 - bd) / (sSepDist * 0.6), 0.5);
            sAvX += (bx / bd) * str * 2.0;
            sAvY += (by / bd) * str * 2.0;
          }
        }

        // lily pad avoidance
        const sIsMama = sd.isMama && sd.babies.length > 0;
        for (const l of sLeaves) {
          const lpx = l.x + Math.sin(l.drift) * 6 / sw;
          const lpy = l.y + Math.cos(l.drift * 0.7) * 4 / sh;
          const lR = sIsMama ? (l.size + 50) : (l.size + 30);
          const avR = lR / Math.min(sw, sh);
          const dist = Math.hypot(sd.x - lpx, sd.y - lpy);
          if (dist < avR && dist > 0) {
            const str = Math.pow((avR - dist) / avR, 0.5);
            const lf = sIsMama ? 5.0 : 1.5;
            sAvX += ((sd.x - lpx) / dist) * str * lf;
            sAvY += ((sd.y - lpy) / dist) * str * lf;
          }
        }

        // cursor avoidance
        if (sCurX > 0 && sCurY > 0) {
          const scAvR = 0.28;
          const scDist = Math.hypot(sd.x - sCurX, sd.y - sCurY);
          if (scDist < scAvR && scDist > 0) {
            const str = Math.pow((scAvR - scDist) / scAvR, 0.4);
            sAvX += ((sd.x - sCurX) / scDist) * str * 6.0;
            sAvY += ((sd.y - sCurY) / scDist) * str * 6.0;
            sd.speed = Math.max(sd.speed, sDuckSpeed * (2.0 + str * 2.0));
          }
        }

        // text box avoidance — wide buffer so ducks never overlap text
        const sTB = 0.12;
        for (const tb of textBoxes) {
          const cpx = Math.min(Math.max(sd.x, tb.l), tb.r);
          const cpy = Math.min(Math.max(sd.y, tb.t), tb.b);
          const tbDist = Math.hypot(sd.x - cpx, sd.y - cpy);
          if (tbDist < sTB && tbDist > 0) {
            const str = Math.pow((sTB - tbDist) / sTB, 0.5);
            sAvX += ((sd.x - cpx) / tbDist) * str * 10.0;
            sAvY += ((sd.y - cpy) / tbDist) * str * 10.0;
          }
          // hard push if inside text box
          if (sd.x > tb.l - 0.02 && sd.x < tb.r + 0.02 && sd.y > tb.t - 0.02 && sd.y < tb.b + 0.02) {
            const cx = (tb.l + tb.r) / 2, cy = (tb.t + tb.b) / 2;
            const pushDx = sd.x - cx, pushDy = sd.y - cy;
            const pushD = Math.hypot(pushDx, pushDy) || 0.01;
            sAvX += (pushDx / pushD) * 15.0;
            sAvY += (pushDy / pushD) * 15.0;
          }
        }

        const sAM = Math.hypot(sAvX, sAvY);
        if (sAM > 0.01) {
          const sAA = Math.atan2(sAvY, sAvX);
          let sAD = sAA - sd.heading;
          while (sAD > Math.PI) sAD -= Math.PI * 2;
          while (sAD < -Math.PI) sAD += Math.PI * 2;
          sd.heading += Math.sign(sAD) * Math.min(Math.abs(sAD), sDuckMaxTurn * 4 * Math.min(sAM, 1.5));
        }

        // anti-trap: if mama stuck (barely moving), teleport toward center
        if (sd.isMama) {
          if (!sd._prevX) { sd._prevX = sd.x; sd._prevY = sd.y; sd._stuckFrames = 0; }
          if (Math.hypot(sd.x - sd._prevX, sd.y - sd._prevY) < 0.0002) {
            sd._stuckFrames++;
            if (sd._stuckFrames > 45) { // stuck for ~0.75 sec
              // jolt heading + nudge toward center of open area
              sd.heading += (Math.random() - 0.5) * Math.PI * 1.5;
              const cx = 0.5, cy = 0.5;
              sd.x += (cx - sd.x) * 0.08;
              sd.y += (cy - sd.y) * 0.08;
              sd._stuckFrames = 0;
            }
          } else {
            sd._stuckFrames = 0;
          }
          sd._prevX = sd.x; sd._prevY = sd.y;
        }

        sd.x += Math.cos(sd.heading) * sd.speed;
        sd.y += Math.sin(sd.heading) * sd.speed;
        const sdAmt = Math.sin(sd.driftPhase) * 0.00015;
        sd.x += Math.cos(sd.heading + Math.PI / 2) * sdAmt;
        sd.y += Math.sin(sd.heading + Math.PI / 2) * sdAmt;
        sd.x = Math.max(0.03, Math.min(0.97, sd.x));
        sd.y = Math.max(0.03, Math.min(0.97, sd.y));

        drawSecDuck(sd.x * sw, sd.y * sh, sd.size, sd.heading, false, sd.sex);

        // baby ducks follow
        for (let b = 0; b < sd.babies.length; b++) {
          const baby = sd.babies[b];
          const leader = b === 0 ? sd : sd.babies[b - 1];
          const bdx = leader.x - baby.x;
          const bdy = leader.y - baby.y;
          const bdist = Math.hypot(bdx, bdy);
          if (bdist > sBabyDist) {
            const tx = leader.x - (bdx / bdist) * sBabyDist;
            const ty = leader.y - (bdy / bdist) * sBabyDist;
            const follow = 0.08 + Math.min((bdist - sBabyDist) * 5, 0.18);
            baby.x += (tx - baby.x) * follow;
            baby.y += (ty - baby.y) * follow;
          }
          if (bdist > 0.002) {
            const dh = Math.atan2(bdy, bdx);
            let hd = dh - baby.heading;
            while (hd > Math.PI) hd -= Math.PI * 2;
            while (hd < -Math.PI) hd += Math.PI * 2;
            baby.heading += hd * 0.12;
          }
          drawSecDuck(baby.x * sw, baby.y * sh, sd.size, baby.heading, true, sd.sex);
        }
      }

      if (sDrops.length < sMaxDrops && Math.random() < 0.07) sSpawn();
      // bridge: spawn ripple near bottom of hero from about section
      if (id === 'about' && pondBridge.hero && Math.random() < 0.006) {
        const hw = pondBridge.hero.getW();
        const hh = pondBridge.hero.getH();
        if (hw > 0 && pondBridge.hero.drops.length < 25) {
          pondBridge.hero.drops.push({
            x: Math.random() * hw,
            y: hh * (0.88 + Math.random() * 0.10),
            r: 0, maxR: 40 + Math.random() * 60,
            rings: 2 + Math.floor(Math.random() * 3),
            speed: 0.10 + Math.random() * 0.15,
            peakAlpha: 0.04 + Math.random() * 0.06
          });
        }
      }
      requestAnimationFrame(sDraw);
    };

    // only animate when section is near viewport, pause when not
    const sObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !sAnimating) {
          sAnimating = true;
          sDraw();
        } else if (!e.isIntersecting) {
          sAnimating = false;
        }
      });
    }, { rootMargin: '200px' });
    sObs.observe(sec);
  });

});
