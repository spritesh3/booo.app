/* ============================================================
   SCRIPT.JS — Romantic Birthday Website
   Features: Particles, Hearts, Petals, Typewriter, Cake Candles,
             Scroll Animations, Fireworks
   ============================================================ */

'use strict';

// ============================================================
// 1. FLOATING PARTICLE CANVAS (stars/sparkles background)
// ============================================================
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.4 + 0.1),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random(),
      opacityDir: Math.random() > 0.5 ? 0.004 : -0.004,
      color: Math.random() > 0.5
        ? `hsl(${Math.random() * 20 + 340}, 95%, 70%)`   // pink/rose
        : `hsl(${Math.random() * 15 + 355}, 100%, 60%)`  // red
    };
  }

  function init() {
    particles = Array.from({ length: 100 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += p.opacityDir;
      if (p.opacity <= 0 || p.opacity >= 1) p.opacityDir *= -1;

      if (p.y < -10) {
        particles[i] = { ...createParticle(), y: canvas.height + 10 };
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

// ============================================================
// 2. FLOATING HEARTS
// ============================================================
(function initHearts() {
  const container = document.getElementById('heartsContainer');
  const heartEmojis = ['❤️', '❤️', '❤️', '💖', '💝', '💕', '❣️'];

  function spawnHeart() {
    const el = document.createElement('div');
    el.className = 'floating-heart';
    el.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    el.style.left = `${Math.random() * 100}%`;
    el.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
    const duration = Math.random() * 6 + 7;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${Math.random() * 3}s`;
    container.appendChild(el);
    setTimeout(() => el.remove(), (duration + 3) * 1000);
  }

  // Initial burst
  for (let i = 0; i < 12; i++) {
    setTimeout(() => spawnHeart(), i * 300);
  }
  // Ongoing
  setInterval(spawnHeart, 1800);
})();

// ============================================================
// 3. ROSE PETALS
// ============================================================
(function initPetals() {
  const container = document.getElementById('petalsContainer');

  function spawnPetal() {
    const el = document.createElement('div');
    el.className = 'petal';
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `-20px`;
    const duration = Math.random() * 8 + 10;
    el.style.animationDuration = `${duration}s`;
    el.style.opacity = (Math.random() * 0.5 + 0.3).toString();
    el.style.transform = `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.8 + 0.6})`;
    container.appendChild(el);
    setTimeout(() => el.remove(), (duration + 1) * 1000);
  }

  setInterval(spawnPetal, 800);
})();

// ============================================================
// 4. TYPEWRITER MESSAGE
// ============================================================
const MESSAGE = `My dearest Boo,\n\nOn this beautiful day that the universe brought you into this world, I want you to know how incredibly special you are to me. Every moment with you feels like a dream I never want to wake from.\n\nYour laugh, your warmth, your presence — they are the greatest gifts I have ever known. I am so grateful you exist, and so lucky to have you in my life.\n\nThis birthday is just another reminder of how endlessly wonderful you are. I celebrate YOU today — your heart, your soul, your beautiful spirit.\n\nHappy Birthday, my love. 🌹`;

function typewrite(text, el, speed = 28) {
  let i = 0;
  el.textContent = '';

  function tick() {
    if (i < text.length) {
      if (text[i] === '\n') {
        el.appendChild(document.createElement('br'));
      } else {
        el.appendChild(document.createTextNode(text[i]));
      }
      i++;
      setTimeout(tick, speed);
    } else {
      // Remove blinking cursor when done
      el.style.borderRight = 'none';
    }
  }
  tick();
}

// Start typing when message section is visible
const messageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = document.getElementById('typewriterText');
      typewrite(MESSAGE, el, 25);
      messageObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const messageSection = document.getElementById('message');
if (messageSection) messageObserver.observe(messageSection);

// ============================================================
// 5. SMOOTH SCROLL
// ============================================================
function scrollToMessage() {
  document.getElementById('message').scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
// 6. CAKE CANDLES — MICROPHONE BLOW DETECTION
// ============================================================
let candlesBlown = 0;
const totalCandles = 5;
let wishShown = false;
let micStream = null;
let audioCtx = null;
let micActive = false;

// Helper to extinguish the next unblown candle
function blowNextCandle() {
  for (let i = 0; i < totalCandles; i++) {
    const flame = document.getElementById(`flame${i}`);
    if (flame && !flame.classList.contains('out')) {
      flame.classList.add('out');
      candlesBlown++;

      // Confetti burst from the flame position
      const rect = flame.getBoundingClientRect();
      burstConfetti(rect);

      // Update status text
      const status = document.getElementById('blowStatus');
      const remaining = totalCandles - candlesBlown;
      if (remaining > 0 && status) {
        status.textContent = `🎤 ${remaining} candle${remaining > 1 ? 's' : ''} left — keep blowing! 💨`;
      }

      if (candlesBlown === totalCandles && !wishShown) {
        wishShown = true;
        if (status) status.textContent = '✨ All candles blown! Your wish is sent to the stars! ✨';
        setTimeout(() => {
          const msg = document.getElementById('wishMessage');
          if (msg) msg.style.display = 'block';
          launchFinaleConfetti();
          // Stop mic after all candles done
          stopMic();
        }, 600);
      }
      break;
    }
  }
}

function stopMic() {
  micActive = false;
  if (micStream) {
    micStream.getTracks().forEach(t => t.stop());
    micStream = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  const btn = document.getElementById('startMicBtn');
  if (btn) btn.style.display = 'none';
}

window.startMicDetection = async function () {
  if (micActive) return;

  const btn = document.getElementById('startMicBtn');
  const status = document.getElementById('blowStatus');

  try {
    if (status) status.textContent = '🎙️ Requesting microphone access...';

    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    micActive = true;

    if (btn) btn.textContent = '🎤 Listening… Blow now!';
    if (btn) btn.style.opacity = '0.7';
    if (status) status.textContent = `🎤 ${totalCandles} candles ready — blow into your mic! 💨`;

    // Blow detection thresholds
    const BLOW_THRESHOLD = 110;    // volume level (0–255) to count as a blow
    const BLOW_DURATION  = 200;    // ms the volume must stay high to count
    const COOLDOWN       = 1000;   // ms before next candle can be blown
    let blowStart = null;
    let lastBlow  = 0;

    function detect() {
      if (!micActive) return;

      analyser.getByteFrequencyData(dataArray);

      // Average the low-to-mid frequencies (blow sound lives here)
      const slice = dataArray.slice(0, 60);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;

      const now = Date.now();

      if (avg > BLOW_THRESHOLD) {
        if (!blowStart) blowStart = now;
        // Sustained blow detected
        if (now - blowStart > BLOW_DURATION && now - lastBlow > COOLDOWN) {
          lastBlow = now;
          blowStart = null;
          if (candlesBlown < totalCandles) blowNextCandle();
        }
      } else {
        blowStart = null;
      }

      requestAnimationFrame(detect);
    }

    detect();

  } catch (err) {
    console.error('Mic error:', err);
    if (status) status.textContent = '❌ Mic access denied. Please allow microphone and try again.';
    if (btn) { btn.textContent = '🎤 Try Again'; btn.style.opacity = '1'; }
  }
};

function burstConfetti(rect) {
  const colors = ['#ff4d6d', '#ff0a54', '#a4133c', '#ffe5ec', '#ffffff'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top}px;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 9999;
      transition: none;
    `;
    document.body.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 100 + 50;
    const tx = Math.cos(angle) * speed;
    const ty = Math.sin(angle) * speed - 80;
    el.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => el.remove(), 900);
  }
}

function launchFinaleConfetti() {
  for (let burst = 0; burst < 5; burst++) {
    setTimeout(() => {
      const rect = { left: Math.random() * window.innerWidth, top: window.innerHeight / 2, width: 0 };
      burstConfetti(rect);
      burstConfetti({ ...rect, left: Math.random() * window.innerWidth });
    }, burst * 200);
  }
}

// ============================================================
// 7. SCROLL-TRIGGERED ANIMATIONS (Reasons Cards)
// ============================================================
const reasonCards = document.querySelectorAll('.reason-card');

const reasonObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, parseInt(delay));
    }
  });
}, { threshold: 0.2 });

