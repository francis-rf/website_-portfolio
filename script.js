/* ══════════════════════════════════════════════════════
   PORTFOLIO — script.js
   Handles: neural bg · typewriter · scroll reveals
            countUp · 3D tilt · active nav · hamburger
══════════════════════════════════════════════════════ */

/* ── 1. THREE.JS NEURAL NETWORK BACKGROUND ────────── */
function initNeuralBg() {
  const canvas = document.getElementById("neural-bg");
  if (!canvas || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const COUNT = 80;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const vel = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) {
    pos[i] = (Math.random() - 0.5) * 12;
    vel[i] = (Math.random() - 0.5) * 0.006;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffb300,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
  });
  scene.add(new THREE.Points(geo, mat));

  /* pre-allocated line buffer — no new objects per frame */
  const MAX_LINES = 300;
  const linePos = new Float32Array(MAX_LINES * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  lineGeo.setDrawRange(0, 0);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xcc0000,
    transparent: true,
    opacity: 0.25,
  });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    const p = geo.attributes.position.array;

    for (let i = 0; i < COUNT; i++) {
      p[i * 3] += vel[i * 3];
      p[i * 3 + 1] += vel[i * 3 + 1];
      p[i * 3 + 2] += vel[i * 3 + 2];
      if (Math.abs(p[i * 3]) > 6) vel[i * 3] *= -1;
      if (Math.abs(p[i * 3 + 1]) > 6) vel[i * 3 + 1] *= -1;
      if (Math.abs(p[i * 3 + 2]) > 6) vel[i * 3 + 2] *= -1;
    }
    geo.attributes.position.needsUpdate = true;

    /* update lines in pre-allocated buffer */
    let idx = 0;
    for (let i = 0; i < COUNT && idx < MAX_LINES * 6; i++) {
      for (let j = i + 1; j < COUNT && idx < MAX_LINES * 6; j++) {
        const dx = p[i * 3] - p[j * 3],
          dy = p[i * 3 + 1] - p[j * 3 + 1],
          dz = p[i * 3 + 2] - p[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < 3.24) {
          linePos[idx++] = p[i * 3];
          linePos[idx++] = p[i * 3 + 1];
          linePos[idx++] = p[i * 3 + 2];
          linePos[idx++] = p[j * 3];
          linePos[idx++] = p[j * 3 + 1];
          linePos[idx++] = p[j * 3 + 2];
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

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ── 2. TYPEWRITER ─────────────────────────────────── */
function initTypewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;

  const roles = [
    "AI Engineer",
    "LLM Developer",
    "Full-Stack Builder",
    "RAG Architect",
    "Multi-Agent Engineer",
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  const SPEED_TYPE = 80;
  const SPEED_DEL = 45;
  const PAUSE_END = 1800;
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
        roleIdx = (roleIdx + 1) % roles.length;
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
  const sections = document.querySelectorAll(".reveal");
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12 },
  );

  sections.forEach((el) => observer.observe(el));
}

/* ── 4. COUNT-UP STATS ─────────────────────────────── */
function countUp(el, target, duration) {
  const start = performance.now();
  const isPercent = target === 100;

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    const value = Math.floor(eased * target);
    el.textContent = isPercent
      ? value + "%"
      : target >= 5
        ? value + "+"
        : value;
    if (progress < 1) requestAnimationFrame(frame);
    else
      el.textContent = isPercent
        ? target + "%"
        : target >= 5
          ? target + "+"
          : target;
  }

  requestAnimationFrame(frame);
}

function initCountUp() {
  const stats = document.querySelectorAll(".stat-number");
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          countUp(el, target, 1400);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 },
  );

  stats.forEach((el) => observer.observe(el));
}

/* ── 5. 3-D CARD TILT ──────────────────────────────── */
function initCardTilt() {
  const cards = document.querySelectorAll("[data-tilt]");
  const MAX = 12; // degrees

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotY = dx * MAX;
      const rotX = -dy * MAX;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transition = "transform 0.5s cubic-bezier(0.4,0,0.2,1)";
      card.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      setTimeout(() => {
        card.style.transition = "";
      }, 500);
    });
  });
}

/* ── 6. GSAP STAGGER FOR PROJECT CARDS ─────────────── */
function initGSAP() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".project-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 50,
      duration: 0.6,
      delay: (i % 3) * 0.12,
      ease: "power2.out",
    });
  });

  gsap.utils.toArray(".badge").forEach((badge, i) => {
    gsap.from(badge, {
      scrollTrigger: {
        trigger: badge,
        start: "top 92%",
      },
      opacity: 0,
      scale: 0.85,
      duration: 0.4,
      delay: (i % 10) * 0.04,
      ease: "back.out(1.5)",
    });
  });
}

