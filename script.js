/**
 * ============================================================================
 * Birthday Surprise Website - Main Script
 * Complete interactive logic, animations, canvas particle engines, audio controls
 * ============================================================================
 */

// ============================================================================
// 1. CONFIGURATION BLOCK
// Edit only this block to personalize the entire experience
// ============================================================================
const CONFIG = {
  RECIPIENT_NAME: "harshada",
  AGE: 20,
  SENDER_NAME: "Siddhesh",
  REASONS: [
    "You have a beautiful heart, a rare kind of kindness, and a way of making people feel special just by being yourself. 🌸",
    "You make me want to be a better version of myself",
    "Your smile has a way of making my worst days better, and I hope life always gives you a thousand reasons to smile. 😊💗",
    "No matter where life takes us, I hope you always remember how special you are to me. You deserve all the love, happiness, and beautiful things this world has to offer. 🫶💕"
  ],
  PHOTOS: [
    { src: "assets/photos/photo1.jpg", caption: "Sunshine & smiles 🌸" },
    { src: "assets/photos/photo2.jpg", caption: "Desi elegance 💙✨" },
    { src: "assets/photos/photo3.png", caption: "Blooming beauty 🌺" },
    { src: "assets/photos/photo4.png", caption: "Flower child 🌷" },
    { src: "assets/photos/photo5.jpg", caption: "Desi doll 🧡✨" }
  ],
  PHOTO_TILTS: [-3, 2, -2, 3, -1],
  LETTER_TEXT: `Dear {name},\n\nHappy Birthday, beautiful soul! 💗✨ You make ordinary moments feel special and bring smiles without even trying. I hope your life is always filled with love, laughter, endless happiness, and all the little things that make your heart smile. Never stop being the lovely person you are. You deserve all the happiness in the world. 🌸🫶`,
  TEDDY_IMG: "assets/teddy.svg",
  BOUQUET_IMG: "assets/bouquet.svg",
  MUSIC_SRC: "assets/audio/bg-music.mp3",

  // Audio SFX file paths (all in assets/audio/)
  SFX: {
    click:        "assets/audio/click.mp3",
    bowPull:      "assets/audio/bow-pull.mp3",
    arrowShoot:   "assets/audio/arrow-shoot.mp3",
    heartBurst:   "assets/audio/heart-burst.mp3",
    textPop:      "assets/audio/text-pop.mp3",
    tapNext:      "assets/audio/tap-next.mp3",
    matchStrike:  "assets/audio/match-strike.mp3",
    blow:         "assets/audio/blow.mp3",
    cheer:        "assets/audio/cheer.mp3",
    balloonPop:   "assets/audio/balloon-pop.mp3",
    cardReveal:   "assets/audio/card-reveal.mp3",
    allPopped:    "assets/audio/all-popped.mp3",
    swipe:        "assets/audio/swipe.mp3",
    envelopeOpen: "assets/audio/envelope-open.mp3",
    typewriter:   "assets/audio/typewriter.mp3",
    finaleFanfare:"assets/audio/finale-fanfare.mp3"
  }
};

// ============================================================================
// 2. UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates an HTML element with specified class name and optional innerHTML.
 * @param {string} tag - HTML tag name
 * @param {string} [className] - CSS class name(s)
 * @param {string} [innerHTML] - Inner HTML content
 * @returns {HTMLElement} The created DOM element
 */