reasonCards.forEach(card => reasonObserver.observe(card));

// ============================================================
// 8. FIREWORKS CANVAS (Finale Section)
// ============================================================
const fwCanvas  = document.getElementById('fireworksCanvas');
const fwCtx     = fwCanvas.getContext('2d');
let fireworks   = [];
let fwParticles = [];
let fwRunning   = false;
let fwFrame;

function resizeFireworks() {
   fwCanvas.width  = window.innerWidth;
   fwCanvas.height = window.innerHeight;
 }

const FW_COLORS = [
  '#ff4d6d', '#ff0a54', '#a4133c', '#ff8fa3',
  '#ffe5ec', '#ffffff', '#ff758f', '#c9184a'
];

function createFirework() {
   const x = Math.random() * fwCanvas.width;
   const y = Math.random() * fwCanvas.height * 0.5 + 80;
   const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
   const count = Math.floor(Math.random() * 30 + 40);

   for (let i = 0; i < count; i++) {
     const angle = (Math.PI * 2 / count) * i;
     const speed = Math.random() * 8 + 6;
    fwParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
vy: Math.sin(angle) * speed,
       color,
       alpha: 1,
       radius: Math.random() * 5 + 3,
       decay: Math.random() * 0.015 + 0.006,
    });
  }
}

function drawFireworks() {
   fwCtx.fillStyle = 'rgba(255, 240, 243, 0.1)';
   fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);

  fwParticles = fwParticles.filter(p => p.alpha > 0.02);

