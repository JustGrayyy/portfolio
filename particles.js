/**
 * ============================================================================
 * 60fps Manga Ink FX & Comic Onomatopoeia Canvas Engine
 * Hand-drawn impact bursts, action speedlines, floating SFX, and ink dust
 * ============================================================================
 */

(function () {
  'use strict';

  window.PortfolioWall = window.PortfolioWall || {};

  class MangaFXEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.dpr = 1;

      // Active particle pools
      this.bursts = [];
      this.sfxList = [];
      this.dustPuffs = [];
      this.actionLines = [];

      this.lastTime = performance.now();
      this.loop = this.loop.bind(this);
    }

    init(canvasEl) {
      this.canvas = canvasEl;
      this.ctx = this.canvas.getContext('2d');
      this.resize();

      window.addEventListener('resize', () => this.resize());
      requestAnimationFrame(this.loop);
    }

    resize() {
      if (!this.canvas) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.canvas.width = Math.floor(width * this.dpr);
      this.canvas.height = Math.floor(height * this.dpr);
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
    }

    /* -------------------------------------------------------------------------
       Emitters
       ------------------------------------------------------------------------- */

    /**
     * Manga Impact Starburst & Radiating Action Spikes
     */
    emitImpactBurst(x, y, intensity = 1.0) {
      const spikeCount = Math.floor(8 + intensity * 6);
      const spikes = [];
      const baseRadius = 14 * intensity;

      for (let i = 0; i < spikeCount; i++) {
        const angle = (Math.PI * 2 * i) / spikeCount + (Math.random() - 0.5) * 0.35;
        const length = (24 + Math.random() * 32) * intensity;
        spikes.push({
          angle,
          length,
          width: 2.2 + Math.random() * 2.5
        });
      }

      this.bursts.push({
        x,
        y,
        spikes,
        radius: baseRadius,
        maxRadius: (45 + intensity * 25),
        life: 1.0,
        decay: 3.8
      });
    }

    /**
     * Floating Comic Onomatopoeia (Hand-drawn text: *BONK!*, *POKE*, *BOING*, etc.)
     */
    emitMangaSFX(x, y, text, subtext = '') {
      const angle = (Math.random() - 0.5) * 0.38; // Slight comic tilt
      this.sfxList.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 10,
        text,
        subtext,
        angle,
        scale: 0.2,
        targetScale: 1.0 + Math.random() * 0.25,
        vy: -75 - Math.random() * 40,
        life: 1.0,
        decay: 1.45
      });
    }

    /**
     * Manga Scalloped Ink Dust Clouds
     */
    emitInkDust(x, y, count = 6) {
      for (let i = 0; i < count; i++) {
        const angle = Math.PI + (Math.random() - 0.5) * 1.8;
        const speed = 40 + Math.random() * 80;
        this.dustPuffs.push({
          x: x + (Math.random() - 0.5) * 16,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.5 - 20,
          radius: 8 + Math.random() * 10,
          growth: 18 + Math.random() * 12,
          life: 1.0,
          decay: 2.0
        });
      }
    }

    /**
     * High-speed directional action speed lines
     */
    emitSpeedLine(x, y, dx, dy) {
      const len = Math.hypot(dx, dy);
      if (len < 10) return;
      const nx = dx / len;
      const ny = dy / len;

      this.actionLines.push({
        x1: x,
        y1: y,
        x2: x - nx * (40 + Math.random() * 50),
        y2: y - ny * (40 + Math.random() * 50),
        width: 2.5 + Math.random() * 2,
        life: 1.0,
        decay: 4.5
      });
    }

    /**
     * Carbonated Soda Bubbles
     */
    emitSodaBubbles(x, y, count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const speed = 40 + Math.random() * 80;
        this.dustPuffs.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed * 0.4,
          vy: -50 - Math.random() * 90,
          radius: 2 + Math.random() * 2.5,
          growth: 0.3,
          life: 1.0,
          decay: 1.4
        });
      }
    }

    /* -------------------------------------------------------------------------
       60fps Physics & Render Loop
       ------------------------------------------------------------------------- */

    loop(now) {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      if (this.ctx && this.canvas) {
        this.ctx.save();
        this.ctx.scale(this.dpr, this.dpr);
        this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

        // 1. Draw Directional Action Lines
        for (let i = this.actionLines.length - 1; i >= 0; i--) {
          const line = this.actionLines[i];
          line.life -= line.decay * dt;
          if (line.life <= 0) {
            this.actionLines.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.strokeStyle = '#141413';
          this.ctx.lineWidth = line.width * line.life;
          this.ctx.lineCap = 'round';
          this.ctx.globalAlpha = Math.max(0, line.life);

          this.ctx.beginPath();
          this.ctx.moveTo(line.x1, line.y1);
          this.ctx.lineTo(line.x2, line.y2);
          this.ctx.stroke();
          this.ctx.restore();
        }

        // 2. Draw Impact Bursts
        for (let i = this.bursts.length - 1; i >= 0; i--) {
          const b = this.bursts[i];
          b.life -= b.decay * dt;
          if (b.life <= 0) {
            this.bursts.splice(i, 1);
            continue;
          }

          const progress = 1 - b.life;
          const currentRadius = b.radius + (b.maxRadius - b.radius) * progress;

          this.ctx.save();
          this.ctx.strokeStyle = '#141413';
          this.ctx.fillStyle = '#faf8f5';
          this.ctx.lineWidth = 2.4;
          this.ctx.lineCap = 'round';
          this.ctx.globalAlpha = Math.max(0, b.life);

          // Draw Radiating Spikes
          b.spikes.forEach(sp => {
            const cos = Math.cos(sp.angle);
            const sin = Math.sin(sp.angle);
            const r1 = currentRadius * 0.4;
            const r2 = currentRadius + sp.length * (1 - progress * 0.3);

            this.ctx.lineWidth = sp.width * b.life;
            this.ctx.beginPath();
            this.ctx.moveTo(b.x + cos * r1, b.y + sin * r1);
            this.ctx.lineTo(b.x + cos * r2, b.y + sin * r2);
            this.ctx.stroke();
          });

          // Expanding Shockwave Ring
          this.ctx.lineWidth = 2.8 * b.life;
          this.ctx.beginPath();
          this.ctx.arc(b.x, b.y, currentRadius * 0.65, 0, Math.PI * 2);
          this.ctx.stroke();

          this.ctx.restore();
        }

        // 3. Draw Scalloped Ink Dust Clouds
        for (let i = this.dustPuffs.length - 1; i >= 0; i--) {
          const d = this.dustPuffs[i];
          d.life -= d.decay * dt;
          if (d.life <= 0) {
            this.dustPuffs.splice(i, 1);
            continue;
          }

          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.radius += d.growth * dt;
          d.vx *= 0.94;
          d.vy *= 0.94;

          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, d.life * 0.85);
          this.ctx.fillStyle = '#f4efe6';
          this.ctx.strokeStyle = '#141413';
          this.ctx.lineWidth = 2;

          this.ctx.beginPath();
          this.ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();

          // Subtle internal arc mark
          this.ctx.beginPath();
          this.ctx.arc(d.x - d.radius * 0.25, d.y - d.radius * 0.2, d.radius * 0.45, 0.4, Math.PI * 1.2);
          this.ctx.stroke();

          this.ctx.restore();
        }

        // 4. Draw Floating Comic Onomatopoeia (SFX)
        for (let i = this.sfxList.length - 1; i >= 0; i--) {
          const sfx = this.sfxList[i];
          sfx.life -= sfx.decay * dt;
          if (sfx.life <= 0) {
            this.sfxList.splice(i, 1);
            continue;
          }

          sfx.y += sfx.vy * dt;
          sfx.vy *= 0.96; // Ease deceleration

          // Elastic scale pop
          if (sfx.scale < sfx.targetScale) {
            sfx.scale += (sfx.targetScale - sfx.scale) * 14 * dt;
          }

          this.ctx.save();
          this.ctx.translate(sfx.x, sfx.y);
          this.ctx.rotate(sfx.angle);
          this.ctx.scale(sfx.scale, sfx.scale);
          this.ctx.globalAlpha = Math.max(0, sfx.life);

          // Authentic Manga Comic Text Rendering
          this.ctx.font = 'bold 26px "Patrick Hand", "Fredoka", cursive, sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';

          // Thick white paper knockout stroke
          this.ctx.strokeStyle = '#faf8f5';
          this.ctx.lineWidth = 7;
          this.ctx.lineJoin = 'miter';
          this.ctx.strokeText(sfx.text, 0, 0);

          // Black Ink Shadow Offset
          this.ctx.fillStyle = '#141413';
          this.ctx.fillText(sfx.text, 2, 2);

          // Primary Solid Ink
          this.ctx.fillText(sfx.text, 0, 0);

          // Subtext (e.g. Japanese Katakana: ドカッ / ぽよん)
          if (sfx.subtext) {
            this.ctx.font = 'bold 15px "Patrick Hand", sans-serif';
            this.ctx.fillText(sfx.subtext, 0, 22);
          }

          this.ctx.restore();
        }

        this.ctx.restore();
      }

      requestAnimationFrame(this.loop);
    }
  }

  window.PortfolioWall.particles = new MangaFXEngine();
})();
