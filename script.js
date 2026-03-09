document.addEventListener('DOMContentLoaded', () => {

  // -- inject animation styles (all JS-driven, no styles.css edits) --
  const style = document.createElement('style');
  style.textContent = `
    .hero-tag, .hero-title, .hero-sub, .hero-links {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hero-tag.revealed, .hero-title.revealed,
    .hero-sub.revealed, .hero-links.revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .nav-links a {
      position: relative;
    }
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1.5px;
      background: var(--accent);
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-links a.active {
      color: var(--text);
    }
    .nav-links a.active::after {
      width: 100%;
    }
    .contact-form {
      transition: opacity 0.4s ease, transform 0.4s ease;
    }
    .contact-form.hiding {
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
    }
    .form-success {
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s;
    }
    .form-success.show {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }
    .hero-glow {
      position: fixed;
      pointer-events: none;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      z-index: 1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .hero-glow.visible {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);


  // -- nav scroll effect --
  const nav = document.getElementById('nav');
  const onNavScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();


  // -- mobile nav toggle --
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });


  // -- hero text reveal --
  const heroElements = ['.hero-tag', '.hero-title', '.hero-sub', '.hero-links'];
  heroElements.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    setTimeout(() => el.classList.add('revealed'), 200 + i * 150);
  });


  // -- staggered scroll animations via IntersectionObserver --
  const sectionChildSelectors =
    '.section-label, .section-intro, .about-grid, .about-text > p, ' +
    '.research-card, .project-hero, .project-title, .project-tagline, .project-body, ' +
    '.clinical-card, .shadowing, .shadowing-item, ' +
    '.service, .service-item, .mentorship-intro, .mentorship-intro .lead, ' +
    '.pricing-card, .yt-cta, .contact-text, .contact-form';

  document.querySelectorAll('.section').forEach(section => {
    const children = section.querySelectorAll(sectionChildSelectors);
    children.forEach((el, i) => {
      if (el.classList.contains('fade-in')) return;
      el.classList.add('fade-in');
      el.style.transitionDelay = `${i * 0.06}s`;
    });
  });

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => scrollObserver.observe(el));


  // -- active nav highlighting on scroll --
  const navLinks = document.querySelectorAll('#navLinks a[href^="#"]');
  const sections = Array.from(navLinks).map(link => {
    const id = link.getAttribute('href').slice(1);
    return { link, el: document.getElementById(id) };
  }).filter(s => s.el);

  let activeLink = null;
  const updateActiveNav = () => {
    const scrollY = window.scrollY + window.innerHeight * 0.35;

    let current = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].el.offsetTop <= scrollY) {
        current = sections[i].link;
        break;
      }
    }

    if (current !== activeLink) {
      if (activeLink) activeLink.classList.remove('active');
      if (current) current.classList.add('active');
      activeLink = current;
    }
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();


  // -- stat counter animation --
  const parseStatValue = (text) => {
    const cleaned = text.replace(/,/g, '');
    const match = cleaned.match(/^(\d+)/);
    if (!match) return null;
    const num = parseInt(match[1], 10);
    const suffix = text.replace(/[\d,]/g, '').trim();
    return { num, suffix, original: text };
  };

  const animateCounter = (el, target, duration) => {
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statNums = document.querySelectorAll('.stat-num');
  const statData = new Map();

  statNums.forEach(el => {
    const parsed = parseStatValue(el.textContent);
    if (parsed) {
      statData.set(el, parsed);
      el.textContent = '0';
    }
  });

  let statsAnimated = false;
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statNums.forEach((el, i) => {
          const data = statData.get(el);
          if (!data) return;
          setTimeout(() => {
            const duration = data.num > 100 ? 1200 : 800;
            const startTime = performance.now();
            const step = (now) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(eased * data.num);
              el.textContent = current.toLocaleString() + data.suffix;
              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                el.textContent = data.original;
              }
            };
            requestAnimationFrame(step);
          }, i * 100);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const aboutStats = document.querySelector('.about-stats');
  if (aboutStats) statsObserver.observe(aboutStats);


  // -- subtle cursor glow on hero section --
  const hero = document.querySelector('.hero');
  if (hero) {
    const glow = document.createElement('div');
    glow.classList.add('hero-glow');
    document.body.appendChild(glow);

    let glowVisible = false;
    let rafId = null;

    hero.addEventListener('mouseenter', () => {
      glowVisible = true;
      glow.classList.add('visible');
    });

    hero.addEventListener('mouseleave', () => {
      glowVisible = false;
      glow.classList.remove('visible');
    });

    hero.addEventListener('mousemove', (e) => {
      if (!glowVisible) return;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        rafId = null;
      });
    });

    // hide glow on touch devices
    if ('ontouchstart' in window) {
      glow.style.display = 'none';
    }
  }


  // -- form UX: smooth submit transition --
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.classList.add('hiding');

      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('show');
      }, 400);
    });
  }


  // -- typing cat code animation --
  const catCode = document.querySelector('.cat-code');
  if (catCode) {
    const lines = [
      'import brain',
      'from lab import *',
      '',
      'def research():',
      '  neurons = scan()',
      '  proteins = fold()',
      '  return magic',
      '',
      '# TODO: sleep',
      '# TODO: touch grass',
      'while True:',
      '  research()',
      '  coffee += 1',
    ];
    let lineIdx = 0;
    let charIdx = 0;
    let currentText = '';

    const typeChar = () => {
      if (lineIdx >= lines.length) {
        lineIdx = 0;
        charIdx = 0;
        currentText = '';
      }

      const line = lines[lineIdx];
      if (charIdx <= line.length) {
        const display = currentText + line.slice(0, charIdx) + '_';
        catCode.textContent = display;
        charIdx++;
        setTimeout(typeChar, 60 + Math.random() * 80);
      } else {
        currentText += line + '\n';
        // keep last 8 lines visible
        const displayLines = currentText.split('\n');
        if (displayLines.length > 8) {
          currentText = displayLines.slice(-8).join('\n');
        }
        lineIdx++;
        charIdx = 0;
        setTimeout(typeChar, 300 + Math.random() * 200);
      }
    };

    setTimeout(typeChar, 1200);
  }


  // -- status bar scroll hide --
  const statusBar = document.querySelector('.status-bar');
  const navEl = document.getElementById('nav');
  if (statusBar && navEl) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        statusBar.style.transform = 'translateY(-100%)';
        statusBar.style.transition = 'transform 0.3s ease';
        navEl.style.top = '0';
        navEl.style.transition = 'top 0.3s ease, padding 0.2s ease, background 0.2s ease';
      } else {
        statusBar.style.transform = 'translateY(0)';
        navEl.style.top = '33px';
      }
      lastScroll = window.scrollY;
    }, { passive: true });
  }

});
