/** A tiny hand-rolled particle system drawn on one canvas, in stage units (900×1200). */
export type ParticleKind =
  | 'crumb'
  | 'sparkle'
  | 'heart'
  | 'bubble'
  | 'leaf'
  | 'petal'
  | 'snow'
  | 'rain'
  | 'mote'
  | 'zmoth'
  | 'firefly'
  | 'splash'
  | 'healed'
  | 'star'
  | 'gnat'
  | 'ripple'
  | 'swirl';

export interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  vr: number;
  hue: string;
  seed: number;
  ox?: number;
  oy?: number;
}

export const W = 900;
export const H = 1200;
const MAX = 320;

const list: Particle[] = [];
let wake: (() => void) | null = null;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

const LEAF_HUES = ['#d9893b', '#c45a35', '#e3b04b', '#a8562b'];
const PETAL_HUES = ['#f6c6d0', '#fbe1e6', '#f0aebf'];

export function emit(
  kind: ParticleKind,
  x: number,
  y: number,
  n = 1,
  opts: Partial<Particle> = {},
) {
  for (let i = 0; i < n; i++) {
    if (list.length >= MAX) list.shift();
    list.push(make(kind, x, y, opts));
  }
  wake?.();
}

function make(kind: ParticleKind, x: number, y: number, o: Partial<Particle>): Particle {
  const p: Particle = {
    kind,
    x,
    y,
    vx: 0,
    vy: 0,
    life: 0,
    max: 1,
    size: 8,
    rot: rand(0, Math.PI * 2),
    vr: 0,
    hue: '#fff',
    seed: Math.random() * 1000,
  };
  switch (kind) {
    case 'crumb':
      Object.assign(p, {
        vx: rand(-160, 160),
        vy: rand(-260, -80),
        max: rand(0.7, 1.1),
        size: rand(4, 8),
        hue: '#a9773f',
      });
      break;
    case 'sparkle':
      Object.assign(p, {
        vx: rand(-90, 90),
        vy: rand(-140, -20),
        max: rand(0.6, 1.2),
        size: rand(8, 18),
        vr: rand(-3, 3),
        hue: Math.random() < 0.5 ? '#fff6d6' : '#f2c76e',
      });
      break;
    case 'healed':
      Object.assign(p, {
        vx: rand(-70, 70),
        vy: rand(-160, -60),
        max: rand(0.8, 1.3),
        size: rand(8, 16),
        vr: rand(-2, 2),
        hue: '#9ee493',
      });
      break;
    case 'heart':
      Object.assign(p, {
        vx: rand(-40, 40),
        vy: rand(-140, -80),
        max: rand(1, 1.6),
        size: rand(12, 20),
        hue: '#e8838a',
      });
      break;
    case 'bubble':
      Object.assign(p, {
        vx: rand(-30, 30),
        vy: rand(-90, -30),
        max: rand(1.2, 2.4),
        size: rand(8, 22),
        hue: '#eaf8ff',
      });
      break;
    case 'leaf':
      Object.assign(p, {
        vx: rand(-20, 40),
        vy: rand(40, 90),
        max: rand(7, 11),
        size: rand(10, 16),
        vr: rand(-1.5, 1.5),
        hue: LEAF_HUES[(Math.random() * 4) | 0],
      });
      break;
    case 'swirl':
      Object.assign(p, {
        max: rand(1.4, 2),
        size: rand(12, 20),
        vr: rand(3, 6),
        hue: LEAF_HUES.concat(['#7fa36b', '#a9c98b'])[(Math.random() * 6) | 0],
      });
      break;
    case 'petal':
      Object.assign(p, {
        vx: rand(-10, 40),
        vy: rand(30, 70),
        max: rand(8, 12),
        size: rand(7, 11),
        vr: rand(-2, 2),
        hue: PETAL_HUES[(Math.random() * 3) | 0],
      });
      break;
    case 'snow':
      Object.assign(p, {
        vx: rand(-15, 15),
        vy: rand(40, 80),
        max: rand(10, 16),
        size: rand(3, 7),
        hue: '#ffffff',
      });
      break;
    case 'rain':
      Object.assign(p, {
        vx: -60,
        vy: rand(900, 1200),
        max: 1.4,
        size: rand(16, 26),
        hue: '#cfe3f0',
      });
      break;
    case 'mote':
      Object.assign(p, {
        vx: rand(-15, 15),
        vy: rand(-40, -15),
        max: rand(2, 3.5),
        size: rand(3, 6),
        hue: '#ffe39a',
      });
      break;
    case 'zmoth':
      Object.assign(p, {
        vx: rand(10, 30),
        vy: rand(-50, -30),
        max: 3.2,
        size: rand(9, 13),
        hue: '#e8e2f5',
      });
      break;
    case 'firefly':
      Object.assign(p, {
        vx: rand(-20, 20),
        vy: rand(-15, 15),
        max: rand(5, 9),
        size: rand(3, 5),
        hue: '#e9f58a',
      });
      break;
    case 'splash':
      Object.assign(p, {
        vx: rand(-220, 220),
        vy: rand(-420, -160),
        max: rand(0.6, 1),
        size: rand(4, 9),
        hue: '#bfe3ef',
      });
      break;
    case 'star':
      Object.assign(p, {
        vx: rand(-20, 20),
        vy: rand(-40, 10),
        max: rand(1, 2),
        size: rand(5, 11),
        hue: '#cfe0ff',
      });
      break;
    case 'gnat':
      Object.assign(p, { max: rand(3, 4), size: 2.6, hue: '#2a2a22', ox: x, oy: y });
      break;
    case 'ripple':
      Object.assign(p, { max: 1.1, size: 4, hue: '#d9eef2' });
      break;
  }
  return Object.assign(p, o);
}

