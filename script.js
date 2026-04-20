/* ════════════════════════════════════════════════════
   AMELIA — PRIMO COMPLEANNO · script.js
════════════════════════════════════════════════════ */

/* ─── CONFIGURAZIONE ─────────────────────────────── */
// Data e ora della festa (anno 2026, mese 4 = maggio, giorno 1, ore 12:00)
const PARTY_DATE = new Date(2026, 4, 1, 12, 30, 0);

/* ─── RIFERIMENTI DOM ────────────────────────────── */
const loadingOverlay = document.getElementById('loadingOverlay');
const openScreen     = document.getElementById('openScreen');
const openBtn        = document.getElementById('openBtn');
const inviteContent  = document.getElementById('inviteContent');

const cdLabel        = document.getElementById('cdLabel');
const cdGrid         = document.getElementById('cdGrid');
const cdDays         = document.getElementById('cdDays');
const cdHours        = document.getElementById('cdHours');
const cdMinutes      = document.getElementById('cdMinutes');
const cdSeconds      = document.getElementById('cdSeconds');
const partyArrived   = document.getElementById('partyArrived');

const rsvpBtn        = document.getElementById('rsvpBtn');
const modalOverlay   = document.getElementById('modalOverlay');
const modalClose     = document.getElementById('modalClose');
const modalConfirm   = document.getElementById('modalConfirm');

const confettiCanvas = document.getElementById('confettiCanvas');
const ctx            = confettiCanvas.getContext('2d');

/* ═════════════════════════════════════════════════════
   1. SEQUENZA DI CARICAMENTO
   Loading → Open Screen
═════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  // Blocca scroll su body finché l'open screen è visibile (iOS fix)
  document.body.style.overflow = 'hidden';

  // Dopo 1.3s: nascondi loading overlay
  setTimeout(() => {
    loadingOverlay.classList.add('hidden');

    // Dopo il fade-out (0.7s): mostra open screen
    setTimeout(() => {
      openScreen.classList.add('visible');
    }, 700);
  }, 1300);
});

/* ═════════════════════════════════════════════════════
   2. BOTTONE «Apri l'invito»
═════════════════════════════════════════════════════ */
openBtn.addEventListener('click', () => {
  // Fade out dell'open screen
  openScreen.classList.remove('visible');
  openScreen.classList.add('fade-out');

  // Dopo il fade, nascondilo definitivamente
  setTimeout(() => {
    openScreen.style.display = 'none';
  }, 750);

  // Riabilita scroll su body
  document.body.style.overflow = '';

  // Mostra il contenuto principale
  inviteContent.classList.add('visible');

  // Scroll in cima (utile su mobile dopo la transizione)
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Avvia le funzionalità
  initScrollReveal();
  initCountdown();

  // Confetti! 🎉
  launchConfetti();
});

/* ═════════════════════════════════════════════════════
   3. SCROLL REVEAL
   Le sezioni con .reveal appaiono mentre si scorre
═════════════════════════════════════════════════════ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // osserva una volta sola
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ═════════════════════════════════════════════════════
   4. COUNTDOWN
   Conto alla rovescia fino alla data della festa
═════════════════════════════════════════════════════ */
function initCountdown() {
  function tick() {
    const now  = new Date();
    const diff = PARTY_DATE - now;

    if (diff <= 0) {
      // La festa è arrivata (o è già passata)
      cdGrid.style.display   = 'none';
      cdLabel.style.display  = 'none';
      partyArrived.style.display = 'block';
      return; // ferma il conto
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    cdDays.textContent    = pad(days);
    cdHours.textContent   = pad(hours);
    cdMinutes.textContent = pad(minutes);
    cdSeconds.textContent = pad(seconds);

    setTimeout(tick, 1000);
  }

  tick();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/* ═════════════════════════════════════════════════════
   5. MODAL RSVP
═════════════════════════════════════════════════════ */
rsvpBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalConfirm.addEventListener('click', closeModal);

// Chiudi cliccando sullo sfondo
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Chiudi con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
    closeModal();
  }
});

function openModal() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ═════════════════════════════════════════════════════
   6. CONFETTI 🎊
   Canvas animation con coriandoli colorati
═════════════════════════════════════════════════════ */

// Palette coordinata con il sito
const COLORS = [
  '#E8B4B8', '#F5D8DA', '#C9A770', '#EDD9B4',
  '#D4909A', '#F2E8DC', '#A8C8D8', '#D4B8E0',
  '#F7E0A0', '#E8D5B7'
];