/* ── 7. ACTIVE NAV LINK ────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link[data-section]");
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => link.classList.remove("active"));
          const active = document.querySelector(
            `.nav-link[data-section="${entry.target.id}"]`,
          );
          if (active) active.classList.add("active");
        }
      });
    },
    { threshold: 0.45 },
  );

  sections.forEach((s) => observer.observe(s));
}

/* ── 8. NAVBAR SCROLL STYLE ────────────────────────── */
function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  window.addEventListener(
    "scroll",
    () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    },
    { passive: true },
  );
}

/* ── 9. SMOOTH NAV SCROLL ──────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // close mobile menu if open
      const menu = document.getElementById("nav-links");
      const btn = document.getElementById("hamburger");
      if (menu && menu.classList.contains("open")) {
        menu.classList.remove("open");
        btn && btn.classList.remove("open");
      }
    });
  });
}

/* ── 10. HAMBURGER MENU ────────────────────────────── */
function initHamburger() {
  const btn = document.getElementById("hamburger");
  const menu = document.getElementById("nav-links");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    btn.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", isOpen);
  });

  // close on outside click
  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
      btn.classList.remove("open");
    }
  });
}

/* ── 11. AI CHAT WIDGET ────────────────────────────── */
function initChatWidget() {
  const bubble = document.getElementById("chat-bubble");
  const widget = document.getElementById("chat-widget");
  const closeBtn = document.getElementById("chat-close");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const messages = document.getElementById("chat-messages");

  if (!bubble || !widget) return;

  const API_URL = "/api/chat";
  let greeted = false;
  let isThinking = false;

  /* ── helpers ── */
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function linkify(str) {
    return str.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>',
    );
  }

  function appendMsg(role, text) {
    const div = document.createElement("div");
    div.classList.add("chat-msg", role);
    div.innerHTML = linkify(
      text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
    );
    messages.appendChild(div);
    scrollToBottom();
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.classList.add("chat-msg", "typing");
    div.id = "typing-indicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  function showError(msg) {
    const div = document.createElement("div");
    div.classList.add("chat-msg", "error");
    div.textContent = msg;
    messages.appendChild(div);
    scrollToBottom();
  }

  /* ── open / close ── */
  function openWidget() {
    widget.classList.add("open");
    widget.setAttribute("aria-hidden", "false");
    bubble.setAttribute("aria-expanded", "true");
    input.focus();

    if (!greeted) {
      greeted = true;
      setTimeout(() => {
        appendMsg(
          "bot",
          "Hi. I am Francis's AI assistant. How may I be of service?",
        );
      }, 280);
    }
  }

  function closeWidget() {
    widget.classList.remove("open");
    widget.setAttribute("aria-hidden", "true");
    bubble.setAttribute("aria-expanded", "false");
  }

  bubble.addEventListener("click", () => {
    widget.classList.contains("open") ? closeWidget() : openWidget();
  });

  closeBtn.addEventListener("click", closeWidget);

  /* ── send message ── */
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isThinking) return;

    appendMsg("user", text);
    input.value = "";
    isThinking = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      removeTyping();

      if (!res.ok) {
        showError(`Server error (${res.status}). Is the API running?`);
      } else {
        const data = await res.json();
        appendMsg("bot", data.reply || "No response received.");
      }
    } catch (err) {
      removeTyping();
      showError("Could not reach the API. Run: uvicorn api:app --port 8000");
    } finally {
      isThinking = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* ── Escape key closes widget ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && widget.classList.contains("open")) {
      closeWidget();
    }
  });
}