fwParticles.forEach(p => {
     p.x  += p.vx;
     p.y  += p.vy;
     p.vy += 0.08; // stronger gravity
     p.vx *= 0.97;
     p.alpha -= p.decay;

fwCtx.save();
     fwCtx.globalAlpha = Math.max(0, p.alpha);
     fwCtx.beginPath();
     fwCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
     fwCtx.fillStyle = p.color;
     fwCtx.shadowBlur = 10;
     fwCtx.shadowColor = p.color;
     fwCtx.fill();
    fwCtx.restore();
  });

  if (fwRunning) {
    fwFrame = requestAnimationFrame(drawFireworks);
  }
}

function launchFireworks() {
   resizeFireworks();
   fwRunning = true;
   fwCanvas.classList.add('active');
   fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

// Launch a series of fireworks
   let count = 0;
   const interval = setInterval(() => {
     createFirework();
     createFirework();
     count++;
     if (count >= 15) {
       clearInterval(interval);
       // Stop after particles fade
       setTimeout(() => { fwRunning = false; fwCanvas.classList.remove('active'); }, 3000);
     }
   }, 100);

  drawFireworks();
}

// Auto-trigger fireworks when finale section comes into view
const finaleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !fwRunning) {
      launchFireworks();
    }
  });
}, { threshold: 0.4 });

const finaleSection = document.getElementById('finale');
if (finaleSection) {
  finaleObserver.observe(finaleSection);
}

window.addEventListener('resize', resizeFireworks);

// ============================================================
// 9. PARALLAX HERO EFFECT (subtle)
// ============================================================
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
    heroContent.style.opacity   = Math.max(0, 1 - scrollY / 600);
  }
});

// ============================================================
// 10. CURSOR SPARKLE TRAIL
// ============================================================
(function initCursorSparkle() {
  const sparkleColors = ['#ff4d6d', '#ff0a54', '#a4133c', '#ffe5ec'];

  document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.4) return; // throttle

    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${sparkleColors[Math.floor(Math.random() * sparkleColors.length)]};
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(el);

    el.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(${(Math.random()-0.5)*40-50}%, ${(Math.random()-0.5)*40-50}%) scale(0)`, opacity: 0 }
    ], { duration: 600, easing: 'ease-out', fill: 'forwards' });

    setTimeout(() => el.remove(), 650);
  });
})();

// ============================================================
// 11. RING BOX OPEN
// ============================================================
window.openEnvelope = function() {
   const flap = document.getElementById('envelopeFlap');
   const msg = document.getElementById('loveMessage');
   const hint = document.getElementById('ringHint');
   
   if (flap && !flap.classList.contains('open')) {
      flap.classList.add('open');
   }
   if (hint) hint.style.opacity = '0';
   if (msg) {
      msg.style.animation = 'none';
      msg.offsetHeight;
      msg.style.animation = null;
   }
   setTimeout(openPhotoModal, 900);
};

function openPhotoModal() {
   const modal = document.getElementById('photoModal');
   const img = document.getElementById('photoModalImg');
   if (modal && img) {
      img.src = '.vscode/Photo.jpeg';
      modal.style.display = 'flex';
   }
}

window.closePhotoModal = function() {
   const modal = document.getElementById('photoModal');
   if (modal) modal.style.display = 'none';
};

// Auto-start music on page load
setTimeout(startMusic, 500);

// ============================================================
// 12. MUSIC PLAYER
// ============================================================
const bgMusic = () => document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');

function updateMusicBtn() {
  const audio = bgMusic();
  if (!audio || !audio.src && !audio.querySelector('source[src]')) return;
  if (musicBtn) musicBtn.textContent = audio.paused ? '🎵 Play' : '🎵 Pause';
}

window.toggleMusic = function() {
  const audio = bgMusic();
  if (!audio) return;
  if (audio.paused) {
    audio.play().then(() => updateMusicBtn()).catch(() => {});
  } else {
    audio.pause();
    updateMusicBtn();
  }
};

function startMusic() {
  const audio = bgMusic();
  if (!audio) return;
  const src = (audio.querySelector('source[src]') || {}).src || '';
  if (!src.trim()) return;
  audio.volume = 0.6;
  audio.play().then(() => updateMusicBtn()).catch(() => {
    if (musicBtn) {
      musicBtn.style.display = 'inline-flex';
    }
  });
}

function onFirstInteraction() {
  startMusic();
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('keydown', onFirstInteraction);
}

document.addEventListener('click', onFirstInteraction, { once: false });
document.addEventListener('keydown', onFirstInteraction, { once: false });
setTimeout(startMusic, 500);

// ============================================================
// EXPOSE GLOBALS
// ============================================================
window.scrollToMessage  = scrollToMessage;
window.launchFireworks  = launchFireworks;