const SHAPES = ['circle', 'square', 'ribbon'];

let particles = [];
let rafId     = null;
let emitting  = false;

/* Ridimensiona il canvas al caricamento e al resize */
function resizeCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* Crea una singola particella */
function createParticle() {
  const angle = Math.random() * Math.PI * 2;
  return {
    x:       Math.random() * confettiCanvas.width,
    y:       -20 - Math.random() * 60,
    w:       Math.random() * 9 + 5,
    h:       Math.random() * 5 + 3,
    color:   COLORS[Math.floor(Math.random() * COLORS.length)],
    shape:   SHAPES[Math.floor(Math.random() * SHAPES.length)],
    vx:      (Math.random() - 0.5) * 3,
    vy:      Math.random() * 3 + 1.5,
    spin:    (Math.random() - 0.5) * 0.18,
    angle,
    opacity: 1,
  };
}

/* Disegna una particella */
function drawParticle(p) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle   = p.color;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  switch (p.shape) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'square':
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      break;

    case 'ribbon':
      // Rettangolo lungo e sottile (simula coriandolo a nastro)
      ctx.fillRect(-p.w, -p.h / 2, p.w * 2, p.h);
      break;
  }

  ctx.restore();
}

/* Loop di animazione */
function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  particles = particles.filter((p) => {
    // Fisica
    p.x     += p.vx;
    p.y     += p.vy;
    p.angle += p.spin;
    p.vy    += 0.04; // gravità leggera

    // Fade-out nella metà inferiore dello schermo
    const fadeThreshold = confettiCanvas.height * 0.65;
    if (p.y > fadeThreshold) {
      p.opacity -= 0.025;
    }

    drawParticle(p);

    return p.opacity > 0 && p.y < confettiCanvas.height + 40;
  });

  if (particles.length > 0 || emitting) {
    rafId = requestAnimationFrame(animateConfetti);
  } else {
    // Pulisci il canvas quando finisce
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* Lancia il confetti */
function launchConfetti() {
  resizeCanvas();
  emitting = true;

  let batches = 0;
  const maxBatches = 20; // ~20 × 10 = 200 particelle

  const emitter = setInterval(() => {
    // Emetti 10 particelle ogni 60ms
    for (let i = 0; i < 10; i++) {
      particles.push(createParticle());
    }
    batches++;
    if (batches >= maxBatches) {
      clearInterval(emitter);
      emitting = false;
    }
  }, 60);

  // Avvia loop di animazione (cancella eventuale precedente)
  if (rafId) cancelAnimationFrame(rafId);
  animateConfetti();
}

/* ═════════════════════════════════════════════════════
   7. SMOOTH SCROLL per il tasto "Scopri di più"
═════════════════════════════════════════════════════ */
const scrollHint = document.querySelector('.scroll-hint');
if (scrollHint) {
  scrollHint.addEventListener('click', () => {
    const noteSection = document.getElementById('notaCompleanno');
    if (noteSection) noteSection.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ═════════════════════════════════════════════════════
   8. DRAG-TO-SCROLL per la galleria mensile
   Mouse: click + trascina. Touch: nativo (overflow-x).
═════════════════════════════════════════════════════ */
function initMeseStrip() {
  const strip = document.getElementById('meseStrip');
  if (!strip) return;

  let isDragging = false;
  let startX     = 0;
  let startScrollLeft = 0;

  strip.addEventListener('mousedown', (e) => {
    isDragging = true;
    strip.classList.add('is-grabbing');
    startX = e.pageX - strip.offsetLeft;
    startScrollLeft = strip.scrollLeft;
    e.preventDefault();
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    strip.classList.remove('is-grabbing');
  });

  strip.addEventListener('mouseleave', () => {
    isDragging = false;
    strip.classList.remove('is-grabbing');
  });

  strip.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - strip.offsetLeft;
    const walk = (x - startX) * 1.6;
    strip.scrollLeft = startScrollLeft - walk;
  });

  // Scroll centrato sulla prima card al reveal
  strip.scrollLeft = 0;
}

// Inizializza dopo che il contenuto diventa visibile
document.getElementById('openBtn').addEventListener('click', () => {
  setTimeout(initMeseStrip, 900);
}, { once: true });