document.addEventListener('DOMContentLoaded', () => {

  // -- inject animation styles --
  const style = document.createElement('style');
  style.textContent = `
    .hero-tag, .hero-title, .hero-sub, .hero-links {
      opacity: 0; transform: translateY(24px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .hero-tag.revealed, .hero-title.revealed, .hero-sub.revealed, .hero-links.revealed {
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
    .hero-typing-cursor { animation: blink-cursor 0.8s step-end infinite; }
    @keyframes blink-cursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  `;
  document.head.appendChild(style);


  // -- status bar rotation --
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
    setInterval(() => {
      msgIdx = (msgIdx + 1) % statusMessages.length;
      statusText.style.opacity = '0';
      statusText.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        statusText.textContent = statusMessages[msgIdx];
        statusText.style.opacity = '1';
      }, 300);
    }, 3000);
  }


  // -- nav scroll --
  const nav = document.getElementById('nav');
  const statusBar = document.querySelector('.status-bar');
  const onNavScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    if (statusBar) {
      if (window.scrollY > 100) {
        statusBar.style.transform = 'translateY(-100%)';
        statusBar.style.transition = 'transform 0.3s ease';
        nav.style.top = '0';
      } else {
        statusBar.style.transform = 'translateY(0)';
        nav.style.top = '33px';
      }
    }
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();


  // -- mobile nav --
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
  links.querySelectorAll('a').forEach(l => l.addEventListener('click', () => { toggle.classList.remove('open'); links.classList.remove('open'); }));


  // -- hero reveal --
  const heroEls = ['.hero-tag', '.hero-title', '.hero-sub', '.hero-links'];
  heroEls.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (el) setTimeout(() => el.classList.add('revealed'), 200 + i * 150);
  });


  // -- hero typing description --
  const heroTyping = document.getElementById('heroTyping');
  if (heroTyping) {
    const fullText = "junior. uw. biochemistry + neuroscience. two active labs, three institutions, and an unreasonable number of terminal windows. this summer i'm headed to harvard medical school. long term? maybe a surgeon. maybe a scientist. probably both.";
    let idx = 0;
    heroTyping.innerHTML = '<span class="hero-typing-cursor">|</span>';
    const typeHero = () => {
      if (idx < fullText.length) {
        heroTyping.innerHTML = fullText.slice(0, idx + 1) + '<span class="hero-typing-cursor">|</span>';
        idx++;
        setTimeout(typeHero, 25 + Math.random() * 15);
      } else {
        heroTyping.innerHTML = fullText;
      }
    };
    setTimeout(typeHero, 1000);
  }


  // -- scroll animations --
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
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); scrollObs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => scrollObs.observe(el));


  // -- active nav --
  const navLinks = document.querySelectorAll('#navLinks a[href^="#"]');
  const sections = Array.from(navLinks).map(l => ({ link: l, el: document.getElementById(l.getAttribute('href').slice(1)) })).filter(s => s.el);
  let activeLink = null;
  const updateNav = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    let cur = null;
    for (let i = sections.length - 1; i >= 0; i--) { if (sections[i].el.offsetTop <= y) { cur = sections[i].link; break; } }
    if (cur !== activeLink) { if (activeLink) activeLink.classList.remove('active'); if (cur) cur.classList.add('active'); activeLink = cur; }
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();


  // -- stat counters with overshoot --
  const statNums = document.querySelectorAll('.stat-num');
  let statsAnimated = false;

  const animateStat = (el, target, overshoot, suffix, delay) => {
    setTimeout(() => {
      const duration = target > 100 ? 1500 : 800;
      const overshootDur = 200;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        if (elapsed < duration) {
          const progress = elapsed / duration;
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * overshoot);
          el.textContent = current.toLocaleString() + suffix;
          requestAnimationFrame(step);
        } else if (elapsed < duration + overshootDur) {
          const overProgress = (elapsed - duration) / overshootDur;
          const current = Math.round(overshoot - (overshoot - target) * overProgress);
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

          if (rngMin !== undefined) {
            const min = parseInt(rngMin);
            const max = parseInt(rngMax);
            const updateRng = () => {
              el.textContent = Math.floor(Math.random() * (max - min + 1)) + min;
            };
            updateRng();
            setInterval(updateRng, 3000 + Math.random() * 2000);
            return;
          }

          let target = parseInt(el.dataset.target || '0');
          const overshoot = parseInt(el.dataset.overshoot || target);
          const suffix = el.dataset.suffix || '';
          const autoInc = parseFloat(el.dataset.autoIncrement || '0');
          const baseDate = el.dataset.baseDate;

          if (autoInc && baseDate) {
            const days = (Date.now() - new Date(baseDate).getTime()) / 86400000;
            target += Math.floor(days * autoInc);
          }

          animateStat(el, target, overshoot + (target - parseInt(el.dataset.target || '0')), suffix, i * 80);
        });

        statsObs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const aboutStats = document.getElementById('aboutStats');
  if (aboutStats) statsObs.observe(aboutStats);


  // -- cursor glow --
  const hero = document.querySelector('.hero');
  if (hero && !('ontouchstart' in window)) {
    const glow = document.createElement('div');
    glow.classList.add('hero-glow');
    document.body.appendChild(glow);
    let glowVis = false, rafId = null;
    hero.addEventListener('mouseenter', () => { glowVis = true; glow.classList.add('visible'); });
    hero.addEventListener('mouseleave', () => { glowVis = false; glow.classList.remove('visible'); });
    hero.addEventListener('mousemove', e => {
      if (!glowVis || rafId) return;
      rafId = requestAnimationFrame(() => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; rafId = null; });
    });
  }


  // -- scroll cat --
  const catEl = document.getElementById('scrollCat');
  const catSprite = document.getElementById('catSprite');
  if (catEl && catSprite) {
    let lastScroll = window.scrollY;
    let scrollTimer = null;
    let catState = 'idle';

    const setCatState = (state) => {
      if (state === catState) return;
      catState = state;
      catSprite.className = 'cat-sprite cat-' + state;
    };

    setCatState('idle');

    window.addEventListener('scroll', () => {
      const dir = window.scrollY > lastScroll ? 'right' : 'left';
      lastScroll = window.scrollY;
      setCatState('run-' + dir);

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setCatState('idle');
        // after 5s idle, sleep
        setTimeout(() => { if (catState === 'idle') setCatState('sleep'); }, 5000);
      }, 150);
    }, { passive: true });

    // start sleeping after initial idle
    setTimeout(() => { if (catState === 'idle') setCatState('sleep'); }, 3000);
  }


  // -- form --
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form && success) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      form.classList.add('hiding');
      setTimeout(() => { form.style.display = 'none'; success.classList.add('show'); }, 400);
    });
  }

});