function createElement(tag, className = "", innerHTML = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

/**
 * Returns a random floating-point or integer number between min and max.
 * @param {number} min - Lower bound
 * @param {number} max - Upper bound
 * @returns {number} Random number in [min, max)
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Picks a random item from an array.
 * @template T
 * @param {T[]} array - Array to pick from
 * @returns {T} Selected item
 */
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Clamps a number between min and max.
 * @param {number} val - Input value
 * @param {number} min - Minimum allowed
 * @param {number} max - Maximum allowed
 * @returns {number} Clamped value
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Checks whether user prefers reduced motion.
 * @returns {boolean} True if reduced motion is requested
 */
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Confetti color palette
const CONFETTI_COLORS = ['#ff4d97', '#f0b44c', '#7dffb3', '#c49aff', '#ffdd57', '#ff9a9e'];

// ============================================================================
// 3. CANVAS CONFETTI SYSTEM
// Supports both instant point bursts (Cake/Tap) and continuous rain (Finale)
// ============================================================================
class ConfettiEngine {
  /**
   * @param {HTMLCanvasElement} canvas - Target canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.animationFrameId = null;
    this.isRunning = false;
    this.isContinuous = false;
    this.continuousRate = 2; // particles per frame

    if (this.canvas) {
      this.resize();
    }
  }

  /**
   * Syncs canvas internal dimensions with display dimensions.
   */
  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(rect.width, this.canvas.parentElement?.clientWidth || window.innerWidth);
    const height = Math.max(rect.height, this.canvas.parentElement?.clientHeight || window.innerHeight);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  /**
   * Spawns a burst of particles at a given coordinate.
   * @param {number} originX - X coordinate relative to canvas
   * @param {number} originY - Y coordinate relative to canvas
   * @param {number} [count=90] - Number of particles
   */
  burst(originX, originY, count = 90) {
    if (!this.canvas || prefersReducedMotion()) return;
    this.resize();

    for (let i = 0; i < count; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(3, 11);
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - random(2, 6),
        gravity: 0.22,
        drag: 0.96,
        size: random(5, 11),
        color: randomItem(CONFETTI_COLORS),
        rotation: random(0, 360),
        rotSpeed: random(-9, 9),
        opacity: 1,
        fade: random(0.009, 0.018),
        shape: randomItem(['rect', 'circle', 'ribbon']),
        continuous: false
      });
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Enables continuous confetti rain from top of canvas.
   */
  startContinuous() {
    if (!this.canvas || prefersReducedMotion()) return;
    this.resize();
    this.isContinuous = true;

    // Seed initial batch across top and upper portion
    for (let i = 0; i < 45; i++) {
      this.particles.push(this.createFallingParticle(true));
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Creates a falling particle for continuous rain.
   * @param {boolean} [randomY=false] - If true, randomizes Y within top half
   * @returns {Object} Particle object
   */
  createFallingParticle(randomY = false) {
    const width = this.canvas.width || window.innerWidth;
    const height = this.canvas.height || window.innerHeight;
    return {
      x: random(0, width),
      y: randomY ? random(-20, height * 0.7) : random(-30, -5),
      vx: random(-1.2, 1.2),
      vy: random(2, 4.5),
      gravity: 0.02,
      drag: 0.99,
      size: random(6, 12),
      color: randomItem(CONFETTI_COLORS),
      rotation: random(0, 360),
      rotSpeed: random(-4, 4),
      opacity: random(0.8, 1),
      fade: 0,
      shape: randomItem(['rect', 'circle', 'ribbon']),
      swayOffset: random(0, Math.PI * 2),
      swaySpeed: random(0.02, 0.05),
      continuous: true
    };
  }

  /**
   * Main render loop.
   */
  start() {
    this.isRunning = true;

    const render = () => {
      if (!this.isRunning || !this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Spawn falling particles if continuous mode is on
      if (this.isContinuous && this.particles.filter(p => p.continuous).length < 85) {
        for (let i = 0; i < this.continuousRate; i++) {
          this.particles.push(this.createFallingParticle(false));
        }
      }

      // Update & render particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];

        if (p.continuous) {
          p.swayOffset += p.swaySpeed;
          p.x += p.vx + Math.sin(p.swayOffset) * 0.8;
          p.y += p.vy;
          p.rotation += p.rotSpeed;

          // Wrap or respawn when falling out of bottom
          if (p.y > this.canvas.height + 25) {
            p.y = random(-25, -5);
            p.x = random(0, this.canvas.width);
          }
        } else {
          // Burst particle physics
          p.vx *= p.drag;
          p.vy = p.vy * p.drag + p.gravity;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotSpeed;
          p.opacity -= p.fade;

          if (p.opacity <= 0 || p.y > this.canvas.height + 30) {
            this.particles.splice(i, 1);
            continue;
          }
        }

        // Draw particle
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.shape === 'ribbon') {
          this.ctx.fillRect(-p.size * 0.7, -p.size * 0.25, p.size * 1.4, p.size * 0.5);
        } else {
          this.ctx.fillRect(-p.size * 0.5, -p.size * 0.4, p.size, p.size * 0.8);
        }

        this.ctx.restore();
      }

      // Continue or stop if empty and not continuous
      if (this.particles.length > 0 || this.isContinuous) {
        this.animationFrameId = requestAnimationFrame(render);
      } else {
        this.isRunning = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  /**
   * Stops continuous rain and resets.
   */
  stopContinuous() {
    this.isContinuous = false;
  }

  /**
   * Clears all particles and stops animation frame.
   */
  clear() {
    this.isRunning = false;
    this.isContinuous = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ============================================================================
// 4. BACKGROUND SPARKLES RENDERER
// Subtle drifting dust/sparkles active only on scenes with data-bg="dark"
// ============================================================================
class SparklesRenderer {
  /**
   * @param {HTMLCanvasElement} canvas - Sparkles canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.particleCount = 50;
    this.animationFrameId = null;
    this.active = false;
    this.colors = ['#ffffff', '#ffe8a3', '#ffd1dc', '#fffbe6'];

    if (this.canvas) {
      this.resize();
      this.initParticles();
    }
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement || document.body;
    const rect = parent.getBoundingClientRect();
    const width = Math.max(rect.width, window.innerWidth);
    const height = Math.max(rect.height, window.innerHeight);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  initParticles() {
    this.particles = [];
    const width = this.canvas ? this.canvas.width : window.innerWidth;
    const height = this.canvas ? this.canvas.height : window.innerHeight;

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: random(0, width),
        y: random(0, height),
        radius: random(1, 2.5),
        speedY: random(0.2, 0.65),
        swayAngle: random(0, Math.PI * 2),
        swaySpeed: random(0.015, 0.035),
        swayRadius: random(0.3, 0.7),
        baseOpacity: random(0.2, 0.6),
        color: randomItem(this.colors)
      });
    }
  }

  start() {
    if (!this.canvas || prefersReducedMotion()) return;
    this.active = true;
    this.resize();

    const loop = () => {
      if (!this.active || !this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.swayAngle += p.swaySpeed;
        p.x += Math.sin(p.swayAngle) * p.swayRadius;
        p.y -= p.speedY;

        // Respawn if drifted above top
        if (p.y < -10) {
          p.y = this.canvas.height + 10;
          p.x = random(0, this.canvas.width);
        }
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 10) p.x = -10;

        // Twinkle opacity
        const opacity = p.baseOpacity * (0.7 + 0.3 * Math.sin(p.swayAngle * 2.5));

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0.1, Math.min(1, opacity));
        this.ctx.fill();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(loop);
    }
  }

  stop() {
    this.active = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ============================================================================
// 5. AUDIO MANAGER (Web Audio API)
// Full SFX + music system with ducking, preloading, tab-visibility, localStorage
// ============================================================================
class AudioManager {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    /** @type {GainNode|null} */
    this.masterGain = null;
    /** @type {GainNode|null} */
    this.musicGain = null;
    /** @type {GainNode|null} */
    this.sfxGain = null;

    // Background music uses HTMLAudioElement for easy looping
    this.musicEl = null;
    /** @type {MediaElementAudioSourceNode|null} */
    this.musicSource = null;

    // SFX buffer cache
    /** @type {Object<string, AudioBuffer>} */
    this.sfxBuffers = {};
    this.sfxLoading = false;

    // State
    this.isPlaying = false;
    this.isMuted = false;
    this.isPaused = false; // user-paused music
    this.hasUnlocked = false;
    this.musicFadedIn = false;
    this._duckTimer = null;
    this._visWasPlaying = false;

    // Restore saved state
    try {
      const saved = JSON.parse(localStorage.getItem('bday_audio') || '{}');
      if (saved.muted === true) this.isMuted = true;
      if (saved.paused === true) this.isPaused = true;
    } catch (_) { /* ignore */ }

    // Volume presets
    this.MUSIC_VOL = 0.35;
    this.MUSIC_DUCK_VOL = 0.15;
    this.SFX_VOL = 0.8;

    // DOM Controls
    this.btnPause = document.getElementById('btn-pause');
    this.btnMute = document.getElementById('btn-mute');
    this.pauseIcons = document.querySelectorAll('.icon-pause');
    this.playIcon = document.querySelector('.icon-play');
    this.speakerWave1 = document.querySelector('.icon-wave1');
    this.speakerWave2 = document.querySelector('.icon-wave2');
    this.muteXLines = document.querySelectorAll('.icon-mute-x');

    this._setupListeners();
    this._updateControlsUI();
  }

  // ---- INTERNAL SETUP ----

  /** Create the AudioContext and nodes (called on first user gesture) */
  _initContext() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0; // fade in later
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1;
      this.sfxGain.connect(this.masterGain);

      // Create music element and wire through Web Audio
      this.musicEl = new Audio();
      this.musicEl.src = CONFIG.MUSIC_SRC;
      this.musicEl.loop = true;
      this.musicEl.preload = 'auto';
      this.musicEl.addEventListener('error', () => { /* fail silently */ });

      this.musicSource = this.ctx.createMediaElementSource(this.musicEl);
      this.musicSource.connect(this.musicGain);

      // Preload SFX buffers and check music file
      this._preloadSFX();
      this._checkMusicFile();
    } catch (_) {
      /* AudioContext unavailable - everything fails silently */
    }
  }

  /** Checks if a buffer contains only silent samples */
  _isSilent(buffer) {
    if (!buffer || buffer.length === 0) return true;
    try {
      const data = buffer.getChannelData(0);
      const step = Math.max(1, Math.floor(data.length / 50));
      for (let i = 0; i < data.length; i += step) {
        if (Math.abs(data[i]) > 0.005) return false;
      }
      return true;
    } catch (_) {
      return true;
    }
  }

  /** Checks if the background music file has audible audio, else uses music box synth */
  async _checkMusicFile() {
    try {
      const resp = await fetch(CONFIG.MUSIC_SRC);
      if (!resp.ok) { this.useSynthMusic = true; return; }
      const buf = await resp.arrayBuffer();
      const audioBuf = await this.ctx.decodeAudioData(buf);
      this.useSynthMusic = this._isSilent(audioBuf);
    } catch (_) {
      this.useSynthMusic = true;
    }
  }

  /** Preload all SFX AudioBuffers */
  async _preloadSFX() {
    if (this.sfxLoading || !this.ctx) return;
    this.sfxLoading = true;

    const entries = Object.entries(CONFIG.SFX || {});
    const promises = entries.map(async ([name, url]) => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) return;
        const arrayBuf = await resp.arrayBuffer();
        this.sfxBuffers[name] = await this.ctx.decodeAudioData(arrayBuf);
      } catch (_) {
        /* fail silently for missing/corrupt audio files */
      }
    });
    await Promise.allSettled(promises);
  }

  /** Starts gentle music box procedural melody if bg-music.mp3 has silence */
  _startSynthMusic() {
    if (this._synthMusicInterval) return;
    const melody = [
      392, 523.25, 659.25, 783.99,
      698.46, 587.33, 493.88, 392,
      440, 523.25, 698.46, 880,
      783.99, 493.88, 587.33, 783.99
    ];
    let step = 0;
    this._synthMusicInterval = setInterval(() => {
      if (!this.isPlaying || this.isMuted || !this.ctx || this.ctx.state !== 'running') return;
      try {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = melody[step % melody.length];
        const now = this.ctx.currentTime;
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.2, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(g);
        g.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.6);
        step++;
      } catch (_) {}
    }, 320);
  }

  _stopSynthMusic() {
    if (this._synthMusicInterval) {
      clearInterval(this._synthMusicInterval);
      this._synthMusicInterval = null;
    }
  }

  /** Unlock AudioContext on first user gesture */
  _unlock() {
    if (this.hasUnlocked) return;
    this.hasUnlocked = true;
    this._initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    // Start music unless user had it paused
    if (!this.isPaused) {
      this.playMusic();
    }
  }

  _setupListeners() {
    // First-gesture unlock
    const onFirstGesture = () => {
      this._unlock();
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
    };
    window.addEventListener('pointerdown', onFirstGesture, { passive: true });
    window.addEventListener('keydown', onFirstGesture, { passive: true });
    window.addEventListener('touchstart', onFirstGesture, { passive: true });

    // Pause/Play button (music only)
    this.btnPause?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._unlock();
      if (this.isPlaying) {
        this.pauseMusic();
        this.isPaused = true;
      } else {
        this.playMusic();
        this.isPaused = false;
      }
      this._saveState();
    });

    // Mute button (all audio)
    this.btnMute?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._unlock();
      this.toggleMute();
    });

    // Tab visibility: pause/resume when tab is hidden/visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._visWasPlaying = this.isPlaying;
        if (this.isPlaying) this._pauseMusicInternal();
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      } else {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this._visWasPlaying && !this.isPaused && !this.isMuted) {
          this.playMusic();
        }
      }
    });
  }

  // ---- MUSIC CONTROLS ----

  playMusic() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.useSynthMusic) {
      this._startSynthMusic();
    } else if (this.musicEl) {
      const p = this.musicEl.play();
      if (p) p.catch(() => {});
    }
    // Fade in over 1.5s
    if (this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(this.MUSIC_VOL, now + 1.5);
    }
    this.isPlaying = true;
    this.musicFadedIn = true;
    this._updateControlsUI();
  }

  pauseMusic() {
    this._pauseMusicInternal();
    this.isPaused = true;
    this._saveState();
  }

  _pauseMusicInternal() {
    if (!this.ctx) return;
    // Fade out over 0.3s then pause
    if (this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(0, now + 0.3);
    }
    setTimeout(() => {
      if (this.useSynthMusic) {
        this._stopSynthMusic();
      } else if (this.musicEl) {
        this.musicEl.pause();
      }
    }, 320);
    this.isPlaying = false;
    this._updateControlsUI();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
    // Unmuting confirmation click
    if (!this.isMuted) {
      this.playSfx('click', { volume: 0.6 });
    }
    this._updateControlsUI();
    this._saveState();
  }

  /** Duck music volume while a loud SFX plays, then fade back up */
  duckMusic(durationMs = 1500) {
    if (!this.musicGain || !this.ctx || !this.isPlaying) return;
    clearTimeout(this._duckTimer);
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(this.MUSIC_DUCK_VOL, now + 0.15);
    this._duckTimer = setTimeout(() => {
      if (!this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(t);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
      this.musicGain.gain.linearRampToValueAtTime(this.MUSIC_VOL, t + 0.8);
    }, durationMs);
  }

  /** Restart music from the beginning (for Replay) */
  restartMusic() {
    if (this.musicEl) {
      this.musicEl.currentTime = 0;
    }
    this.isPaused = false;
    this.playMusic();
    this._saveState();
  }

  // ---- PROCEDURAL SFX SYNTHESIZER FALLBACK ----

  _playSynth(name, opts = {}) {
    if (!this.ctx || this.isMuted) return null;
    const now = this.ctx.currentTime;
    const vol = (opts.volume !== undefined ? opts.volume : this.SFX_VOL);
    const rate = opts.rate || 1;

    try {
      switch (name) {
        case 'click': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000 * rate, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);
          g.gain.setValueAtTime(vol * 0.4, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.05);
          return osc;
        }

        case 'tapNext': {
          const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
          const whiteNoise = this.ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800 * rate, now);
          filter.Q.value = 1.8;
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(vol * 0.35, now + 0.07);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          whiteNoise.connect(filter);
          filter.connect(g);
          g.connect(this.sfxGain);
          whiteNoise.start(now);
          whiteNoise.stop(now + 0.19);
          return whiteNoise;
        }

        case 'bowPull': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140 * rate, now);
          osc.frequency.linearRampToValueAtTime(220 * rate, now + 0.08);
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 500;
          g.gain.setValueAtTime(vol * 0.2, now);
          if (!opts.loop) {
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          }
          osc.connect(filter);
          filter.connect(g);
          g.connect(this.sfxGain);
          osc.start(now);
          if (!opts.loop) osc.stop(now + 0.1);
          return osc;
        }

        case 'arrowShoot': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320 * rate, now);
          osc.frequency.exponentialRampToValueAtTime(1400 * rate, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.16);
          g.gain.setValueAtTime(vol * 0.45, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.17);
          return osc;
        }

        case 'heartBurst': {
          const notes = [1046.5, 1318.5, 1567.98, 2093];
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = now + idx * 0.06;
            g.gain.setValueAtTime(vol * 0.35, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.36);
          });
          return null;
        }

        case 'textPop': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(900 * rate, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);
          g.gain.setValueAtTime(vol * 0.3, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.04);
          return osc;
        }

        case 'matchStrike': {
          const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
          const noise = this.ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 2200;
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(vol * 0.5, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          noise.connect(filter);
          filter.connect(g);
          g.connect(this.sfxGain);
          noise.start(now);
          noise.stop(now + 0.13);
          return noise;
        }

        case 'blow': {
          const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
          const noise = this.ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 650;
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(vol * 0.45, now + 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          noise.connect(filter);
          filter.connect(g);
          g.connect(this.sfxGain);
          noise.start(now);
          noise.stop(now + 0.36);
          return noise;
        }

        case 'cheer': {
          const freqs = [523.25, 659.25, 783.99, 1046.5];
          freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = f;
            const t = now + i * 0.04;
            g.gain.setValueAtTime(vol * 0.28, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.75);
          });
          return null;
        }

        case 'balloonPop': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(380 * rate, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);
          g.gain.setValueAtTime(vol * 0.6, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.07);
          return osc;
        }

        case 'cardReveal': {
          [784, 1046.5].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq * rate;
            const t = now + idx * 0.08;
            g.gain.setValueAtTime(vol * 0.35, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.42);
          });
          return null;
        }

        case 'allPopped': {
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            const t = now + idx * 0.07;
            g.gain.setValueAtTime(vol * 0.32, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.52);
          });
          return null;
        }

        case 'swipe': {
          const bufferSize = Math.floor(this.ctx.sampleRate * 0.1);
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
          const noise = this.ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1100, now);
          filter.frequency.linearRampToValueAtTime(700, now + 0.1);
          filter.Q.value = 2;
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(vol * 0.35, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          noise.connect(filter);
          filter.connect(g);
          g.connect(this.sfxGain);
          noise.start(now);
          noise.stop(now + 0.11);
          return noise;
        }

        case 'envelopeOpen': {
          const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
          const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
          const noise = this.ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1400;
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(vol * 0.4, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          noise.connect(filter);
          filter.connect(g);
          g.connect(this.sfxGain);
          noise.start(now);
          noise.stop(now + 0.16);
          return noise;
        }

        case 'typewriter': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(350, now + 0.025);
          g.gain.setValueAtTime(vol * 0.25, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(now);
          osc.stop(now + 0.03);
          return osc;
        }

        case 'finaleFanfare': {
          const chords = [
            [523.25, 659.25, 783.99],
            [698.46, 880, 1046.5],
            [783.99, 987.77, 1174.66],
            [1046.5, 1318.5, 1567.98]
          ];
          chords.forEach((chord, cIdx) => {
            chord.forEach((freq) => {
              const osc = this.ctx.createOscillator();
              const g = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.value = freq;
              const t = now + cIdx * 0.18;
              g.gain.setValueAtTime(vol * 0.2, t);
              g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
              osc.connect(g);
              g.connect(this.sfxGain);
              osc.start(t);
              osc.stop(t + 0.42);
            });
          });
          return null;
        }

        default:
          return null;
      }
    } catch (_) {
      return null;
    }
  }

  // ---- SFX ----

  /**
   * Play a sound effect by its CONFIG.SFX key name.
   * Plays custom decoded AudioBuffer if present, else procedural Web Audio synth.
   * @param {string} name - SFX key (e.g. 'click', 'balloonPop')
   * @param {object} [opts] - Options
   * @param {number} [opts.volume=0.8] - Volume 0-1
   * @param {number} [opts.rate=1] - Playback rate
   * @param {boolean} [opts.loop=false] - Loop the sound
   * @returns {AudioBufferSourceNode|OscillatorNode|null} The source node
   */
  playSfx(name, opts = {}) {
    if (!this.ctx || this.isMuted) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const buffer = this.sfxBuffers[name];

    // If buffer exists and has audio content, play via buffer source
    if (buffer && !this._isSilent(buffer)) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = opts.rate || 1;
        source.loop = opts.loop || false;

        const gain = this.ctx.createGain();
        gain.gain.value = (opts.volume !== undefined ? opts.volume : this.SFX_VOL);
        source.connect(gain);
        gain.connect(this.sfxGain);

        source.start(0);
        source._gainNode = gain;
        return source;
      } catch (_) {
        return this._playSynth(name, opts);
      }
    }

    // Otherwise, play procedural synthesized sound effect
    return this._playSynth(name, opts);
  }

  /**
   * Stop a looping SFX source (returned by playSfx with loop:true)
   * @param {AudioBufferSourceNode|null} source
   */
  stopSfx(source) {
    if (!source) return;
    try { source.stop(); } catch (_) { /* already stopped */ }
  }

  // ---- PERSISTENCE & UI ----

  _saveState() {
    try {
      localStorage.setItem('bday_audio', JSON.stringify({
        muted: this.isMuted,
        paused: this.isPaused
      }));
    } catch (_) { /* storage full or unavailable */ }
  }

  _updateControlsUI() {
    // Toggle play/pause icons
    if (this.isPlaying) {
      this.pauseIcons.forEach(el => el.style.display = '');
      if (this.playIcon) this.playIcon.style.display = 'none';
      this.btnPause?.setAttribute('aria-label', 'Pause music');
      this.btnPause?.setAttribute('aria-pressed', 'false');
    } else {
      this.pauseIcons.forEach(el => el.style.display = 'none');
      if (this.playIcon) this.playIcon.style.display = 'block';
      this.btnPause?.setAttribute('aria-label', 'Play music');
      this.btnPause?.setAttribute('aria-pressed', 'true');
    }

    // Toggle mute/wave icons & disable pause button when muted
    if (this.isMuted) {
      if (this.speakerWave1) this.speakerWave1.style.display = 'none';
      if (this.speakerWave2) this.speakerWave2.style.display = 'none';
      this.muteXLines.forEach(el => el.style.display = 'inline');
      this.btnMute?.setAttribute('aria-label', 'Unmute');
      this.btnMute?.setAttribute('aria-pressed', 'true');
      this.btnPause?.classList.add('disabled');
      this.btnPause?.setAttribute('disabled', 'true');
    } else {
      if (this.speakerWave1) this.speakerWave1.style.display = 'inline';
      if (this.speakerWave2) this.speakerWave2.style.display = 'inline';
      this.muteXLines.forEach(el => el.style.display = 'none');
      this.btnMute?.setAttribute('aria-label', 'Mute');
      this.btnMute?.setAttribute('aria-pressed', 'false');
      this.btnPause?.classList.remove('disabled');
      this.btnPause?.removeAttribute('disabled');
    }
  }
}