export function particleCount() {
  return list.length;
}

export function clearParticles() {
  list.length = 0;
}

function update(dt: number) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.life += dt;
    if (p.life >= p.max) {
      list.splice(i, 1);
      continue;
    }
    const t = p.life;
    switch (p.kind) {
      case 'crumb':
      case 'splash':
        p.vy += 900 * dt;
        break;
      case 'leaf':
      case 'petal':
        p.x += Math.sin(t * 1.6 + p.seed) * 40 * dt;
        break;
      case 'snow':
        p.x += Math.sin(t * 1.1 + p.seed) * 20 * dt;
        break;
      case 'bubble':
        p.x += Math.sin(t * 3 + p.seed) * 25 * dt;
        break;
      case 'zmoth':
        p.x += Math.sin(t * 5 + p.seed) * 50 * dt;
        break;
      case 'firefly':
        p.vx += Math.sin(t * 1.3 + p.seed) * 20 * dt;
        p.vy += Math.cos(t * 1.1 + p.seed) * 20 * dt;
        break;
      case 'gnat': {
        const a = t * 6 + p.seed;
        p.x = (p.ox ?? 0) + Math.cos(a) * 70 + Math.sin(a * 2.3) * 12;
        p.y = (p.oy ?? 0) + Math.sin(a) * 26 + Math.cos(a * 1.7) * 10;
        break;
      }
      case 'swirl': {
        const a = t * p.vr + p.seed;
        const r = 40 + t * 120;
        p.x = (p.ox ?? 0) + Math.cos(a) * r;
        p.y = (p.oy ?? 0) + Math.sin(a) * r * 0.6 - t * 60;
        break;
      }
    }
    if (p.kind !== 'gnat' && p.kind !== 'swirl') {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    p.rot += p.vr * dt;
  }
}

function star(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rr = i % 2 ? r * 0.28 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function draw(ctx: CanvasRenderingContext2D) {
  for (const p of list) {
    const k = p.life / p.max;
    const fade = k < 0.15 ? k / 0.15 : k > 0.7 ? (1 - k) / 0.3 : 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = Math.max(0, fade);
    ctx.fillStyle = p.hue;
    ctx.strokeStyle = p.hue;
    switch (p.kind) {
      case 'sparkle':
      case 'healed':
      case 'star':
        ctx.rotate(p.rot);
        ctx.shadowColor = p.hue;
        ctx.shadowBlur = 8;
        star(ctx, p.size * (0.6 + 0.4 * Math.sin(k * Math.PI)));
        break;
      case 'heart': {
        const s = p.size / 16;
        ctx.scale(s, s);
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.bezierCurveTo(-12, -4, -6, -14, 0, -6);
        ctx.bezierCurveTo(6, -14, 12, -4, 0, 5);
        ctx.fill();
        break;
      }
      case 'bubble':
        ctx.lineWidth = 2;
        ctx.globalAlpha *= 0.85;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha *= 0.5;
        ctx.beginPath();
        ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'leaf':
      case 'petal':
      case 'swirl':
        ctx.rotate(p.rot);
        ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.life * 2 + p.seed)));
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'rain':
        ctx.lineWidth = 2;
        ctx.globalAlpha *= 0.55;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-p.size * 0.06, p.size);
        ctx.stroke();
        break;
      case 'mote':
      case 'firefly': {
        const blink =
          p.kind === 'firefly' ? 0.4 + 0.6 * Math.abs(Math.sin(p.life * 2.2 + p.seed)) : 1;
        ctx.globalAlpha *= blink;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 4);
        g.addColorStop(0, p.hue);
        g.addColorStop(1, 'rgba(255,240,150,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fffbe0';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'zmoth': {
        const flap = Math.abs(Math.sin(p.life * 10 + p.seed));
        ctx.globalAlpha *= 0.9;
        ctx.beginPath();
        ctx.ellipse(
          -p.size * 0.5,
          0,
          p.size * 0.6,
          p.size * (0.3 + 0.5 * flap),
          -0.3,
          0,
          Math.PI * 2,
        );
        ctx.ellipse(
          p.size * 0.5,
          0,
          p.size * 0.6,
          p.size * (0.3 + 0.5 * flap),
          0.3,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = '#8f86a8';
        ctx.fillRect(-1, -p.size * 0.4, 2, p.size * 0.8);
        break;
      }
      case 'ripple':
        ctx.lineWidth = 2;
        ctx.globalAlpha *= 0.7;
        ctx.beginPath();
        ctx.ellipse(0, 0, 4 + k * 40, 1.5 + k * 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      default:
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }
}

export type Ambient = (dt: number) => void;

/** Run the canvas loop. Returns a stop function. */
export function runParticles(canvas: HTMLCanvasElement, ambient: () => Ambient | null): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  let raf = 0;
  let last = performance.now();
  let running = false;
  const frame = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    ambient()?.(dt);
    update(dt);
    const dpr = canvas.width / W;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    draw(ctx);
    if (list.length || ambient()) raf = requestAnimationFrame(frame);
    else running = false;
  };
  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  wake = start;
  start();
  return () => {
    cancelAnimationFrame(raf);
    running = false;
    if (wake === start) wake = null;
  };
}

export function kickParticles() {
  wake?.();
}
