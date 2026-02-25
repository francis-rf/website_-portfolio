/* ══════════════════════════════════════════════════════
   PORTFOLIO — script.js
   Handles: particles · typewriter · scroll reveals
            countUp · 3D tilt · active nav · hamburger
══════════════════════════════════════════════════════ */

/* ── 1. PARTICLES ──────────────────────────────────── */
function initParticles() {
  if (typeof tsParticles === 'undefined') return;

  tsParticles.load('tsparticles', {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: {
        value: 70,
        density: { enable: true, area: 900 }
      },
      color: { value: '#00f5ff' },
      shape: { type: 'circle' },
      opacity: {
        value: 0.45,
        random: { enable: true, minimumValue: 0.1 }
      },
      size: {
        value: { min: 1, max: 2.5 }
      },
      links: {
        enable: true,
        distance: 140,
        color: '#00f5ff',
        opacity: 0.18,
        width: 1
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' }
      }
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
        onClick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        repulse: { distance: 90, duration: 0.4 },
        push:    { quantity: 3 }
      }
    },
    detectRetina: true
  });
}

/* ── 2. TYPEWRITER ─────────────────────────────────── */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = [
    'AI Engineer',
    'LLM Developer',
    'Full-Stack Builder',
    'RAG Architect',
    'Multi-Agent Engineer'
  ];

  let roleIdx   = 0;
  let charIdx   = 0;
  let deleting  = false;
  const SPEED_TYPE  = 80;
  const SPEED_DEL   = 45;
  const PAUSE_END   = 1800;
  const PAUSE_START = 400;

  function tick() {
    const current = roles[roleIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, SPEED_TYPE);
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        roleIdx  = (roleIdx + 1) % roles.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, SPEED_DEL);
    }
  }

  setTimeout(tick, 800);
}

/* ── 3. SECTION REVEAL (IntersectionObserver) ──────── */
function initReveal() {
  const sections = document.querySelectorAll('.reveal');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);   // fire once
        }
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((el) => observer.observe(el));
}

/* ── 4. COUNT-UP STATS ─────────────────────────────── */
function countUp(el, target, duration) {
  const start     = performance.now();
  const isPercent = target === 100;

  function frame(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out quad
    const eased    = 1 - (1 - progress) * (1 - progress);
    const value    = Math.floor(eased * target);
    el.textContent = isPercent ? value + '%' : (target >= 5 ? value + '+' : value);
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = isPercent ? target + '%' : (target >= 5 ? target + '+' : target);
  }

  requestAnimationFrame(frame);
}

function initCountUp() {
  const stats = document.querySelectorAll('.stat-number');
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          countUp(el, target, 1400);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach((el) => observer.observe(el));
}

/* ── 5. 3-D CARD TILT ──────────────────────────────── */
function initCardTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  const MAX   = 12; // degrees

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotY   =  dx * MAX;
      const rotX   = -dy * MAX;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

/* ── 6. GSAP STAGGER FOR PROJECT CARDS ─────────────── */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start:   'top 88%',
        toggleActions: 'play none none none'
      },
      opacity:   0,
      y:         50,
      duration:  0.6,
      delay:     (i % 3) * 0.12,
      ease:      'power2.out'
    });
  });

  gsap.utils.toArray('.badge').forEach((badge, i) => {
    gsap.from(badge, {
      scrollTrigger: {
        trigger: badge,
        start:   'top 92%'
      },
      opacity:  0,
      scale:    0.85,
      duration: 0.4,
      delay:    (i % 10) * 0.04,
      ease:     'back.out(1.5)'
    });
  });
}

/* ── 7. ACTIVE NAV LINK ────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link[data-section]');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => link.classList.remove('active'));
          const active = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ── 8. NAVBAR SCROLL STYLE ────────────────────────── */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ── 9. SMOOTH NAV SCROLL ──────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id     = anchor.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // close mobile menu if open
      const menu = document.getElementById('nav-links');
      const btn  = document.getElementById('hamburger');
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        btn && btn.classList.remove('open');
      }
    });
  });
}

/* ── 10. HAMBURGER MENU ────────────────────────────── */
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-links');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
    }
  });
}

/* ── INIT ALL ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTypewriter();
  initReveal();
  initCountUp();
  initCardTilt();
  initGSAP();
  initActiveNav();
  initNavbarScroll();
  initSmoothScroll();
  initHamburger();

  // Stats section: also trigger visible class so numbers play
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) aboutSection.classList.add('visible'); },
      { threshold: 0.12 }
    ).observe(aboutSection);
  }
});