// ============================================================================
// 6. SCENE CONTROLLERS
// ============================================================================

/**
 * SCENE 0: Horizontal Bow aiming UP at the heart — pull string DOWN to fire
 */
function setupScene0(sceneManager) {
  const dragHandle = document.getElementById('drag-handle');
  const bowAssembly = document.getElementById('bow-assembly');
  const bowString = document.getElementById('bow-string');
  const bowNock = document.getElementById('bow-nock');
  const bowArrow = document.getElementById('bow-arrow-on-string');
  const introArrow = document.getElementById('intro-arrow');
  const introHeart = document.getElementById('intro-heart');

  const audio = sceneManager.audio; // AudioManager reference

  let isDragging = false;
  let startY = 0;
  let currentPull = 0;
  let arrowTriggered = false;
  let bowPullSource = null; // for looping bow-pull SFX

  const MAX_PULL = 80; // max drag px
  // SVG coords: string midpoint at y=65, nock at cy=65, arrow g at y=65
  const STRING_REST_Y = 65;
  const NOCK_REST_Y = 65;

  /**
   * Update SVG string bend + nock + arrow position based on pull amount (0–1)
   */
  function updateBowSVG(pullRatio) {
    const pullY = pullRatio * 35; // max 35 SVG units downward
    const newY = STRING_REST_Y + pullY;
    // String: M 15 65 L 80 newY L 145 65
    if (bowString) bowString.setAttribute('d', `M 15 65 L 80 ${newY.toFixed(1)} L 145 65`);
    if (bowNock) bowNock.setAttribute('cy', newY.toFixed(1));
    if (bowArrow) bowArrow.setAttribute('transform', `translate(0, ${pullY.toFixed(1)})`);
  }

  /**
   * Releases arrow, bursts heart, and advances to Scene 1.
   */
  function triggerRelease() {
    if (arrowTriggered) return;
    arrowTriggered = true;

    // Stop bow-pull sound
    if (audio) audio.stopSfx(bowPullSource);
    bowPullSource = null;

    // Play arrow-shoot SFX
    if (audio) audio.playSfx('arrowShoot', { volume: 0.9 });

    // Snap bow SVG back
    updateBowSVG(0);
    bowAssembly?.classList.remove('pulling');

    // Hide the arrow on the bow
    if (bowArrow) bowArrow.style.opacity = '0';

    // 1. Arrow flies upward via CSS animation
    introArrow?.classList.add('arrow-fly');

    // 2. After 400ms, heart burst + heart-burst SFX
    setTimeout(() => {
      introHeart?.classList.add('burst');
      if (audio) audio.playSfx('heartBurst', { volume: 0.9 });
    }, 400);

    // 3. After 1000ms, go to Scene 1
    setTimeout(() => {
      sceneManager.goTo(1);
    }, 1000);
  }

  function handleStart(clientY) {
    if (arrowTriggered || sceneManager.isTransitioning) return;
    isDragging = true;
    startY = clientY;
    currentPull = 0;
    bowAssembly?.classList.add('pulling');

    // Start bow-pull looping SFX
    if (audio) {
      bowPullSource = audio.playSfx('bowPull', { volume: 0.5, rate: 0.8, loop: true });
    }
  }

  function handleMove(clientY) {
    if (!isDragging || arrowTriggered) return;

    // Pull downward = positive delta
    const delta = clientY - startY;
    currentPull = clamp(delta, 0, MAX_PULL);
    const ratio = currentPull / MAX_PULL;

    updateBowSVG(ratio);

    // Pitch the bow-pull SFX from 0.8 to 1.4 based on pull
    if (bowPullSource) {
      bowPullSource.playbackRate.value = 0.8 + ratio * 0.6;
    }
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;

    // Stop bow-pull SFX
    if (audio) audio.stopSfx(bowPullSource);
    bowPullSource = null;

    if (currentPull >= MAX_PULL * 0.6) {
      triggerRelease();
    } else {
      // Snap back
      updateBowSVG(0);
      bowAssembly?.classList.remove('pulling');
    }
    currentPull = 0;
  }

  // Pointer events for desktop and mobile
  if (dragHandle) {
    dragHandle.addEventListener('pointerdown', (e) => {
      handleStart(e.clientY);
      try { dragHandle.setPointerCapture(e.pointerId); } catch (_) {}
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging) handleMove(e.clientY);
    });

    window.addEventListener('pointerup', () => {
      if (isDragging) handleEnd();
    });

    window.addEventListener('pointercancel', () => {
      if (isDragging) handleEnd();
    });

    // Tap/Click fallback — quick tap fires immediately
    dragHandle.addEventListener('click', () => {
      if (!arrowTriggered && currentPull < 10) {
        triggerRelease();
      }
    });

    // Keyboard accessibility
    dragHandle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerRelease();
      }
    });
  }

  return {
    reset() {
      arrowTriggered = false;
      isDragging = false;
      currentPull = 0;
      if (audio) audio.stopSfx(bowPullSource);
      bowPullSource = null;
      introArrow?.classList.remove('arrow-fly');
      introHeart?.classList.remove('burst');
      bowAssembly?.classList.remove('pulling');
      if (bowArrow) {
        bowArrow.style.opacity = '';
        bowArrow.setAttribute('transform', '');
      }
      updateBowSVG(0);
    }
  };
}