/* ── INIT ALL ──────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
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
  initArcReactor();
  initGeo3D();
  initFloat3D();
  initChatMask();

  // Stats section: also trigger visible class so numbers play
  const aboutSection = document.getElementById("about");
  if (aboutSection) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) aboutSection.classList.add("visible");
      },
      { threshold: 0.12 },
    ).observe(aboutSection);
  }
});

/* ── 12. 3D ARC REACTOR (Hero) ─────────────────────── */
function initArcReactor() {
  const canvas = document.getElementById("arc-reactor");
  if (!canvas || typeof THREE === "undefined") return;

  const W = 280, H = 280;
  canvas.width = W; canvas.height = H;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const CYAN = 0x1ad6fd, GOLD = 0xffb300, RED = 0xcc0000;

  // Outer cyan torus
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.04, 16, 120),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.9 })
  );

  // Mid gold torus
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.035, 16, 100),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.85 })
  );

  // Inner red torus
  const ring3 = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.03, 16, 80),
    new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.75 })
  );

  // 6 spokes
  const spokeMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.3 });
  const spokes = [];
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.5, 6), spokeMat);
    s.rotation.z = (i / 6) * Math.PI;
    spokes.push(s);
  }

  // Glowing core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 32, 32),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 })
  );

  // Glow halo around core
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.44, 32, 32),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.1, side: THREE.BackSide })
  );

  // Particle ring
  const PARTS = 60;
  const pPos = new Float32Array(PARTS * 3);
  for (let i = 0; i < PARTS; i++) {
    const a = (i / PARTS) * Math.PI * 2;
    const r = 1.55 + (Math.random() - 0.5) * 0.25;
    pPos[i * 3]     = Math.cos(a) * r;
    pPos[i * 3 + 1] = Math.sin(a) * r;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    partGeo,
    new THREE.PointsMaterial({ color: GOLD, size: 0.04, transparent: true, opacity: 0.75 })
  );

  const group = new THREE.Group();
  group.add(ring1, ring2, ring3, core, glow, particles, ...spokes);
  scene.add(group);

  // Mouse tilt
  let tx = 0, ty = 0;
  const hero = document.getElementById("hero");
  if (hero) {
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width  - 0.5) * 0.6;
      ty = ((e.clientY - r.top)  / r.height - 0.5) * 0.6;
    }, { passive: true });
    hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; });
  }

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    ring1.rotation.z =  t * 0.55;
    ring2.rotation.z = -t * 0.85;
    ring3.rotation.z =  t * 1.2;
    particles.rotation.z = t * 0.35;
    core.material.opacity = 0.85 + Math.sin(t * 3) * 0.1;
    glow.material.opacity = 0.07 + Math.sin(t * 3) * 0.04;
    group.rotation.y += (tx - group.rotation.y) * 0.06;
    group.rotation.x += (-ty - group.rotation.x) * 0.06;
    renderer.render(scene, camera);
  })();
}

/* ── 13. 3D GEO OBJECT (About Section) ─────────────── */
function initGeo3D() {
  const canvas = document.getElementById("geo-3d");
  if (!canvas || typeof THREE === "undefined") return;

  const W = 180, H = 180;
  canvas.width = W; canvas.height = H;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 3.5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Wireframe icosahedron — gold
  const icoGeo = new THREE.IcosahedronGeometry(1, 1);
  const icoWire = new THREE.Mesh(
    icoGeo,
    new THREE.MeshBasicMaterial({ color: 0xffb300, wireframe: true, transparent: true, opacity: 0.7 })
  );
  scene.add(icoWire);

  // Solid icosahedron — very faint fill
  const icoSolid = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshBasicMaterial({ color: 0x1ad6fd, transparent: true, opacity: 0.05 })
  );
  scene.add(icoSolid);

  // Inner octahedron — cyan wireframe
  const octaWire = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshBasicMaterial({ color: 0x1ad6fd, wireframe: true, transparent: true, opacity: 0.9 })
  );
  scene.add(octaWire);

  // Outer ring torus — red accent
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.025, 12, 80),
    new THREE.MeshBasicMaterial({ color: 0xcc0000, transparent: true, opacity: 0.6 })
  );
  torus.rotation.x = Math.PI / 3;
  scene.add(torus);

  // Particle cloud
  const PARTS = 40;
  const pPos = new Float32Array(PARTS * 3);
  for (let i = 0; i < PARTS; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 1.5 + Math.random() * 0.3;
    pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i * 3 + 2] = r * Math.cos(phi);
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    partGeo,
    new THREE.PointsMaterial({ color: 0xffb300, size: 0.05, transparent: true, opacity: 0.8 })
  );
  scene.add(particles);

  // Observe About section — only animate when visible
  let visible = false;
  const aboutEl = document.getElementById("about");
  if (aboutEl) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.1 }).observe(aboutEl);
  }

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    t += 0.008;
    icoWire.rotation.y = t * 0.5;
    icoWire.rotation.x = t * 0.3;
    icoSolid.rotation.y = t * 0.5;
    icoSolid.rotation.x = t * 0.3;
    octaWire.rotation.y = -t * 0.8;
    octaWire.rotation.z = t * 0.4;
    torus.rotation.z = t * 0.6;
    particles.rotation.y = t * 0.2;
    renderer.render(scene, camera);
  })();
}

/* ── 14. FLOATING 3D CURSOR ELEMENT ────────────────── */
function initFloat3D() {
  const canvas = document.getElementById("float-3d");
  if (!canvas || typeof THREE === "undefined") return;

  const S = 80;
  canvas.width = S; canvas.height = S;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(S, S);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Glowing cube — gold wireframe
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xffb300, wireframe: true, transparent: true, opacity: 0.85 })
  );
  scene.add(cube);

  // Inner cube — cyan
  const innerCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x1ad6fd, wireframe: true, transparent: true, opacity: 0.9 })
  );
  scene.add(innerCube);

  // Smooth cursor follow
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;

  document.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });

  // Position canvas
  function positionCanvas() {
    canvas.style.left = (cx - S / 2) + "px";
    canvas.style.top  = (cy - S / 2) + "px";
  }

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.012;

    // Ease towards cursor
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    positionCanvas();

    cube.rotation.x = t * 0.6;
    cube.rotation.y = t * 0.9;
    innerCube.rotation.x = -t * 0.9;
    innerCube.rotation.y = -t * 0.6;

    // Pulse scale
    const s = 1 + Math.sin(t * 2) * 0.08;
    cube.scale.set(s, s, s);

    renderer.render(scene, camera);
  })();
}

