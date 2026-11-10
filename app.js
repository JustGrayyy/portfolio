/**
 * ============================================================================
 * Main Controller & 2D Manga Chibi Physics Engine
 * Tactile cursor hit detection, juggling, grab-and-toss, and Umaru reactions
 * ============================================================================
 */

(function () {
  'use strict';

  const sound = window.PortfolioWall.sound;
  const particles = window.PortfolioWall.particles;

  // Funny Umaru-Style Chibi Developer Quotes
  const CHIBI_QUOTES = [
    'hammering out the bugs!',
    'CSS is almost aligned!',
    'want cola & potato chips!',
    'compiling... probably.',
    'five more minutes of work...',
    'building something awesome.....',
    'don\'t poke the builder!',
    'website is currently being built!',
    'git commit -m "fixed it"',
    'almost done..... maybe!',
    'snack break incoming!',
    'it works on my machine!'
  ];

  class MangaChibiPlayground {
    constructor() {
      // DOM Elements
      this.stage = document.getElementById('manga-stage');
      this.titleCard = document.getElementById('title-card');
      this.chibiActor = document.getElementById('chibi-actor');
      this.squashRoot = document.getElementById('chibi-squash-root');
      this.shadowEl = document.getElementById('chibi-shadow');
      this.speechBubble = document.getElementById('chibi-speech');
      this.speechText = document.getElementById('speech-text');
      this.angerVein = document.getElementById('manga-anger-vein');
      this.sweatDrop = document.getElementById('manga-sweat-drop');
      this.groundLine = document.getElementById('ground-line');
      this.chipsProp = document.getElementById('prop-chips');
      this.cokeProp = document.getElementById('prop-coke');

      // Expression Elements
      this.eyeElements = document.querySelectorAll('.eye-state');
      this.mouthElements = document.querySelectorAll('.mouth-state');

      // Physics State (Chibi center position, velocity, and rotation)
      this.width = 220;
      this.height = 220;
      this.radius = 75; // Hitbox circle radius

      this.lastWindowWidth = window.innerWidth;
      this.x = window.innerWidth / 2;
      this.y = window.innerHeight * 0.72;
      this.vx = 0;
      this.vy = 0;
      this.rotation = 0;
      this.angularVelocity = 0;

      // Spring Squash & Stretch
      this.scaleX = 1.0;
      this.scaleY = 1.0;
      this.scaleVx = 0;
      this.scaleVy = 0;

      // Cursor Physics Tracking
      this.mouseX = this.x;
      this.mouseY = this.y;
      this.prevMouseX = this.x;
      this.prevMouseY = this.y;
      this.cursorVx = 0;
      this.cursorVy = 0;
      this.cursorSpeed = 0;
      this.lastMouseTime = performance.now();
      this.lastHitTime = 0;

      // Drag & Hold State
      this.isPointerDownOnChibi = false;
      this.isDragging = false;
      this.dragStartTime = 0;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;

      // Interaction Cadence
      this.clickCount = 0;
      this.lastClickTime = 0;
      this.lastSpeechTime = 0;
      this.speechTimer = null;
      this.idleTimer = 0;

      // Chibi State: 'IDLE', 'HIT_AIRBORNE', 'DIZZY', 'ROLLING', 'POUT', 'GRABBED'
      this.state = 'IDLE';
      this.dizzyTimeout = null;

      this.lastFrameTime = performance.now();
      this.tick = this.tick.bind(this);
    }

    init() {
      // 1. Initialize FX Canvas & Audio Engine
      const fxCanvas = document.getElementById('fx-canvas');
      particles.init(fxCanvas);

      // 2. Setup Initial Position
      this.calculateDimensions();
      this.x = window.innerWidth / 2;
      this.y = this.getFloorY();

      // 3. Setup Listeners & State
      this.chibiActor.classList.add('state-idle');
      this.setupEventListeners();

      // 4. Start 60fps Physics & Render Loop
      requestAnimationFrame(this.tick);
    }

    calculateDimensions() {
      const isMobile = window.innerWidth <= 768;
      this.width = isMobile ? 180 : 220;
      this.height = isMobile ? 180 : 220;
      this.radius = isMobile ? 62 : 76;

      const minX = this.radius + 15;
      const maxX = Math.max(minX, window.innerWidth - this.radius - 15);
      this.x = Math.max(minX, Math.min(this.x, maxX));
    }

    getFloorY() {
      if (!this.groundLine) return window.innerHeight * 0.76;
      const rect = this.groundLine.getBoundingClientRect();
      return rect.top + 2;
    }

    /* -------------------------------------------------------------------------
       Expression & Speech Controls
       ------------------------------------------------------------------------- */

    setEyes(id) {
      this.eyeElements.forEach(el => {
        if (el.id === id) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    }

    setMouth(id) {
      this.mouthElements.forEach(el => {
        if (el.id === id) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    }

    setVein(active) {
      if (this.angerVein) {
        if (active) this.angerVein.classList.add('active');
        else this.angerVein.classList.remove('active');
      }
    }

    setSweat(active) {
      if (this.sweatDrop) {
        if (active) this.sweatDrop.classList.add('active');
        else this.sweatDrop.classList.remove('active');
      }
    }

    say(text, duration = 2400) {
      if (!this.speechBubble || !this.speechText) return;
      this.speechText.textContent = text;
      this.speechBubble.classList.add('active');

      if (this.speechTimer) clearTimeout(this.speechTimer);
      this.speechTimer = setTimeout(() => {
        this.speechBubble.classList.remove('active');
      }, duration);
    }

    /* -------------------------------------------------------------------------
       Event Listeners
       ------------------------------------------------------------------------- */

    setupEventListeners() {
      // Interactive Potato Chips Bag (Crunch & Rustle)
      if (this.chipsProp) {
        const triggerChips = (e) => {
          e.stopPropagation();
          sound.unlockAudio();
          sound.playCrunch();
          this.chipsProp.classList.remove('pop');
          void this.chipsProp.offsetWidth;
          this.chipsProp.classList.add('pop');
          const rect = this.chipsProp.getBoundingClientRect();
          particles.emitMangaSFX(rect.left + rect.width / 2, rect.top, '*CRUNCH!*', 'サクッ!');
          this.setEyes('eyes-happy');
          this.setMouth('mouth-open');
          const chipQuotes = [
            'potato chips are fuel!',
            'crispy & delicious!',
            'crunch crunch!',
            'chips keep the dev alive!'
          ];
          this.say(chipQuotes[Math.floor(Math.random() * chipQuotes.length)], 2000);
          setTimeout(() => {
            if (this.state === 'IDLE') {
              this.setEyes('eyes-default');
              this.setMouth('mouth-cat');
            }
          }, 850);
        };
        this.chipsProp.addEventListener('click', triggerChips);
        this.chipsProp.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            triggerChips(e);
          }
        });
      }

      // Interactive 2L Bottle of Coke (Fizz & Soda Bubbles)
      if (this.cokeProp) {
        const triggerCoke = (e) => {
          e.stopPropagation();
          sound.unlockAudio();
          sound.playFizz();
          this.cokeProp.classList.remove('pop');
          void this.cokeProp.offsetWidth;
          this.cokeProp.classList.add('pop');
          const rect = this.cokeProp.getBoundingClientRect();
          particles.emitMangaSFX(rect.left + rect.width / 2, rect.top, '*PSSSHT!*', 'シュワッ!');
          particles.emitSodaBubbles(rect.left + rect.width / 2, rect.top + 8, 14);
          this.setEyes('eyes-happy');
          this.setMouth('mouth-open');
          const cokeQuotes = [
            'cola is life!!',
            'refreshing cola break~',
            'sugar boost activated!',
            'nothing beats cold cola!'
          ];
          this.say(cokeQuotes[Math.floor(Math.random() * cokeQuotes.length)], 2000);
          setTimeout(() => {
            if (this.state === 'IDLE') {
              this.setEyes('eyes-default');
              this.setMouth('mouth-cat');
            }
          }, 850);
        };
        this.cokeProp.addEventListener('click', triggerCoke);
        this.cokeProp.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            triggerCoke(e);
          }
        });
      }

      // Keyboard Shortcut 'M' for Audio Mute
      window.addEventListener('keydown', (e) => {
        if (e.key === 'm' || e.key === 'M') {
          sound.toggleMute();
        }
      });

      // Window Resize
      window.addEventListener('resize', () => {
        const ratio = window.innerWidth / (this.lastWindowWidth || window.innerWidth);
        this.x *= ratio;
        this.lastWindowWidth = window.innerWidth;
        this.calculateDimensions();
        // Keep inside bounds
        const floorY = this.getFloorY();
        if (this.y > floorY) {
          this.y = floorY;
        }
      });

      // Pointer Velocity Tracking across full window
      window.addEventListener('pointermove', (e) => {
        sound.unlockAudio(); // Unlocks on first gesture
        const now = performance.now();
        const dt = Math.max((now - this.lastMouseTime) / 1000, 0.001);

        this.cursorVx = (e.clientX - this.prevMouseX) / dt;
        this.cursorVy = (e.clientY - this.prevMouseY) / dt;
        this.cursorSpeed = Math.hypot(this.cursorVx, this.cursorVy);

        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.lastMouseTime = now;

        // If dragging chibi
        if (this.isDragging) {
          this.x = e.clientX - this.dragOffsetX;
          this.y = e.clientY - this.dragOffsetY;
          this.vx = this.cursorVx * 0.75;
          this.vy = this.cursorVy * 0.75;
          this.angularVelocity = this.cursorVx * 0.12;
          return;
        }

        // Check if pointer is hitting the chibi
        this.checkCursorCollision(e.clientX, e.clientY, now);
      });

      // Pointer Down on Chibi (Poke / Grab Start)
      this.chibiActor.addEventListener('pointerdown', (e) => {
        sound.unlockAudio();
        e.preventDefault();
        this.isPointerDownOnChibi = true;
        this.dragStartTime = performance.now();
        this.dragOffsetX = e.clientX - this.x;
        this.dragOffsetY = e.clientY - this.y;

        // Arm grab timeout: if held for >150ms, become dragging
        setTimeout(() => {
          if (this.isPointerDownOnChibi) {
            this.startDragging();
          }
        }, 150);
      });

      // Global Pointer Up (Release Drag / Click complete)
      window.addEventListener('pointerup', (e) => {
        if (this.isDragging) {
          this.releaseDrag();
        } else if (this.isPointerDownOnChibi) {
          this.handleClickPoke(e.clientX, e.clientY);
        }
        this.isPointerDownOnChibi = false;
        this.isDragging = false;
      });

      // Spacebar or Enter to Poke
      this.chibiActor.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.handleClickPoke(this.x, this.y - this.radius);
        }
      });
    }

    /* -------------------------------------------------------------------------
       Cursor Hit Mechanics (Mouse pointer hitting chibi)
       ------------------------------------------------------------------------- */

    checkCursorCollision(mx, my, now) {
      if (this.isDragging) return;

      // Chibi center is at (x, y - radius)
      const chibiCenterX = this.x;
      const chibiCenterY = this.y - this.radius;
      const dx = chibiCenterX - mx;
      const dy = chibiCenterY - my;
      const dist = Math.hypot(dx, dy);

      const hitThreshold = this.radius + 18;

      if (dist < hitThreshold) {
        // Enforce cooldown between consecutive hits from single stroke
        if (now - this.lastHitTime < 110) return;

        // Check if cursor has enough velocity to be considered a "hit"
        if (this.cursorSpeed > 280) {
          this.executeHit(mx, my, dx, dy, dist, now);
        }
      }
    }

    executeHit(mx, my, dx, dy, dist, now) {
      this.lastHitTime = now;
      this.idleTimer = 0;

      // Impact Normal Vector
      const nx = dist > 0.001 ? dx / dist : 0;
      const ny = dist > 0.001 ? dy / dist : -1;

      // Transfer momentum from cursor speed
      const intensity = Math.min(this.cursorSpeed / 800, 2.8);
      const impulseX = (this.cursorVx * 0.55 + nx * 220) * (0.8 + intensity * 0.2);
      const impulseY = Math.min((this.cursorVy * 0.55 + ny * 200), -260 * intensity);

      this.vx = impulseX;
      this.vy = impulseY;
      this.angularVelocity = (this.cursorVx * 0.22 + (Math.random() - 0.5) * 120);

      // Squash deformation based on hit direction
      this.scaleX = 1.35;
      this.scaleY = 0.65;
      this.scaleVx = -25;
      this.scaleVy = 25;

      // Audio & Particle FX
      sound.playBonk(intensity);
      particles.emitImpactBurst(mx, my, intensity);
      particles.emitSpeedLine(mx, my, this.cursorVx, this.cursorVy);

      if (this.cursorSpeed > 1100) {
        // Huge Hit / Home Run!
        particles.emitMangaSFX(this.x, this.y - this.height, '*HOME RUN!*', 'ドカッ!!');
        this.setEyes('eyes-bonked');
        this.setMouth('mouth-open');
        this.setSweat(true);
        this.say('WAAAHHH!!', 1500);
      } else {
        // Crisp Bonk / Nudge
        const sfxChoices = [
          { text: '*BONK!*', sub: 'ドカッ' },
          { text: '*POW!*', sub: 'ばしっ' },
          { text: '*SMACK*', sub: 'ぺちっ' },
          { text: '*WHACK*', sub: 'ぼこっ' }
        ];
        const choice = sfxChoices[Math.floor(Math.random() * sfxChoices.length)];
        particles.emitMangaSFX(mx, my, choice.text, choice.sub);

        this.setEyes('eyes-bonked');
        this.setMouth('mouth-pout');
      }

      this.state = 'HIT_AIRBORNE';
      this.chibiActor.classList.remove('state-idle');
      this.chibiActor.classList.add('flailing');

      // Reset eyes after short delay if not dizzy
      setTimeout(() => {
        if (this.state === 'HIT_AIRBORNE') {
          this.setEyes('eyes-blank');
        }
      }, 350);
    }

    /* -------------------------------------------------------------------------
       Click / Poke / Grab Interactions
       ------------------------------------------------------------------------- */

    startDragging() {
      this.isDragging = true;
      this.state = 'GRABBED';
      this.chibiActor.classList.add('is-grabbed', 'flailing');
      this.chibiActor.classList.remove('state-idle');
      this.setEyes('eyes-blank');
      this.setMouth('mouth-wavy');
      this.setSweat(true);

      sound.playSqueak('hit');
      particles.emitMangaSFX(this.x, this.y - this.height, '*GRAB*', 'つままれ');
    }

    releaseDrag() {
      this.state = 'HIT_AIRBORNE';
      this.chibiActor.classList.remove('is-grabbed');

      // Fling chibi with throw speed
      this.vx = Math.max(-1400, Math.min(this.cursorVx * 0.85, 1400));
      this.vy = Math.max(-1200, Math.min(this.cursorVy * 0.85, 800));
      this.angularVelocity = this.cursorVx * 0.2;

      sound.playBoing();
      particles.emitMangaSFX(this.x, this.y - this.radius, '*FLING!*', 'ぽいっ');

      setTimeout(() => {
        this.chibiActor.classList.remove('flailing');
        this.setSweat(false);
      }, 500);
    }

    handleClickPoke(cx, cy) {
      const now = performance.now();
      this.idleTimer = 0;

      // Track multi-click cadence (Umaru Tantrum trigger)
      if (now - this.lastClickTime < 450) {
        this.clickCount++;
      } else {
        this.clickCount = 1;
      }
      this.lastClickTime = now;

      if (this.clickCount >= 4) {
        // Multi-click: UMARU TANTRUM / FLOOR ROLL!
        this.triggerUmaruTantrum();
        return;
      }

      // Single poke / hop
      this.scaleX = 1.25;
      this.scaleY = 0.75;
      this.scaleVx = -18;
      this.scaleVy = 18;

      // Tiny playful hop if on floor
      if (Math.abs(this.y - this.getFloorY()) < 5) {
        this.vy = -340;
      }

      sound.playSqueak('poke');
      sound.playBoing();

      const pokeSFX = [
        { text: '*POKE*', sub: 'ぷにっ' },
        { text: '*SQUISH*', sub: 'もちっ' },
        { text: '*BOING*', sub: 'ぽよん' },
        { text: '*SQUEAK*', sub: 'きゅっ' }
      ];
      const p = pokeSFX[Math.floor(Math.random() * pokeSFX.length)];
      particles.emitMangaSFX(this.x, this.y - this.radius, p.text, p.sub);

      this.setEyes('eyes-happy');
      this.setMouth('mouth-open');

      // Random funny developer quote
      if (now - this.lastSpeechTime > 1800) {
        this.lastSpeechTime = now;
        const quote = CHIBI_QUOTES[Math.floor(Math.random() * CHIBI_QUOTES.length)];
        this.say(quote, 2200);
      }

      setTimeout(() => {
        if (this.state === 'IDLE') {
          this.setEyes('eyes-default');
          this.setMouth('mouth-cat');
        }
      }, 450);
    }

    triggerUmaruTantrum() {
      this.clickCount = 0;
      this.state = 'ROLLING';
      this.chibiActor.classList.add('state-rolling', 'flailing');
      this.chibiActor.classList.remove('state-idle');

      this.setEyes('eyes-bonked');
      this.setMouth('mouth-open');
      this.setVein(true);
      this.setSweat(true);

      // Floor speed
      this.vx = (Math.random() > 0.5 ? 1 : -1) * 380;
      this.vy = -180;

      sound.playRollRustle();
      sound.playSqueak('pout');
      particles.emitMangaSFX(this.x, this.y - this.height, 'NOOOO!!', 'ゴロゴロ!!');
      this.say('I DON\'T WANNA CODE!!', 3000);

      setTimeout(() => {
        this.state = 'POUT';
        this.chibiActor.classList.remove('state-rolling');
        this.setEyes('eyes-pout');
        this.setMouth('mouth-pout');
        this.say('hmpff!', 1600);

        setTimeout(() => {
          this.state = 'IDLE';
          this.chibiActor.classList.remove('flailing');
          this.chibiActor.classList.add('state-idle');
          this.setVein(false);
          this.setSweat(false);
          this.setEyes('eyes-default');
          this.setMouth('mouth-cat');
        }, 2200);
      }, 2600);
    }

    triggerDizzy() {
      this.state = 'DIZZY';
      this.setEyes('eyes-dizzy');
      this.setMouth('mouth-wavy');
      this.setSweat(true);
      this.chibiActor.classList.remove('state-idle', 'flailing');

      sound.playDizzySwirl();
      particles.emitMangaSFX(this.x, this.y - this.height, '*DIZZY*', 'クラクラ~');
      this.say('@ _ @ ...', 2400);

      if (this.dizzyTimeout) clearTimeout(this.dizzyTimeout);
      this.dizzyTimeout = setTimeout(() => {
        if (this.state === 'DIZZY') {
          this.state = 'IDLE';
          this.setEyes('eyes-default');
          this.setMouth('mouth-cat');
          this.setSweat(false);
          this.chibiActor.classList.add('state-idle');
        }
      }, 2600);
    }

    /* -------------------------------------------------------------------------
       60fps Physics Integration & Collision Resolution
       ------------------------------------------------------------------------- */

    tick(now) {
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
      this.lastFrameTime = now;

      this.updatePhysics(dt);
      this.updateAutonomousBehavior(dt);
      this.render();

      requestAnimationFrame(this.tick);
    }

    updatePhysics(dt) {
      if (this.isDragging) {
        // While dragging, damp scale spring
        this.updateSpring(dt);
        return;
      }

      const floorY = this.getFloorY();
      const gravity = 1500; // px/s^2

      // Apply Gravity if above floor
      if (this.y < floorY - 0.5) {
        this.vy += gravity * dt;
      }

      // Integrate Velocity
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.rotation += this.angularVelocity * dt;

      // Air resistance
      this.vx *= 0.985;
      this.angularVelocity *= 0.96;

      // 1. Floor Collision
      if (this.y >= floorY) {
        this.y = floorY;

        // Bounce if moving downwards fast
        if (this.vy > 180) {
          this.vy = -this.vy * 0.44; // Floor restitution
          this.angularVelocity *= 0.5;

          // Squash floor impact
          const impactSpeed = Math.abs(this.vy);
          this.scaleX = 1 + Math.min(impactSpeed / 600, 0.35);
          this.scaleY = 1 - Math.min(impactSpeed / 600, 0.35);

          sound.playBonk(0.6);
          sound.playRollRustle();
          particles.emitInkDust(this.x, floorY, 6);

          // If heavy fall, trigger dizzy
          if (impactSpeed > 750) {
            this.triggerDizzy();
          }
        } else {
          this.vy = 0;
          this.vx *= 0.88; // Floor friction
          this.angularVelocity *= 0.82;

          // Rest upright on floor
          this.rotation += (0 - this.rotation) * 8 * dt;

          if (this.state === 'HIT_AIRBORNE' && Math.abs(this.vx) < 20) {
            const homeX = window.innerWidth / 2;
            if (Math.abs(this.x - homeX) > 35) {
              this.state = 'RETURNING';
              this.chibiActor.classList.remove('flailing');
              this.setEyes('eyes-default');
              this.setMouth('mouth-cat');
            } else {
              this.state = 'IDLE';
              this.x = homeX;
              this.chibiActor.classList.remove('flailing');
              this.chibiActor.classList.add('state-idle');
              this.setEyes('eyes-default');
              this.setMouth('mouth-cat');
            }
          }
        }
      }

      // 2. Viewport Screen Left & Right Boundaries (Bounce off screen edges)
      const minX = this.radius + 15;
      const maxX = window.innerWidth - this.radius - 15;

      if (this.x < minX) {
        this.x = minX;
        this.vx = Math.abs(this.vx) * 0.65;
        this.angularVelocity = -this.angularVelocity * 0.7;
        sound.playBonk(0.7);
        particles.emitImpactBurst(minX - 10, this.y - this.radius, 0.8);
      } else if (this.x > maxX) {
        this.x = maxX;
        this.vx = -Math.abs(this.vx) * 0.65;
        this.angularVelocity = -this.angularVelocity * 0.7;
        sound.playBonk(0.7);
        particles.emitImpactBurst(maxX + 10, this.y - this.radius, 0.8);
      }

      // 3. Title Card Collision (Bounce off bottom edge if hit upwards)
      if (this.titleCard) {
        const cardRect = this.titleCard.getBoundingClientRect();
        const chibiTop = this.y - this.height * 0.85;

        // Check if chibi overlaps bottom edge of title card
        if (
          this.x >= cardRect.left - 20 &&
          this.x <= cardRect.right + 20 &&
          chibiTop <= cardRect.bottom &&
          chibiTop >= cardRect.bottom - 45 &&
          this.vy < -80
        ) {
          // Bonk against title card!
          this.vy = Math.abs(this.vy) * 0.65;
          sound.playBonk(1.4);
          particles.emitImpactBurst(this.x, cardRect.bottom, 1.2);
          particles.emitMangaSFX(this.x, cardRect.bottom - 10, '*CLACK!*', 'ごつん!');

          // Jiggle title card
          this.titleCard.classList.remove('card-bonked');
          void this.titleCard.offsetWidth; // Trigger reflow
          this.titleCard.classList.add('card-bonked');

          this.triggerDizzy();
        }
      }

      // Update Squash Spring
      this.updateSpring(dt);
    }

    updateSpring(dt) {
      const k = 320; // Spring stiffness
      const d = 16;  // Damping

      // Force towards rest scale (1.0, 1.0)
      const fx = -k * (this.scaleX - 1.0) - d * this.scaleVx;
      const fy = -k * (this.scaleY - 1.0) - d * this.scaleVy;

      this.scaleVx += fx * dt;
      this.scaleVy += fy * dt;
      this.scaleX += this.scaleVx * dt;
      this.scaleY += this.scaleVy * dt;

      // Keep scale within sane bounds
      this.scaleX = Math.max(0.5, Math.min(this.scaleX, 1.6));
      this.scaleY = Math.max(0.5, Math.min(this.scaleY, 1.6));
    }

    updateAutonomousBehavior(dt) {
      if (this.isDragging) return;

      const homeX = window.innerWidth / 2;

      // If returning to building workstation
      if (this.state === 'RETURNING') {
        const dist = homeX - this.x;
        if (Math.abs(dist) < 14) {
          // Reached home workstation!
          this.x = homeX;
          this.vx = 0;
          this.rotation = 0;
          this.state = 'IDLE';
          this.chibiActor.classList.add('state-idle');
          this.setEyes('eyes-default');
          this.setMouth('mouth-cat');
          this.say('back to work!', 1600);
        } else {
          const dir = Math.sign(dist);
          this.vx = dir * 140;
          const floorY = this.getFloorY();
          if (Math.abs(this.y - floorY) < 3) {
            this.vy = -120; // Little bouncy waddle hop
          }
          this.rotation = Math.sin(performance.now() * 0.015) * 6;
        }
        return;
      }

      if (this.state !== 'IDLE') return;

      this.idleTimer += dt;

      // Occasional cute developer or snacking comment while building
      if (this.idleTimer > 8.0) {
        this.idleTimer = 0;
        if (Math.random() < 0.45) {
          const builderQuotes = [
            'hammering out the bugs!',
            'CSS is almost aligned!',
            'chips fuel the build!',
            'cola is life~',
            'building something awesome.....',
            'compiling... probably!',
            'five more minutes of work...'
          ];
          this.say(builderQuotes[Math.floor(Math.random() * builderQuotes.length)], 2000);
        }
      }
    }

    /* -------------------------------------------------------------------------
       DOM Transform Render
       ------------------------------------------------------------------------- */

    render() {
      if (!this.chibiActor) return;

      // Transform whole actor
      const posX = this.x - this.width / 2;
      const posY = this.y - this.height;

      this.chibiActor.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0)`;

      // Transform inner squash group
      if (this.squashRoot) {
        this.squashRoot.setAttribute(
          'transform',
          `rotate(${this.rotation.toFixed(1)}, 110, 200) scale(${this.scaleX.toFixed(3)}, ${this.scaleY.toFixed(3)})`
        );
      }

      // Floor Shadow: scale inversely with altitude
      if (this.shadowEl) {
        const floorY = this.getFloorY();
        const altitude = Math.max(0, floorY - this.y);
        const shadowScale = Math.max(0.2, 1 - altitude / 350);
        const shadowAlpha = Math.max(0.05, 0.3 * (1 - altitude / 450));

        this.shadowEl.setAttribute('transform', `scale(${shadowScale.toFixed(2)}, ${shadowScale.toFixed(2)})`);
        this.shadowEl.setAttribute('transform-origin', '110 208');
        this.shadowEl.setAttribute('opacity', shadowAlpha.toFixed(2));
      }
    }
  }

  // Instantiate and run on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    window.PortfolioWall.app = new MangaChibiPlayground();
    window.PortfolioWall.app.init();
  });
})();