/**
 * SCENE 1: Letter by Letter Animated Hero Title + text-pop & cheer SFX
 */
function setupScene1(sceneManager) {
  const heroTitle = document.getElementById('hero-title');
  const heroYay = document.getElementById('hero-yay');
  const scene1Content = document.querySelector('.scene-1-content');
  const audio = sceneManager.audio;

  function startAnimation() {
    if (!heroTitle) return;
    heroTitle.innerHTML = "";
    const text = "It's your birthday!";

    // Create individual letter spans with incrementing stagger delays
    [...text].forEach((char, index) => {
      const span = createElement('span', 'letter');
      span.innerHTML = char === ' ' ? '&nbsp;' : char;
      span.style.display = 'inline-block';
      span.style.animationDelay = `${(index * 0.08).toFixed(2)}s`;
      heroTitle.appendChild(span);

      // Play text-pop per letter
      if (audio && char !== ' ') {
        setTimeout(() => {
          audio.playSfx('textPop', { volume: 0.3, rate: 0.9 + Math.random() * 0.3 });
        }, index * 80);
      }
    });

    // Show hero yay after all letters complete + play cheer
    if (heroYay) {
      heroYay.style.opacity = '0';
      heroYay.classList.remove('visible');
      const totalDelay = (text.length * 0.08 + 0.35) * 1000;
      setTimeout(() => {
        heroYay.classList.add('visible');
        heroYay.style.opacity = '1';
        heroYay.style.animation = 'fadeInUp 0.8s ease forwards';
        // Cheer + duck music
        if (audio) {
          audio.playSfx('cheer', { volume: 0.85 });
          audio.duckMusic(1500);
        }
      }, totalDelay);
    }
  }

  // Tapping anywhere on scene 1 advances to Scene 2
  scene1Content?.addEventListener('click', () => {
    sceneManager.next();
  });

  scene1Content?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      sceneManager.next();
    }
  });

  return {
    onEnter() {
      startAnimation();
    },
    reset() {
      if (heroTitle) heroTitle.innerHTML = "";
      if (heroYay) {
        heroYay.style.opacity = '0';
        heroYay.classList.remove('visible');
        heroYay.style.animation = '';
      }
    }
  };
}

