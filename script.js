document.addEventListener('DOMContentLoaded', () => {

  // navbar blur on scroll
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // mobile nav
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // highlight current section in nav
  const sections = document.querySelectorAll('section[id]');
  const navLinkElements = document.querySelectorAll('.nav-link');

  const updateActiveLink = () => {
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinkElements.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // stat counter
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const animateStats = () => {
    if (statsAnimated) return;
    const statsSection = document.querySelector('.hero-stats');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    statsAnimated = true;
    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 1500;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  };

  window.addEventListener('scroll', animateStats, { passive: true });
  animateStats();

  // fade in elements on scroll
  const fadeElements = document.querySelectorAll(
    '.hero-card, .pricing-card, .testimonial-card, .yt-card, .timeline-item, .skill-tag, .contact-card'
  );

  fadeElements.forEach(el => el.classList.add('fade-in'));

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), index * 60);
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // yt links
  const ytEmbed = document.getElementById('ytEmbed');
  if (ytEmbed) {
    ytEmbed.addEventListener('click', () => {
      window.open('https://youtube.com/@theoverzealouspremed', '_blank');
    });
  }

  document.querySelectorAll('.yt-card').forEach(card => {
    card.addEventListener('click', () => {
      window.open('https://youtube.com/@theoverzealouspremed', '_blank');
    });
  });

  // contact form
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: hook up to formspree or whatever backend
      const formData = new FormData(contactForm);
      console.log('Form submitted:', Object.fromEntries(formData));

      formSuccess.classList.add('show');
      contactForm.reset();
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    });
  }

  // smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

  // subtle parallax on hero cards (desktop only)
  if (window.matchMedia('(min-width: 1024px)').matches) {
    const heroCards = document.querySelectorAll('.hero-card');
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      heroCards.forEach((card, i) => {
        const factor = (i + 1) * 3;
        card.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
  }

});
