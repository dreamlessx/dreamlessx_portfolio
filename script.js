document.addEventListener('DOMContentLoaded', () => {

  // -- inject animation styles --
  const style = document.createElement('style');
  style.textContent = `
    .hero-tag, .hero-title, .hero-links {
      opacity: 0; transform: translateY(24px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .hero-tag.revealed, .hero-title.revealed, .hero-links.revealed {
      opacity: 1; transform: translateY(0);
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
    'sleeping zzz!',
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
      const settleDur = 300;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        if (elapsed < duration) {
          // count up to overshoot
          const progress = elapsed / duration;
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * overshoot).toLocaleString() + suffix;
          requestAnimationFrame(step);
        } else if (elapsed < duration + settleDur) {
          // settle from overshoot back to target
          const settleProgress = (elapsed - duration) / settleDur;
          // ease out for settle
          const eased = settleProgress * (2 - settleProgress);
          const current = Math.round(overshoot - (overshoot - target) * eased);
          el.textContent = current.toLocaleString() + suffix;
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
          const rngMin = el.dataset.rngMin;
          const rngMax = el.dataset.rngMax;

          // RNG stats
          if (rngMin !== undefined) {
            const min = parseInt(rngMin);
            const max = parseInt(rngMax);

            // notifications always 0
            if (min === 0 && max === 0) {
              el.textContent = '0';
              return;
            }

            // terminal windows: changes every 6 hours based on hour of day
            const updateRngByHour = () => {
              const hour = new Date().getHours();
              const seed = Math.floor(hour / 6);
              // deterministic-ish value from seed within range
              const range = max - min + 1;
              const val = min + ((seed * 7 + 3) % range);
              el.textContent = val;
            };
            updateRngByHour();
            // check every 60s in case the 6-hour window flips
            setInterval(updateRngByHour, 60000);
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
  // 10. PROJECTS CAROUSEL
  // ========================================
  const featuredCard = document.querySelector('.project-card-featured');
  const smallCards = document.querySelectorAll('.project-small');
  const prevBtn = document.querySelector('.proj-prev');
  const nextBtn = document.querySelector('.proj-next');

  if (featuredCard && smallCards.length > 0) {
    let currentSmallIdx = -1; // -1 means featured is the original

    // store original featured content
    const originalFeatured = {
      status: featuredCard.querySelector('.project-status')?.textContent || '',
      title: featuredCard.querySelector('h3')?.textContent || '',
      sub: featuredCard.querySelector('.project-sub')?.textContent || '',
      desc: '',
      tech: [],
      vision: '',
    };

    const descEl = featuredCard.querySelector('p:not(.project-sub):not(.project-vision)');
    if (descEl) originalFeatured.desc = descEl.textContent;
    const visionEl = featuredCard.querySelector('.project-vision');
    if (visionEl) originalFeatured.vision = visionEl.innerHTML;
    const techEls = featuredCard.querySelectorAll('.project-tech span');
    techEls.forEach(s => originalFeatured.tech.push(s.textContent));

    // extract data from small cards
    const smallData = Array.from(smallCards).map(card => ({
      status: card.querySelector('.project-status')?.textContent || '',
      title: card.querySelector('h4')?.textContent || '',
      desc: '',
      tech: [],
    }));
    smallCards.forEach((card, i) => {
      const p = card.querySelector('p:not(.project-status)');
      if (p) smallData[i].desc = p.textContent;
      card.querySelectorAll('.project-tech span').forEach(s => smallData[i].tech.push(s.textContent));
    });

    const swapToFeatured = (data, isOriginal) => {
      featuredCard.classList.add('crossfade-out');

      setTimeout(() => {
        const statusEl = featuredCard.querySelector('.project-status');
        const titleEl = featuredCard.querySelector('h3');
        const subEl = featuredCard.querySelector('.project-sub');
        const descNode = featuredCard.querySelector('p:not(.project-sub):not(.project-vision)');
        const techContainer = featuredCard.querySelector('.project-tech');
        const visionNode = featuredCard.querySelector('.project-vision');

        if (statusEl) statusEl.textContent = data.status;
        if (titleEl) titleEl.textContent = isOriginal ? data.title : data.title;

        if (isOriginal) {
          if (subEl) { subEl.textContent = data.sub; subEl.style.display = ''; }
          if (descNode) descNode.textContent = data.desc;
          if (techContainer) {
            techContainer.innerHTML = '';
            data.tech.forEach(t => {
              const span = document.createElement('span');
              span.textContent = t;
              techContainer.appendChild(span);
            });
          }
          if (visionNode) { visionNode.innerHTML = data.vision; visionNode.style.display = ''; }
        } else {
          if (subEl) { subEl.textContent = ''; subEl.style.display = 'none'; }
          if (descNode) descNode.textContent = data.desc;
          if (techContainer) {
            techContainer.innerHTML = '';
            data.tech.forEach(t => {
              const span = document.createElement('span');
              span.textContent = t;
              techContainer.appendChild(span);
            });
          }
          if (visionNode) { visionNode.innerHTML = ''; visionNode.style.display = 'none'; }
        }

        featuredCard.classList.remove('crossfade-out');
        featuredCard.classList.add('crossfade-in');
        setTimeout(() => featuredCard.classList.remove('crossfade-in'), 350);
      }, 350);
    };

    // clicking small cards swaps with featured
    smallCards.forEach((card, idx) => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (currentSmallIdx === idx) return;
        currentSmallIdx = idx;
        swapToFeatured(smallData[idx], false);
      });
    });

    // arrow buttons cycle through small cards
    const cycleFeatured = (direction) => {
      if (smallCards.length === 0) return;
      if (currentSmallIdx === -1) {
        currentSmallIdx = direction === 1 ? 0 : smallCards.length - 1;
      } else {
        currentSmallIdx += direction;
        if (currentSmallIdx >= smallCards.length) {
          currentSmallIdx = -1;
        } else if (currentSmallIdx < -1) {
          currentSmallIdx = smallCards.length - 1;
        }
      }

      if (currentSmallIdx === -1) {
        swapToFeatured(originalFeatured, true);
      } else {
        swapToFeatured(smallData[currentSmallIdx], false);
      }
    };

    if (prevBtn) prevBtn.addEventListener('click', () => cycleFeatured(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => cycleFeatured(1));
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
  if (form && success) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      form.classList.add('hiding');
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('show');
      }, 400);
    });
  }

});