/**
 * SCENE 2: Name Greeting & Floating Hearts + sparkle SFX
 */
function setupScene2(sceneManager) {
  const greetingName = document.getElementById('greeting-name');
  const greetingAge = document.getElementById('greeting-age');
  const bouquetImg = document.getElementById('bouquet-img');
  const floatingHeartsContainer = document.getElementById('floating-hearts');
  const scene2Content = document.querySelector('.scene-2-content');
  const audio = sceneManager.audio;

  // Inject content from CONFIG
  if (greetingName) {
    greetingName.textContent = CONFIG.RECIPIENT_NAME;
  }
  if (greetingAge) {
    greetingAge.textContent = `and somehow, you are ${CONFIG.AGE} already 🎊`;
  }
  if (bouquetImg) {
    bouquetImg.src = CONFIG.BOUQUET_IMG;
    bouquetImg.onerror = () => {
      bouquetImg.style.display = 'none';
    };
  }

  /**
   * Spawns 16-20 floating hearts with randomized properties.
   */
  function spawnFloatingHearts() {
    if (!floatingHeartsContainer) return;
    floatingHeartsContainer.innerHTML = '';
    const heartEmojis = ['❤️', '💕', '💗', '🩷', '💖'];
    const count = Math.floor(random(16, 21));

    for (let i = 0; i < count; i++) {
      const heart = createElement('span', 'float-heart', randomItem(heartEmojis));
      heart.style.left = `${random(3, 94).toFixed(1)}%`;
      heart.style.animationDelay = `${random(0, 6).toFixed(2)}s`;
      heart.style.animationDuration = `${random(3.2, 6).toFixed(2)}s`;
      heart.style.fontSize = `${random(0.85, 2.1).toFixed(2)}rem`;
      floatingHeartsContainer.appendChild(heart);
    }
  }

  spawnFloatingHearts();

  // Tapping anywhere calls next()
  scene2Content?.addEventListener('click', () => {
    sceneManager.next();
  });

  scene2Content?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      sceneManager.next();
    }
  });

  return {
    onEnter() {
      spawnFloatingHearts();
      // Soft sparkle when name appears
      if (audio) audio.playSfx('cardReveal', { volume: 0.5 });
    },
    reset() {
      spawnFloatingHearts();
    }
  };
}

/**
 * SCENE 3: Cake & Candle Wish Interaction + SFX
 */