/* ── 15. 3D IRON MAN MASK (Chat Widget BG) ──────────── */
function initChatMask() {
  const canvas = document.getElementById("chat-3d");
  if (!canvas || typeof THREE === "undefined") return;

  const W = 380, H = 500;
  canvas.width = W; canvas.height = H;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
  camera.position.z = 4.5;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const RED   = 0xcc0000;
  const GOLD  = 0xffb300;
  const CYAN  = 0x1ad6fd;

  const group = new THREE.Group();

  // ── Face plate (main helmet) ──
  const faceMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
  const faceWire = new THREE.MeshBasicMaterial({ color: RED, wireframe: true, transparent: true, opacity: 0.22 });

  // Head - flattened sphere
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.75), faceMat);
  head.scale.set(0.88, 1, 0.72);
  group.add(head);

  const headWire = new THREE.Mesh(new THREE.SphereGeometry(1.12, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.75), faceWire);
  headWire.scale.set(0.88, 1, 0.72);
  group.add(headWire);

  // ── Forehead plate ──
  const forehead = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.4, 0.12),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.35 })
  );
  forehead.position.set(0, 0.72, 0.55);
  group.add(forehead);

  // ── Eye slots — cyan glowing ──
  const eyeGeo = new THREE.BoxGeometry(0.32, 0.1, 0.08);
  const eyeMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.9 });

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.26, 0.38, 0.65);
  eyeL.rotation.z = 0.18;
  group.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.26, 0.38, 0.65);
  eyeR.rotation.z = -0.18;
  group.add(eyeR);

  // Eye glow halos
  const eyeHaloGeo = new THREE.BoxGeometry(0.42, 0.18, 0.04);
  const eyeHaloMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.15 });
  const haloL = new THREE.Mesh(eyeHaloGeo, eyeHaloMat);
  haloL.position.copy(eyeL.position); haloL.position.z -= 0.02; haloL.rotation.z = 0.18;
  group.add(haloL);
  const haloR = new THREE.Mesh(eyeHaloGeo, eyeHaloMat);
  haloR.position.copy(eyeR.position); haloR.position.z -= 0.02; haloR.rotation.z = -0.18;
  group.add(haloR);

  // ── Cheek panel lines ──
  const panelMat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.3 });
  [-0.6, 0.6].forEach((x) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.55, 0.06), panelMat);
    p.position.set(x, 0.1, 0.5);
    group.add(p);
  });

  // ── Nose ridge ──
  const nose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.4 })
  );
  nose.position.set(0, 0.18, 0.68);
  group.add(nose);

  // ── Chin / jaw plate ──
  const chin = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.28, 0.14),
    new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.35 })
  );
  chin.position.set(0, -0.48, 0.56);
  group.add(chin);

  // ── Arc reactor on chest (below mask) ──
  const reactor = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.04, 10, 60),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.8 })
  );
  reactor.position.set(0, -1.05, 0.3);
  group.add(reactor);

  const reactorCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.9 })
  );
  reactorCore.position.copy(reactor.position);
  group.add(reactorCore);

  // ── HUD scan ring ──
  const hudRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.015, 8, 100),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.3 })
  );
  group.add(hudRing);

  const hudRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.01, 8, 100),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.2 })
  );
  group.add(hudRing2);

  scene.add(group);

  // Animate only when chat widget is open
  let t = 0;
  const chatWidget = document.getElementById("chat-widget");

  (function animate() {
    requestAnimationFrame(animate);
    if (!chatWidget || !chatWidget.classList.contains("open")) return;

    t += 0.006;

    // Slow gentle rotation
    group.rotation.y = Math.sin(t * 0.4) * 0.25;
    group.rotation.x = Math.sin(t * 0.25) * 0.08 - 0.08;

    // Pulse eyes
    const pulse = 0.7 + Math.sin(t * 3) * 0.25;
    eyeMat.opacity = pulse;
    eyeHaloMat.opacity = pulse * 0.18;

    // Reactor pulse
    reactor.rotation.z = t * 1.5;
    reactorCore.material.opacity = 0.75 + Math.sin(t * 4) * 0.2;

    // HUD rings rotate
    hudRing.rotation.z = t * 0.3;
    hudRing2.rotation.z = -t * 0.2;

    renderer.render(scene, camera);
  })();
}
