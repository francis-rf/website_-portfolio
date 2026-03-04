/* ══════════════════════════════════════════════════════
   PORTFOLIO — script.js
   Handles: neural bg · typewriter · scroll reveals
            countUp · 3D tilt · active nav · hamburger
══════════════════════════════════════════════════════ */

/* ── 1. THREE.JS NEURAL NETWORK BACKGROUND ────────── */
function initNeuralBg() {
  const canvas = document.getElementById('neural-bg');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const COUNT = 80;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(COUNT * 3);
  const vel   = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) {
    pos[i] = (Math.random() - 0.5) * 12;
    vel[i] = (Math.random() - 0.5) * 0.006;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x00f5ff, size: 0.05, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Points(geo, mat));

  /* pre-allocated line buffer — no new objects per frame */
  const MAX_LINES = 300;
  const linePos   = new Float32Array(MAX_LINES * 6);
  const lineGeo   = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setDrawRange(0, 0);
  const lineMat   = new THREE.LineBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.12 });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    const p = geo.attributes.position.array;

    for (let i = 0; i < COUNT; i++) {
      p[i*3]   += vel[i*3];
      p[i*3+1] += vel[i*3+1];
      p[i*3+2] += vel[i*3+2];
      if (Math.abs(p[i*3])   > 6) vel[i*3]   *= -1;
      if (Math.abs(p[i*3+1]) > 6) vel[i*3+1] *= -1;
      if (Math.abs(p[i*3+2]) > 6) vel[i*3+2] *= -1;
    }
    geo.attributes.position.needsUpdate = true;

    /* update lines in pre-allocated buffer */
    let idx = 0;
    for (let i = 0; i < COUNT && idx < MAX_LINES * 6; i++) {
      for (let j = i + 1; j < COUNT && idx < MAX_LINES * 6; j++) {
        const dx = p[i*3]-p[j*3], dy = p[i*3+1]-p[j*3+1], dz = p[i*3+2]-p[j*3+2];
        if (dx*dx + dy*dy + dz*dz < 3.24) {
          linePos[idx++] = p[i*3]; linePos[idx++] = p[i*3+1]; linePos[idx++] = p[i*3+2];
          linePos[idx++] = p[j*3]; linePos[idx++] = p[j*3+1]; linePos[idx++] = p[j*3+2];
        }
      }
    }
    /* zero out unused buffer space */
    for (let k = idx; k < MAX_LINES * 6; k++) linePos[k] = 0;
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, idx / 3);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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

/* ── 11. AI CHAT WIDGET ────────────────────────────── */
function initChatWidget() {
  const bubble   = document.getElementById('chat-bubble');
  const widget   = document.getElementById('chat-widget');
  const closeBtn = document.getElementById('chat-close');
  const input    = document.getElementById('chat-input');
  const sendBtn  = document.getElementById('chat-send');
  const messages = document.getElementById('chat-messages');

  if (!bubble || !widget) return;

  const API_URL    = '/api/chat';
  let   greeted    = false;
  let   isThinking = false;

  /* ── helpers ── */
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function linkify(str) {
    return str.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.classList.add('chat-msg', role);
    div.innerHTML = linkify(text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
    messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.classList.add('chat-msg', 'typing');
    div.id = 'typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function showError(msg) {
    const div = document.createElement('div');
    div.classList.add('chat-msg', 'error');
    div.textContent = msg;
    messages.appendChild(div);
    scrollToBottom();
  }

  /* ── open / close ── */
  function openWidget() {
    widget.classList.add('open');
    widget.setAttribute('aria-hidden', 'false');
    bubble.setAttribute('aria-expanded', 'true');
    input.focus();

    if (!greeted) {
      greeted = true;
      setTimeout(() => {
        appendMsg('bot',
          "Hi! I'm Francis's AI assistant 👋 Ask me about his projects, skills, or how to get in touch."
        );
      }, 280);
    }
  }

  function closeWidget() {
    widget.classList.remove('open');
    widget.setAttribute('aria-hidden', 'true');
    bubble.setAttribute('aria-expanded', 'false');
  }

  bubble.addEventListener('click', () => {
    widget.classList.contains('open') ? closeWidget() : openWidget();
  });

  closeBtn.addEventListener('click', closeWidget);

  /* ── send message ── */
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isThinking) return;

    appendMsg('user', text);
    input.value  = '';
    isThinking   = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text })
      });

      removeTyping();

      if (!res.ok) {
        showError(`Server error (${res.status}). Is the API running?`);
      } else {
        const data = await res.json();
        appendMsg('bot', data.reply || 'No response received.');
      }
    } catch (err) {
      removeTyping();
      showError('Could not reach the API. Run: uvicorn api:app --port 8000');
    } finally {
      isThinking       = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* ── Escape key closes widget ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widget.classList.contains('open')) {
      closeWidget();
    }
  });
}

/* ── INIT ALL ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNeuralBg();
  initTypewriter();
  initReveal();
  initCountUp();
  initCardTilt();
  initGSAP();
  initActiveNav();
  initNavbarScroll();
  initSmoothScroll();
  initHamburger();
  initChatWidget();

  // Stats section: also trigger visible class so numbers play
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) aboutSection.classList.add('visible'); },
      { threshold: 0.12 }
    ).observe(aboutSection);
  }
});