function setupScene3(sceneManager) {
  const cakeContainer = document.getElementById('cake-container');
  const candleGroup = document.getElementById('candle-group');
  const candleFlame = document.getElementById('candle-flame');
  const cakeHint = document.getElementById('cake-hint');
  const cakeWishText = document.getElementById('cake-wish-text');
  const wishName = document.getElementById('wish-name');
  const cakeConfettiCanvas = document.getElementById('cake-confetti');
  const scene3Content = document.querySelector('.scene-3-content');
  const audio = sceneManager.audio;

  const confetti = new ConfettiEngine(cakeConfettiCanvas);
  let cakeState = 'waiting'; // 'waiting' -> 'candle-lit' -> 'blown-out' -> 'done'
  let autoAdvanceTimer = null;

  if (wishName) {
    wishName.textContent = CONFIG.RECIPIENT_NAME;
  }

  function handleCakeInteraction() {
    if (cakeState === 'waiting') {
      // Tap 1: show candle and update prompt
      cakeState = 'candle-lit';
      candleGroup?.classList.add('visible');
      if (cakeHint) cakeHint.textContent = 'Blow out the candle! 🌬️';
      // Match-strike SFX
      if (audio) audio.playSfx('matchStrike', { volume: 0.8 });
    } else if (cakeState === 'candle-lit') {
      // Tap 2: blow out candle, fire confetti, reveal wish text
      cakeState = 'blown-out';
      candleFlame?.classList.add('blown-out');
      if (cakeHint) cakeHint.textContent = '';
      cakeWishText?.classList.add('visible');

      // Blow SFX, then cheer + confetti
      if (audio) {
        audio.playSfx('blow', { volume: 0.8 });
        setTimeout(() => {
          audio.playSfx('cheer', { volume: 0.85 });
          audio.duckMusic(1500);
        }, 300);
        // Card-reveal ding for "Wish sent"
        setTimeout(() => {
          audio.playSfx('cardReveal', { volume: 0.6 });
        }, 800);
      }

      // Burst confetti from candle position
      if (cakeConfettiCanvas) {
        confetti.resize();
        let originX = cakeConfettiCanvas.width / 2;
        let originY = cakeConfettiCanvas.height * 0.42;

        if (candleFlame) {
          const flameRect = candleFlame.getBoundingClientRect();
          const canvasRect = cakeConfettiCanvas.getBoundingClientRect();
          originX = flameRect.left + flameRect.width / 2 - canvasRect.left;
          originY = flameRect.top + flameRect.height / 2 - canvasRect.top;
        }

        confetti.burst(originX, originY, 95);
      }

      // After 3s auto advance OR tap to advance
      autoAdvanceTimer = setTimeout(() => {
        if (cakeState === 'blown-out') {
          cakeState = 'done';
          sceneManager.next();
        }
      }, 3000);
    } else if (cakeState === 'blown-out') {
      // User tapped while blown out -> advance immediately
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      cakeState = 'done';
      sceneManager.next();
    }
  }

  // Tapping cake or scene content executes cake interaction
  scene3Content?.addEventListener('click', (e) => {
    handleCakeInteraction();
  });

  cakeContainer?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCakeInteraction();
    }
  });

  return {
    reset() {
      cakeState = 'waiting';
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      candleGroup?.classList.remove('visible');
      candleFlame?.classList.remove('blown-out');
      cakeWishText?.classList.remove('visible');
      if (cakeHint) cakeHint.textContent = 'Tap anywhere & make a wish 🕯️';
      confetti.clear();
    }
  };
}

/**
 * SCENE 4: Balloon Popping & Reasons + SFX
 */
function setupScene4(sceneManager) {
  const balloonsArea = document.getElementById('balloons-area');
  const reasonCardsContainer = document.getElementById('reason-cards');
  const balloonSubtext = document.getElementById('balloon-subtext');
  const allPoppedText = document.getElementById('all-popped-text');
  const btnNext4 = document.getElementById('btn-next-4');
  const audio = sceneManager.audio;

  const poppedSet = new Set();
  const balloonElements = balloonsArea ? balloonsArea.querySelectorAll('.balloon') : [];

  /**
   * Creates DOM particle explosion at balloon center.
   * @param {HTMLElement} balloonEl - Balloon element
   */
  function triggerBalloonParticleBurst(balloonEl) {
    const rect = balloonEl.getBoundingClientRect();
    const frame = document.getElementById('phone-frame') || document.body;
    const frameRect = frame.getBoundingClientRect();

    const originX = rect.left + rect.width / 2 - frameRect.left;
    const originY = rect.top + rect.height / 2 - frameRect.top;
    const particleCount = 18;

    for (let i = 0; i < particleCount; i++) {
      const p = createElement('div', 'balloon-particle');
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const distance = random(45, 95);
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance;
      const size = random(6, 12);
      const color = randomItem(CONFETTI_COLORS);

      p.style.position = 'absolute';
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.borderRadius = '50%';
      p.style.background = color;
      p.style.pointerEvents = 'none';
      p.style.zIndex = '120';
      p.style.transform = 'translate(-50%, -50%) scale(1)';
      p.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1), opacity 0.5s ease';
      p.style.opacity = '1';

      frame.appendChild(p);

      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(0)`;
        p.style.opacity = '0';
      });

      setTimeout(() => {
        p.remove();
      }, 550);
    }
  }

  /**
   * Handles popping of a balloon by index.
   * @param {HTMLElement} balloonEl - The balloon element
   */
  function popBalloon(balloonEl) {
    const index = parseInt(balloonEl.getAttribute('data-index'), 10);
    if (poppedSet.has(index)) return;

    poppedSet.add(index);
    balloonEl.classList.add('popped');
    triggerBalloonParticleBurst(balloonEl);

    // Balloon pop SFX with randomized pitch
    if (audio) audio.playSfx('balloonPop', { volume: 0.8, rate: 0.9 + Math.random() * 0.25 });

    // After pop animation (400ms), create and append reason card
    setTimeout(() => {
      if (!reasonCardsContainer) return;
      const card = createElement('div', 'reason-card');
      const reasonText = CONFIG.REASONS[index] || "";
      card.innerHTML = `
        <p class="reason-label">REASON NO.${index + 1} 💗</p>
        <p class="reason-body">${reasonText}</p>
      `;
      reasonCardsContainer.appendChild(card);

      // Card-reveal ding
      if (audio) audio.playSfx('cardReveal', { volume: 0.6 });

      // Smooth scroll container to newest card
      reasonCardsContainer.scrollTo({
        top: reasonCardsContainer.scrollHeight,
        behavior: 'smooth'
      });

      // When all 4 balloons popped, show finale UI for scene
      if (poppedSet.size === 4) {
        if (balloonSubtext) {
          balloonSubtext.textContent = 'All 4 reasons unlocked! Every single word is true 💗';
        }
        allPoppedText?.classList.add('visible');
        if (btnNext4) btnNext4.style.display = 'block';
        // All-popped success chime
        if (audio) audio.playSfx('allPopped', { volume: 0.75 });
      }
    }, 400);
  }

  // Attach event listeners to balloons
  balloonElements.forEach((balloon) => {
    balloon.addEventListener('click', (e) => {
      e.stopPropagation();
      popBalloon(balloon);
    });

    balloon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        popBalloon(balloon);
      }
    });
  });

  btnNext4?.addEventListener('click', () => {
    if (audio) audio.playSfx('click', { volume: 0.7 });
    sceneManager.next();
  });

  return {
    reset() {
      poppedSet.clear();
      balloonElements.forEach(b => b.classList.remove('popped'));
      if (reasonCardsContainer) reasonCardsContainer.innerHTML = '';
      if (balloonSubtext) balloonSubtext.textContent = '4 reasons are waiting inside. One pop at a time.';
      allPoppedText?.classList.remove('visible');
      if (btnNext4) btnNext4.style.display = 'none';
    }
  };
}

/**
 * SCENE 5: Photo Carousel & Dots with staggered entrance + swipe/click SFX
 */
function setupScene5(sceneManager) {
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const btnNext5 = document.getElementById('btn-next-5');
  const audio = sceneManager.audio;

  if (!track || !dotsContainer) return;

  // Fixed alternating tilt angles from CONFIG
  const tilts = CONFIG.PHOTO_TILTS || [-3, 2, -2, 3, -1];
  let lastActiveIndex = 0;

  function renderCarousel() {
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    CONFIG.PHOTOS.forEach((photo, i) => {
      // Polaroid element with fixed alternating tilt
      const rotation = tilts[i % tilts.length];
      const polaroid = createElement('div', 'polaroid');
      polaroid.setAttribute('data-index', i.toString());
      polaroid.style.setProperty('--rotation', `${rotation}deg`);

      polaroid.innerHTML = `
        <div class="polaroid-inner">
          <img class="polaroid-img" src="${photo.src}" alt="${photo.caption || 'Memory'}" loading="lazy">
          <p class="polaroid-caption">${photo.caption}</p>
        </div>
      `;

      // Handle image errors gracefully
      const img = polaroid.querySelector('img');
      img?.addEventListener('error', () => {
        img.alt = photo.caption || 'Memory';
      });

      track.appendChild(polaroid);

      // Corresponding pagination dot
      const dot = createElement('span', `dot ${i === 0 ? 'active' : ''}`);
      dot.setAttribute('data-index', i.toString());
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', `View photo ${i + 1}`);

      dot.addEventListener('click', () => {
        if (audio) audio.playSfx('click', { volume: 0.5 });
        scrollToIndex(i);
      });

      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (audio) audio.playSfx('click', { volume: 0.5 });
          scrollToIndex(i);
        }
      });

      dotsContainer.appendChild(dot);
    });
  }

  function scrollToIndex(index) {
    const cards = track.querySelectorAll('.polaroid');
    if (cards[index]) {
      const card = cards[index];
      const targetLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
      track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    }
  }

  // Scroll listener with throttle to sync active dot with scroll position
  let scrollThrottle = null;
  track.addEventListener('scroll', () => {
    if (scrollThrottle) return;
    scrollThrottle = setTimeout(() => {
      scrollThrottle = null;
      updateActiveDot();
    }, 60);
  }, { passive: true });

  function updateActiveDot() {
    const cards = track.querySelectorAll('.polaroid');
    const dots = dotsContainer.querySelectorAll('.dot');
    if (!cards.length) return;

    let closestIndex = 0;
    let minDistance = Infinity;
    const center = track.scrollLeft + track.clientWidth / 2;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    if (closestIndex !== lastActiveIndex) {
      lastActiveIndex = closestIndex;
      // Play swipe sound on every card snap change
      if (audio) audio.playSfx('swipe', { volume: 0.5 });
    }

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === closestIndex);
    });
  }

  /**
   * Staggered entrance: fade+slide each polaroid in with a delay
   */
  function playEntrance() {
    const cards = track.querySelectorAll('.polaroid');
    cards.forEach((card, i) => {
      card.classList.remove('polaroid-visible');
      // Stagger: each card appears 150ms after the previous
      setTimeout(() => {
        card.style.transitionDelay = `${i * 0.12}s`;
        card.classList.add('polaroid-visible');
      }, 80 + i * 150);
    });
  }

  /**
   * Reset entrance state so it can replay
   */
  function resetEntrance() {
    const cards = track.querySelectorAll('.polaroid');
    cards.forEach((card) => {
      card.classList.remove('polaroid-visible');
      card.style.transitionDelay = '';
    });
  }

  renderCarousel();

  btnNext5?.addEventListener('click', () => {
    if (audio) audio.playSfx('click', { volume: 0.7 });
    sceneManager.next();
  });

  return {
    onEnter() {
      playEntrance();
    },
    onLeave() {
      // Keep cards visible when leaving (looks better if user goes back)
    },
    reset() {
      resetEntrance();
      lastActiveIndex = 0;
      track.scrollTo({ left: 0, behavior: 'auto' });
      updateActiveDot();
    }
  };
}

/**
 * SCENE 6: Envelope & Typewriter Letter + SFX
 */
function setupScene6(sceneManager) {
  const letterName = document.getElementById('letter-name');
  const letterSender = document.getElementById('letter-sender');
  const waxSeal = document.getElementById('wax-seal');
  const envelopeContainer = document.getElementById('envelope-container');
  const envelope = document.getElementById('envelope');
  const envelopeHint = document.getElementById('envelope-hint');
  const letterCard = document.getElementById('letter-card');
  const letterBody = document.getElementById('letter-body');
  const letterSign = document.getElementById('letter-sign');
  const btnNext6 = document.getElementById('btn-next-6');
  const audio = sceneManager.audio;

  let envelopeOpened = false;
  let typewriterTimeout = null;
  let typewriterSource = null;

  // Initialize text content
  if (letterName) letterName.textContent = CONFIG.RECIPIENT_NAME;
  if (letterSender) letterSender.textContent = CONFIG.SENDER_NAME;
  if (waxSeal && CONFIG.SENDER_NAME) {
    const sealSpan = waxSeal.querySelector('span');
    if (sealSpan) sealSpan.textContent = CONFIG.SENDER_NAME.trim().charAt(0).toUpperCase();
  }

  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    // Play envelope-open SFX
    if (audio) audio.playSfx('envelopeOpen', { volume: 0.85 });

    // 1. Add 'opened' class to #envelope
    envelope?.classList.add('opened');
    if (envelopeHint) envelopeHint.style.opacity = '0';

    // 2. After 600ms, hide envelope container and show letter card
    setTimeout(() => {
      if (envelopeContainer) envelopeContainer.style.display = 'none';
      letterCard?.classList.add('visible');
      startTypewriter();
    }, 600);
  }

  function startTypewriter() {
    if (!letterBody) return;
    letterBody.innerHTML = '';
    if (letterSign) letterSign.textContent = '';
    if (btnNext6) btnNext6.style.display = 'none';

    // Start looping typewriter SFX at low volume
    if (audio) {
      typewriterSource = audio.playSfx('typewriter', { volume: 0.25, loop: true });
    }

    // Parse LETTER_TEXT and replace {name}
    const parsedText = CONFIG.LETTER_TEXT.replace(/\{name\}/gi, CONFIG.RECIPIENT_NAME);
    let charIndex = 0;

    [...parsedText].forEach((char) => {
      if (char === '\n') {
        const br = document.createElement('br');
        letterBody.appendChild(br);
      } else {
        const span = createElement('span', 'typed-char', char);
        span.style.animationDelay = `${charIndex * 30}ms`;
        letterBody.appendChild(span);
        charIndex++;
      }
    });

    const totalDuration = charIndex * 30 + 400;

    typewriterTimeout = setTimeout(() => {
      finishTypewriter();
    }, totalDuration);
  }

  function finishTypewriter() {
    if (typewriterTimeout) clearTimeout(typewriterTimeout);

    // Stop typewriter audio loop
    if (audio) audio.stopSfx(typewriterSource);
    typewriterSource = null;

    // Reveal signature
    if (letterSign) {
      letterSign.textContent = `All my love, — ${CONFIG.SENDER_NAME}`;
      letterSign.style.animation = 'fadeInUp 0.6s ease forwards';
    }

    letterCard?.classList.add('typing-done');

    if (btnNext6) {
      btnNext6.style.display = 'block';
      btnNext6.style.animation = 'fadeInUp 0.6s ease forwards';
    }
  }

  // Envelope tap triggers opening
  envelopeContainer?.addEventListener('click', openEnvelope);
  envelopeContainer?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  // Tap letter to skip typing animation if desired
  letterCard?.addEventListener('click', (e) => {
    if (e.target.closest('#btn-next-6')) return;
    if (envelopeOpened && !letterCard.classList.contains('typing-done')) {
      finishTypewriter();
    }
  });

  btnNext6?.addEventListener('click', () => {
    if (audio) audio.playSfx('click', { volume: 0.7 });
    sceneManager.next();
  });

  return {
    reset() {
      envelopeOpened = false;
      if (typewriterTimeout) clearTimeout(typewriterTimeout);
      if (audio) audio.stopSfx(typewriterSource);
      typewriterSource = null;
      envelope?.classList.remove('opened');
      if (envelopeContainer) envelopeContainer.style.display = '';
      if (envelopeHint) envelopeHint.style.opacity = '';
      letterCard?.classList.remove('visible', 'typing-done');
      if (letterBody) letterBody.innerHTML = '';
      if (letterSign) {
        letterSign.textContent = '';
        letterSign.style.animation = '';
      }
      if (btnNext6) {
        btnNext6.style.display = 'none';
        btnNext6.style.animation = '';
      }
    }
  };
}

/**
 * SCENE 7: Finale & Continuous Confetti + fanfare & tap SFX
 */
function setupScene7(sceneManager) {
  const finaleName = document.getElementById('finale-name');
  const finaleTeddy = document.getElementById('finale-teddy');
  const finaleFooter = document.getElementById('finale-footer');
  const finaleConfettiCanvas = document.getElementById('finale-confetti');
  const btnReplay = document.getElementById('btn-replay');
  const scene7Content = document.querySelector('.scene-7-content');
  const audio = sceneManager.audio;

  const confetti = new ConfettiEngine(finaleConfettiCanvas);

  // Inject content from CONFIG
  if (finaleName) finaleName.textContent = `${CONFIG.RECIPIENT_NAME} !`;
  if (finaleTeddy) {
    finaleTeddy.src = CONFIG.TEDDY_IMG;
    finaleTeddy.onerror = () => {
      finaleTeddy.style.display = 'none';
    };
  }
  if (finaleFooter) {
    finaleFooter.textContent = `Made with love, just for you — ${CONFIG.SENDER_NAME} ❤️`;
  }

  // Tapping anywhere on scene 7 bursts extra confetti at tap position + gentle pop SFX
  scene7Content?.addEventListener('click', (e) => {
    if (e.target.closest('#btn-replay')) return;
    if (audio) {
      audio.playSfx('balloonPop', { volume: 0.25, rate: 1.1 + Math.random() * 0.2 });
    }
    if (finaleConfettiCanvas) {
      confetti.resize();
      const rect = finaleConfettiCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      confetti.burst(clickX, clickY, 65);
    }
  });

  // Replay button resets all scene states, restarts music from beginning, and returns to Scene 0
  btnReplay?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio) {
      audio.playSfx('click', { volume: 0.7 });
      audio.restartMusic();
    }
    confetti.clear();
    sceneManager.resetAll();
    sceneManager.goTo(0);
  });

  return {
    onEnter() {
      confetti.startContinuous();
      // Celebratory fanfare + duck background music
      if (audio) {
        audio.playSfx('finaleFanfare', { volume: 0.9 });
        audio.duckMusic(2200);
      }
    },
    onLeave() {
      confetti.stopContinuous();
      confetti.clear();
    },
    reset() {
      confetti.clear();
    }
  };
}

// ============================================================================
// 7. SCENE MANAGER
// Central state machine controlling transitions (0 through 7)
// ============================================================================
class SceneManager {
  constructor(audioManager) {
    this.audio = audioManager;
    this.currentScene = 0;
    this.isTransitioning = false;
    this.scenes = document.querySelectorAll('.scene');
    this.controllers = {};

    // Background sparkles engine
    const sparklesCanvas = document.getElementById('sparkles-canvas');
    this.sparkles = new SparklesRenderer(sparklesCanvas);
  }

  /**
   * Initializes scene event listeners and loads first scene state.
   */
  init() {
    // Register scene controllers
    this.controllers[0] = setupScene0(this);
    this.controllers[1] = setupScene1(this);
    this.controllers[2] = setupScene2(this);
    this.controllers[3] = setupScene3(this);
    this.controllers[4] = setupScene4(this);
    this.controllers[5] = setupScene5(this);
    this.controllers[6] = setupScene6(this);
    this.controllers[7] = setupScene7(this);

    // Initial sparkles check
    this.updateSparkles(0);

    // Handle global resize
    window.addEventListener('resize', () => {
      this.sparkles.resize();
    }, { passive: true });
  }

  /**
   * Navigates to a specific scene index with 600ms transition.
   * @param {number} targetIndex - Target scene index (0-7)
   */
  goTo(targetIndex) {
    if (targetIndex < 0 || targetIndex >= this.scenes.length) return;
    if (targetIndex === this.currentScene || this.isTransitioning) return;

    // Transition sound effect
    if (this.audio) {
      this.audio.playSfx('tapNext', { volume: 0.6 });
    }

    this.isTransitioning = true;
    const oldIndex = this.currentScene;
    const oldScene = document.getElementById(`scene-${oldIndex}`);
    const newScene = document.getElementById(`scene-${targetIndex}`);

    if (this.controllers[oldIndex]?.onLeave) {
      this.controllers[oldIndex].onLeave();
    }

    // Remove active and add exit to previous scene
    oldScene?.classList.remove('active');
    oldScene?.classList.add('exit');

    // After 600ms, finalize transition
    setTimeout(() => {
      oldScene?.classList.remove('exit');
      newScene?.classList.add('active');
      this.currentScene = targetIndex;
      this.isTransitioning = false;

      // Update sparkles based on new scene data-bg
      this.updateSparkles(targetIndex);

      // Trigger enter hook of new scene
      if (this.controllers[targetIndex]?.onEnter) {
        this.controllers[targetIndex].onEnter();
      }
    }, 600);
  }

  /**
   * Advances to next scene.
   */
  next() {
    if (this.currentScene < this.scenes.length - 1) {
      this.goTo(this.currentScene + 1);
    }
  }

  /**
   * Controls sparkles visibility (active only on dark background scenes).
   * @param {number} sceneIndex - Scene index
   */
  updateSparkles(sceneIndex) {
    const scene = document.getElementById(`scene-${sceneIndex}`);
    const bg = scene ? scene.getAttribute('data-bg') : null;

    if (bg === 'dark') {
      this.sparkles.start();
    } else {
      this.sparkles.stop();
    }
  }

  /**
   * Resets all scene controllers for replay.
   */
  resetAll() {
    Object.values(this.controllers).forEach((ctrl) => {
      if (ctrl?.reset) ctrl.reset();
    });
  }
}

// ============================================================================
// 8. GLOBAL INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Prevent text selection and double-tap zoom gestures
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';

  // Initialize Audio Manager
  const audioManager = new AudioManager();

  // Initialize Scene Manager with audioManager reference
  const sceneManager = new SceneManager(audioManager);
  sceneManager.init();
});
