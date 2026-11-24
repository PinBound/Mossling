import { useEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { TUNING, type PetSpot } from '../sim';
import { useGame, type PetAnimKind } from '../game/store';
import { bus, haptic } from '../game/bus';
import { useReducedMotion } from '../game/prefs';
import { FORM_META, petImage, petPose, type Pose } from '../assets/manifest';
import { emit } from '../scene/particles';
import { BURROW_X, GROUND_Y, POND, STOOL } from '../scene/Hollow';
import { toStage, useStage } from '../scene/StageContext';
import { PlaceholderPet, anchors } from './PlaceholderPet';
import { chooseBehavior, moodOf, type BehaviorKind } from './behavior';
import { copy, formName } from '../ui/copy';
import styles from './pet.module.css';

const BASE = 520; // art box size in stage units at scale 1
const FEET = 900 / 1024;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

type Prop = 'spoon' | 'candy' | 'vial' | 'leafbook' | null;

export function PetActor({ raining }: { raining: boolean }) {
  const pet = useGame((s) => s.pet);
  const petAnim = useGame((s) => s.petAnim);
  const hover = useGame((s) => s.hoverAction);
  const dispatch = useGame((s) => s.dispatch);
  const { unit, pointer, el } = useStage();
  const reduced = useReducedMotion();

  const meta = FORM_META[pet.form];
  const size = BASE * meta.scale;
  const hoverLift = meta.hover ? 70 : 0;

  // Motion values, in stage units.
  const x = useMotionValue(450);
  const hop = useMotionValue(0);
  const sx = useMotionValue(1);
  const sy = useMotionValue(1);
  const rot = useMotionValue(0);
  const zoom = useMotionValue(1);
  const breathe = useMotionValue(1);
  const float = useMotionValue(0);
  const sway = useMotionValue(0);
  const lean = useSpring(0, { stiffness: 140, damping: 12 });
  const sprout = useTransform<number, number>([sway, lean], ([a, b]) => a + b);
  const lookX = useSpring(0, { stiffness: 120, damping: 16 });
  const lookY = useSpring(0, { stiffness: 120, damping: 16 });

  const [pose, setPose] = useState<Pose | null>(null);
  const [blink, setBlink] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [blush, setBlush] = useState(false);
  const [glow, setGlow] = useState(false);
  const [prop, setProp] = useState<Prop>(null);
  const [wish, setWish] = useState<string | null>(null);
  const [glass, setGlass] = useState(false);
  const [focused, setFocused] = useState(() =>
    typeof document !== 'undefined' ? document.hasFocus() : true,
  );
  const [butterfly, setButterfly] = useState(false);
  const [extraDroop, setExtraDroop] = useState(0);

  const rainingRef = useRef(raining);
  rainingRef.current = raining;
  const behaviorToken = useRef(0);
  const busy = useRef(false);
  const mounted = useRef(true);

  const overweight = pet.stage !== 'egg' && pet.stats.weight > TUNING.overweight[pet.stage];
  const mood = moodOf(pet, pet.stage === 'egg' ? Infinity : TUNING.overweight[pet.stage]);
  const asleep = !!pet.sleep;
  const slow = mood.unhappy ? 1.6 : 1;

  // Screen-space helpers for particles.
  const geo = () => {
    const h = size * zoom.get();
    const top = GROUND_Y - hoverLift - FEET * h + hop.get() + float.get();
    const a = anchors(pet.form);
    return {
      x: x.get(),
      top,
      h,
      head: { x: x.get() + (a.head.x - 0.5) * h, y: top + a.head.y * h },
      mouth: { x: x.get() + (a.mouth.x - 0.5) * h * facing, y: top + a.mouth.y * h },
      sprout: { x: x.get() + (a.sprout.x - 0.5) * h, y: top + a.sprout.y * h },
      feet: { x: x.get(), y: GROUND_Y - hoverLift },
    };
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Focus brightens the egg.
  useEffect(() => {
    const f = () => setFocused(true);
    const b = () => setFocused(false);
    window.addEventListener('focus', f);
    window.addEventListener('blur', b);
    return () => {
      window.removeEventListener('focus', f);
      window.removeEventListener('blur', b);
    };
  }, []);

  // Breathing (1.00 → 1.02 over 3 s) and hover float.
  useEffect(() => {
    if (reduced) return;
    const a = animate(breathe, [1, 1.02, 1], {
      duration: asleep ? 4.5 : 3,
      repeat: Infinity,
      ease: 'easeInOut',
    });
    const f = meta.hover
      ? animate(float, [0, -16, 0], { duration: 3.4, repeat: Infinity, ease: 'easeInOut' })
      : null;
    return () => {
      a.stop();
      f?.stop();
    };
  }, [reduced, asleep, meta.hover, breathe, float]);

  // Independent sprout sway (secondary motion).
  useEffect(() => {
    if (reduced) return;
    const amp = asleep ? 4 : pet.call ? 14 : 7;
    const a = animate(sway, [-amp, amp], {
      duration: asleep ? 3.6 : pet.call ? 0.45 : 1.7,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    });
    return () => a.stop();
  }, [reduced, asleep, pet.call, sway]);

  // Blinking on randomized 2–6 s intervals.
  useEffect(() => {
    let t: number;
    const loop = () => {
      t = window.setTimeout(
        () => {
          setBlink(true);
          window.setTimeout(() => setBlink(false), 120);
          loop();
        },
        rand(2000, 6000),
      );
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  // Eyes track the pointer loosely; peek at its last spot when it goes idle.
  useEffect(() => {
    let raf = 0;
    let peeked = false;
    const f = () => {
      const p = pointer.current;
      const g = geo();
      const dx = (p.x - g.head.x) * facing;
      const dy = p.y - g.head.y;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300);
      if (!asleep) {
        lookX.set((dx / d) * 14 * k);
        lookY.set((dy / d) * 12 * k);
      }
      const idle = performance.now() - p.lastMove > 8000;
      if (idle && !peeked && !busy.current && !asleep && pet.stage !== 'egg' && p.lastMove > 0) {
        peeked = true;
        rot.set(0);
        void animate(rot, [0, Math.sign(dx || 1) * 9, Math.sign(dx || 1) * 9, 0], {
          duration: 1.8,
          times: [0, 0.2, 0.8, 1],
        });
      }
      if (!idle) peeked = false;
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing, asleep, pet.stage, size]);

  // Sprout leans toward the hovered action button (eagerly toward Feed when hungry).
  useEffect(() => {
    if (!hover || asleep || pet.stage === 'egg') {
      lean.set(0);
      return;
    }
    const r = el.current?.getBoundingClientRect();
    if (!r) return;
    const s = toStage(el.current, hover.x, hover.y);
    const g = geo();
    const angle = (Math.atan2(s.x - g.sprout.x, -(s.y - g.sprout.y)) * 180) / Math.PI;
    const eager = hover.id === 'feed' && mood.hungry;
    lean.set(Math.max(-40, Math.min(40, angle * (eager ? 0.6 : 0.3))));
    if (eager && !busy.current) {
      setPose('happy');
      void animate(hop, [0, -24, 0], { duration: 0.35 });
    }
    return () => {
      if (eager) setPose(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover, asleep]);

  // Ambient condition particles: Z-moths, gnats, motes, stars, the egg heartbeat.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const g = geo();
      const p = useGame.getState().pet;
      if (p.stage === 'egg') {
        const k = p.eggMs / TUNING.stageDuration.egg;
        if (k > 0.9) {
          haptic([40, 120, 40]);
          bus.fx('heartbeat');
        }
        return;
      }
      if (p.sleep) emit('zmoth', g.head.x + 40, g.head.y - 40, 1);
      if (mood.veryDirty) emit('gnat', g.head.x, g.head.y - 20, 3);
      if (!p.sleep && (mood.happy || p.form === 'lanternmoss') && !reduced) {
        emit(
          p.form === 'starwick' ? 'star' : 'mote',
          g.x + rand(-g.h * 0.3, g.h * 0.3),
          g.top + g.h * rand(0.3, 0.8),
          1,
        );
      }
    }, 2400);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood.veryDirty, mood.happy, reduced, size]);

  // Cancel the current idle behavior when the pet's situation changes.
  useEffect(() => {
    behaviorToken.current++;
  }, [asleep, pet.call?.reason, pet.sick, pet.stage, pet.status]);

  const walkTo = async (tx: number, token: number) => {
    const dist = Math.abs(tx - x.get());
    if (dist < 4) return;
    setFacing(tx > x.get() ? 1 : -1);
    const dur = (dist / (pet.stage === 'baby' ? 200 : 170)) * slow;
    const hops = reduced
      ? null
      : animate(hop, [0, pet.stage === 'baby' ? -34 : -12, 0], {
          duration: pet.stage === 'baby' ? 0.38 : 0.3,
          repeat: Infinity,
        });
    const sq = reduced
      ? null
      : animate(sy, [1, 0.94, 1.03, 1], {
          duration: pet.stage === 'baby' ? 0.38 : 0.3,
          repeat: Infinity,
        });
    await animate(x, tx, { duration: dur, ease: 'easeInOut' });
    hops?.stop();
    sq?.stop();
    if (behaviorToken.current === token) {
      void animate(hop, 0, { duration: 0.15 });
      void animate(sy, 1, { type: 'spring', stiffness: 400, damping: 12 });
    }
  };

  const perform = async (kind: BehaviorKind, token: number) => {
    const ok = () => mounted.current && behaviorToken.current === token;
    const spring = { type: 'spring' as const, stiffness: 300, damping: 14 };
    switch (kind) {
      case 'wander': {
        let tx = rand(220, 700);
        if (Math.abs(tx - x.get()) < 80) tx = x.get() > 450 ? tx - 160 : tx + 160;
        await walkTo(tx, token);
        break;
      }
      case 'look':
        setPose(null);
        await wait(rand(1500, 3200));
        break;
      case 'butterfly':
        setButterfly(true);
        setPose('play');
        for (let i = 0; i < 3 && ok(); i++) {
          await walkTo(rand(260, 660), token);
          if (!ok()) break;
          await animate(hop, [0, -50, 0], { duration: 0.45 });
        }
        setButterfly(false);
        break;
      case 'sniff':
        await walkTo(STOOL.x + 120, token);
        if (!ok()) break;
        setFacing(-1);
        setPose('surprised');
        await animate(rot, [0, -8, -4, -8, 0], { duration: 1.4 });
        if (ok()) setPose('happy');
        await wait(800);
        break;
      case 'yawn':
        setPose('sleep');
        await animate(sy, [1, 1.1, 1.1, 1], { duration: 1.4, times: [0, 0.3, 0.7, 1] });
        break;
      case 'sneeze':
        setPose('surprised');
        await animate(rot, -6 * facing, { duration: 0.5 });
        if (!ok()) break;
        setPose('refuse');
        bus.fx('pop');
        {
          const g = geo();
          emit('sparkle', g.mouth.x + 30 * facing, g.mouth.y, 6, { hue: '#f6e27a' });
        }
        await animate(rot, [8 * facing, 0], { duration: 0.4 });
        await animate(sx, [1.1, 1], spring);
        break;
      case 'pond':
        await walkTo(POND.cx - POND.rx - 40, token);
        if (!ok()) break;
        setFacing(1);
        lookY.set(10);
        await wait(2200);
        if (ok() && Math.random() < 0.4) {
          setPose('surprised');
          await wait(600);
        }
        break;
      case 'fall':
        await animate(hop, [0, -30, 0], { duration: 0.35 });
        if (!ok()) break;
        setPose('surprised');
        await animate(rot, 72 * facing, { type: 'spring', stiffness: 180, damping: 9 });
        await wait(900);
        await animate(rot, 0, spring);
        if (ok()) setPose('happy');
        await wait(600);
        break;
      case 'stretch':
        await animate(sy, 1.16, { duration: 0.6 });
        await animate(sx, 0.92, { duration: 0.1 });
        await wait(400);
        void animate(sx, 1, spring);
        await animate(sy, 1, spring);
        break;
      case 'spin':
        setPose('happy');
        await animate(rot, 360, { duration: 0.8, ease: 'easeInOut' });
        rot.set(0);
        break;
      case 'dance':
        setPose('play');
        for (let i = 0; i < 4 && ok(); i++) {
          setFacing(i % 2 ? -1 : 1);
          void animate(rot, i % 2 ? -10 : 10, { duration: 0.2 });
          await animate(hop, [0, -40, 0], { duration: 0.34 });
        }
        rot.set(0);
        break;
      case 'sulk':
        await walkTo(x.get() > 450 ? 760 : 200, token);
        if (!ok()) break;
        setFacing(x.get() > 450 ? 1 : -1);
        setPose('sad');
        await animate(sy, 0.94, { duration: 0.5 });
        await wait(3500);
        void animate(sy, 1, spring);
        break;
      case 'hungryStare':
        await walkTo(STOOL.x + 130, token);
        if (!ok()) break;
        setFacing(-1);
        setPose('sad');
        lookY.set(8);
        await animate(sx, [1, 1.05, 0.97, 1.03, 1], { duration: 0.6 }); // tummy rumble
        await wait(2200);
        break;
      case 'splash':
        setPose('play');
        for (let i = 0; i < 3 && ok(); i++) {
          await animate(hop, [0, -36, 0], { duration: 0.4 });
          const g = geo();
          emit('splash', g.feet.x, g.feet.y, 8);
          bus.fx('splash');
        }
        break;
      case 'rest':
        setPose(mood.sick ? 'sick' : null);
        if (mood.sick && !reduced)
          void animate(x, [x.get(), x.get() - 3, x.get() + 3, x.get()], {
            duration: 0.3,
            repeat: 3,
          });
        await wait(rand(2500, 4000));
        break;
      case 'rare':
        if (pet.form === 'lanternmoss') {
          setProp('leafbook');
          setPose('idle');
          lookY.set(12);
          await wait(4000);
          setProp(null);
        } else if (pet.form === 'burrowbun') {
          for (let i = 0; i < 4 && ok(); i++) {
            const g = geo();
            emit('crumb', g.feet.x + 30 * facing, g.feet.y, 6, { hue: '#7a5a3a' });
            await animate(rot, [0, 8 * facing, 0], { duration: 0.3 });
          }
          if (!ok()) break;
          setPose('sleep');
          await animate(hop, 18, { duration: 0.4 });
          await wait(3500);
          await animate(hop, 0, spring);
        } else if (pet.form === 'mirefuzz') {
          await walkTo(POND.cx - POND.rx - 30, token);
          if (!ok()) break;
          setFacing(1);
          setPose('eat_closed');
          await wait(600);
          const g = geo();
          emit('bubble', g.mouth.x + 40, g.mouth.y, 1, { size: 46, max: 2.6, vy: -40 });
          bus.fx('pop');
          setPose(null);
          await wait(1500);
        } else {
          const g = geo();
          emit('star', g.sprout.x, g.sprout.y, 14);
          setPose('happy');
          await wait(1600);
        }
        break;
    }
  };

  // The idle loop: always running, cooperatively cancelled by behaviorToken.
  useEffect(() => {
    let alive = true;
    (async () => {
      await wait(400);
      while (alive) {
        const st = useGame.getState();
        const p = st.pet;
        if (busy.current || st.game || p.status !== 'alive') {
          await wait(300);
          continue;
        }
        const token = ++behaviorToken.current;
        if (p.stage === 'egg') {
          setPose(null);
          await wait(1000);
          continue;
        }
        if (p.sleep) {
          if (Math.abs(x.get() - (BURROW_X + 20)) > 10) {
            setPose('sleep');
            await walkTo(BURROW_X + 20, token);
          }
          setPose('sleep');
          lookX.set(0);
          lookY.set(0);
          void animate(sy, 0.9, { duration: 0.8 });
          while (
            alive &&
            useGame.getState().pet.sleep &&
            behaviorToken.current === token &&
            !busy.current
          )
            await wait(500);
          void animate(sy, 1, { type: 'spring', stiffness: 300, damping: 10 });
          setPose(null);
          continue;
        }
        if (p.call) {
          setPose('call');
          if (!reduced) await animate(hop, [0, -30, 0, -30, 0], { duration: 0.9 });
          await wait(1400);
          setPose(null);
          await wait(700);
          continue;
        }
        const raining = rainingRef.current;
        const m = moodOf(p, TUNING.overweight[p.stage as 'child']);
        const kind = chooseBehavior(p, m, Math.random, raining);
        await perform(kind, token);
        if (behaviorToken.current === token) setPose(null);
        lookY.set(0);
        await wait(rand(700, 2400) * slow);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-shot reactions to player actions.
  useEffect(() => {
    if (!petAnim) return;
    const kind = petAnim.kind;
    busy.current = true;
    behaviorToken.current++;
    [x, hop, sx, sy, rot].forEach((m) => m.stop());
    let cancelled = false;
    void react(kind).finally(() => {
      if (cancelled) return;
      busy.current = false;
      setPose(null);
      setProp(null);
      setBlush(false);
      setGlow(false);
      setExtraDroop(0);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petAnim?.id]);

  const react = async (kind: PetAnimKind) => {
    const spring = { type: 'spring' as const, stiffness: 320, damping: 12 };
    const g = geo();
    hop.set(0);
    rot.set(0);
    switch (kind) {
      case 'eat':
        setProp('spoon');
        await wait(550);
        for (let i = 0; i < 3; i++) {
          setPose('eat_open');
          await animate(sy, 1.06, { duration: 0.14 });
          setPose('eat_closed');
          bus.fx('tap');
          emit('crumb', g.mouth.x, g.mouth.y, 4);
          await animate(sy, [0.9, 1], spring);
          if (i === 0) setProp(null);
        }
        setPose('happy');
        await wait(500);
        break;
      case 'snack':
        setProp('candy');
        await wait(500);
        setProp(null);
        setPose('play');
        emit('sparkle', g.head.x, g.head.y, 10);
        await animate(hop, [0, -50, 0], { duration: 0.45 });
        await wait(500);
        break;
      case 'refuse':
        setPose('refuse');
        lean.set(-30);
        await animate(rot, [0, -9, 9, -9, 9, 0], { duration: 0.8 });
        lean.set(0);
        await wait(300);
        break;
      case 'medicine':
      case 'cured':
        setProp('vial');
        await wait(600);
        setProp(null);
        setPose('refuse');
        if (!reduced)
          await animate(x, [x.get(), x.get() - 6, x.get() + 6, x.get() - 4, x.get() + 4, x.get()], {
            duration: 0.6,
          });
        if (kind === 'cured') {
          emit('healed', g.head.x, g.head.y, 16);
          setPose('happy');
          await animate(hop, [0, -30, 0], { duration: 0.4 });
        }
        await wait(500);
        break;
      case 'stomachache':
        setPose('sick');
        if (!reduced) await animate(sx, [1, 1.06, 0.96, 1.04, 1], { duration: 0.8 });
        await wait(800);
        break;
      case 'scold':
        setPose('sad');
        setExtraDroop(1);
        lookY.set(12);
        await animate(sy, 0.92, { duration: 0.4 });
        await wait(1300);
        await animate(sy, 1, spring);
        break;
      case 'confused':
        setPose('surprised');
        await animate(rot, 12 * facing, spring);
        await wait(900);
        await animate(rot, 0, spring);
        break;
      case 'praise':
        setPose('happy');
        setGlow(true);
        setBlush(true);
        lean.set(0);
        emit('sparkle', g.sprout.x, g.sprout.y, 12);
        await animate(sy, [1, 1.08, 1], { duration: 0.5 });
        await animate(hop, [0, -36, 0], { duration: 0.4 });
        await wait(700);
        break;
      case 'pet-sprout':
        setPose('happy');
        setBlush(true);
        bus.fx('giggle');
        emit('heart', g.sprout.x, g.sprout.y, 2);
        await animate(rot, [0, -6, 6, -6, 6, 0], { duration: 0.7 });
        break;
      case 'pet-belly':
        setPose('play');
        setBlush(true);
        bus.fx('squirm');
        emit('heart', g.head.x, g.head.y, 2);
        await animate(sx, [1, 1.1, 0.94, 1.06, 1], { duration: 0.7 });
        break;
      case 'pet-ears':
        setPose('surprised');
        bus.fx('flick');
        await animate(rot, [0, 10, -4, 0], { duration: 0.4 });
        setPose('happy');
        setBlush(true);
        await wait(400);
        break;
      case 'pet-head':
        setPose('happy');
        setBlush(true);
        bus.fx('purr');
        emit('heart', g.head.x, g.head.y - 40, 3);
        await animate(rot, 6 * facing, spring);
        await wait(700);
        await animate(rot, 0, spring);
        break;
      case 'won':
        setPose('play');
        for (let i = 0; i < 3; i++) await animate(hop, [0, -50, 0], { duration: 0.4 });
        break;
      case 'lost':
        setPose('sad');
        await wait(1200);
        break;
      case 'greet': {
        bus.fx('greet');
        setPose('happy');
        await walkTo(450, behaviorToken.current);
        if (reduced) {
          await wait(1200);
          break;
        }
        await animate(zoom, 1.9, { duration: 0.7, ease: [0.3, 0.9, 0.4, 1] });
        setGlass(true);
        haptic([20, 40, 20]);
        await animate(sx, 1.16, { duration: 0.12 });
        await animate(sy, 0.9, { duration: 0.12 });
        emit('heart', 450, 520, 6);
        await wait(1500);
        setGlass(false);
        void animate(sx, 1, spring);
        void animate(sy, 1, spring);
        await animate(zoom, 1, { type: 'spring', stiffness: 120, damping: 16 });
        break;
      }
      case 'wish': {
        const w = copy.wishes[Math.floor(Math.random() * copy.wishes.length)];
        useGame.getState().addCollectible('wish', w);
        bus.fx('wish');
        setPose('surprised');
        lookY.set(-14);
        await wait(700);
        setPose('happy');
        setWish(w);
        await wait(3600);
        setWish(null);
        break;
      }
    }
  };

  // Petting: tap or drag on the pet. Spot depends on where you touch.
  const drag = useRef<{ dist: number; lx: number; ly: number } | null>(null);
  const spotAt = (clientX: number, clientY: number, target: HTMLElement): PetSpot => {
    const r = target.getBoundingClientRect();
    const fx = (clientX - r.left) / r.width;
    const fy = (clientY - r.top) / r.height;
    const a = anchors(pet.form);
    if (fy < a.sprout.y + 0.06) return 'sprout';
    if (fy < a.head.y + 0.02 && Math.abs(fx - 0.5) > 0.2) return 'ears';
    if (fy > a.mouth.y + 0.08) return 'belly';
    return 'head';
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pet.status !== 'alive') return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { dist: 0, lx: e.clientX, ly: e.clientY };
    if (pet.stage === 'egg') {
      bus.fx('wobble');
      haptic(12);
      void animate(rot, [0, -10, 9, -6, 4, 0], { duration: 0.7 });
      dispatch({ type: 'pet', spot: 'body' });
      if (useGame.getState().meta.flags.nudge === 'egg')
        useGame.getState().setFlags({ nudge: 'feed' });
      return;
    }
    if (asleep) return;
    dispatch({ type: 'pet', spot: spotAt(e.clientX, e.clientY, e.currentTarget) });
    if (useGame.getState().meta.flags.nudge === 'pet')
      useGame.getState().setFlags({ nudge: 'done' });
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || pet.stage === 'egg' || asleep) return;
    d.dist += Math.hypot(e.clientX - d.lx, e.clientY - d.ly);
    d.lx = e.clientX;
    d.ly = e.clientY;
    const rr = e.currentTarget.getBoundingClientRect();
    lean.set(((e.clientX - rr.left) / rr.width - 0.5) * 30);
    if (d.dist > rr.width * 0.9) {
      d.dist = 0;
      dispatch({ type: 'pet', spot: spotAt(e.clientX, e.clientY, e.currentTarget) });
    }
  };
  const onUp = () => {
    drag.current = null;
    lean.set(0);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (pet.stage === 'egg') {
        bus.fx('wobble');
        void animate(rot, [0, -10, 9, -6, 4, 0], { duration: 0.7 });
        if (useGame.getState().meta.flags.nudge === 'egg')
          useGame.getState().setFlags({ nudge: 'feed' });
      }
      dispatch({ type: 'pet', spot: pet.stage === 'egg' ? 'body' : 'head' });
    }
  };

  // Derived pose when nothing in particular is happening.
  const basePose: Pose = asleep
    ? 'sleep'
    : pet.sick
      ? 'sick'
      : pet.call
        ? 'call'
        : mood.unhappy
          ? 'sad'
          : mood.ecstatic
            ? 'happy'
            : 'idle';
  const shownPose: Pose = pose ?? basePose;
  const droop = Math.min(
    1,
    Math.max(
      extraDroop,
      asleep ? 0.3 : pet.sick ? 0.85 : mood.unhappy ? 0.65 : mood.hungry ? 0.35 : 0,
    ),
  );

  const filter = useMemo(() => {
    const f: string[] = [];
    if (pet.sick) f.push('sepia(0.35) hue-rotate(35deg) saturate(0.7) brightness(0.95)');
    else if (mood.unhappy) f.push('saturate(0.55)');
    if (glow) f.push('drop-shadow(0 0 22px rgba(255,226,140,0.95))');
    else if (mood.happy && !asleep) f.push('drop-shadow(0 0 12px rgba(255,236,170,0.55))');
    if (pet.form === 'starwick') f.push('drop-shadow(0 0 14px rgba(140,180,255,0.6))');
    if (pet.stage === 'egg')
      f.push(`drop-shadow(0 0 ${focused ? 26 : 10}px rgba(220,255,190,${focused ? 0.8 : 0.4}))`);
    return f.join(' ') || 'none';
  }, [pet.sick, mood.unhappy, mood.happy, glow, asleep, pet.form, pet.stage, focused]);

  const eggK = pet.stage === 'egg' ? pet.eggMs / TUNING.stageDuration.egg : 0;
  const crack = eggK > 0.93 ? 3 : eggK > 0.8 ? 2 : eggK > 0.6 ? 1 : 0;
  const img =
    pet.stage === 'egg'
      ? null
      : petPose(pet.form, blink && !['sleep', 'happy'].includes(shownPose) ? 'blink' : shownPose);
  const eggImg = pet.stage === 'egg' ? petPoseEgg(crack) : null;

  // px conversions
  const left = useTransform(x, (v) => (v - size / 2) * unit);
  const shadowScale = useTransform(hop, (v) => 1 + v / 200);
  const bodyY = useTransform<number, number>(
    [hop, float, zoom],
    ([h, f, z]) => (h + f + (z - 1) * 140) * unit,
  );
  const bodySX = useTransform<number, number>(
    [sx, breathe, zoom],
    ([a, b, z]) => a * (2 - b) * z * (overweight ? 1.08 : 1),
  );
  const bodySY = useTransform<number, number>([sy, breathe, zoom], ([a, b, z]) => a * b * z);

  if (pet.status !== 'alive' && !useGame.getState().cinematic) return null;

  const px = size * unit;
  const top = (GROUND_Y - hoverLift - FEET * size) * unit;
  const name = pet.name || formName(pet.form);
  const dirt = Math.max(0, Math.min(1, (45 - pet.stats.hygiene) / 35));

  return (
    <>
      <motion.div
        className={styles.shadow}
        style={{
          left,
          top: (GROUND_Y - 22) * unit,
          width: px,
          height: 44 * unit,
          scale: shadowScale,
          opacity: meta.hover ? 0.5 : 0.85,
        }}
        aria-hidden="true"
      />
      <motion.div
        className={styles.pet}
        style={{
          left,
          top,
          width: px,
          height: px,
          y: bodyY,
          scaleX: bodySX,
          scaleY: bodySY,
          rotate: rot,
          originX: 0.5,
          originY: FEET,
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        role="button"
        tabIndex={0}
        aria-label={pet.stage === 'egg' ? copy.aria.egg : copy.aria.pet(name)}
        data-testid="pet"
        data-form={pet.form}
        data-pose={shownPose}
      >
        <div className={styles.art} style={{ filter, transform: `scaleX(${facing})` }}>
          {pet.stage === 'egg' ? (
            eggImg ? (
              <img src={eggImg} alt="" draggable={false} className={styles.img} />
            ) : (
              <PlaceholderPet
                form="egg"
                pose="idle"
                blink={false}
                lookX={lookX}
                lookY={lookY}
                sprout={sprout}
                droop={0}
                sleepy={false}
                blush={false}
                crack={crack}
                glow={focused ? 1 : 0.4}
              />
            )
          ) : img ? (
            <ImgArt src={img} sprout={sprout} />
          ) : (
            <PlaceholderPet
              form={pet.form}
              pose={shownPose}
              blink={blink}
              lookX={lookX}
              lookY={lookY}
              sprout={sprout}
              droop={droop}
              sleepy={mood.sleepy}
              blush={blush}
            />
          )}
          {dirt > 0 && pet.stage !== 'egg' && <Dirt amount={dirt} />}
        </div>
        {pet.sick && !asleep && <SickIcon />}
        {prop && <PropAt prop={prop} facing={facing} form={pet.form} />}
        {wish && <WishBubble text={wish} />}
        {butterfly && <Butterfly />}
      </motion.div>
      {glass && <div className={styles.glass} aria-hidden="true" />}
    </>
  );
}

function petPoseEgg(crack: number) {
  const pose = (['egg_idle', 'egg_crack1', 'egg_crack2', 'egg_crack3'] as const)[crack];
  return eggImage(pose);
}

function eggImage(p: 'egg_idle' | 'egg_crack1' | 'egg_crack2' | 'egg_crack3') {
  return petImage('egg', p) ?? petImage('egg', 'egg_idle');
}

/** Final PNG art: the whole image gets the sprout's sway as a tiny secondary wobble. */
function ImgArt({ src, sprout }: { src: string; sprout: MotionValue<number> }) {
  const r = useTransform(sprout, (v) => v * 0.08);
  return (
    <motion.img
      src={src}
      alt=""
      draggable={false}
      className={styles.img}
      style={{ rotate: r, originY: FEET }}
    />
  );
}

function Dirt({ amount }: { amount: number }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className={styles.overlay}
      style={{ opacity: amount * 0.85 }}
      aria-hidden="true"
    >
      {[
        [420, 700, 40],
        [600, 760, 30],
        [540, 620, 22],
        [460, 820, 26],
        [640, 660, 18],
      ].map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={r}
          ry={r * 0.7}
          fill="#6b4f3a"
          opacity="0.55"
          transform={`rotate(${i * 30} ${x} ${y})`}
        />
      ))}
    </svg>
  );
}

function SickIcon() {
  return (
    <svg viewBox="0 0 64 64" className={styles.sickIcon} aria-hidden="true">
      <path
        d="M32 10 C 52 18 52 40 32 52 C 20 40 18 22 32 10Z"
        fill="#a9b98a"
        stroke="#6f7d55"
        strokeWidth="3"
        transform="rotate(30 32 32)"
      />
      <path d="M32 50 L32 14" stroke="#6f7d55" strokeWidth="2.5" transform="rotate(30 32 32)" />
      <path d="M48 44 q 5 8 0 12 q -5 -4 0 -12z" fill="#8fc8ea" />
    </svg>
  );
}

function PropAt({
  prop,
  facing,
  form,
}: {
  prop: Exclude<Prop, null>;
  facing: number;
  form: string;
}) {
  const a = anchors(form as never);
  const style = {
    left: `${50 + (a.mouth.x - 0.5) * 100 + 18 * facing}%`,
    top: `${a.mouth.y * 100 - 6}%`,
  };
  if (prop === 'leafbook')
    return (
      <svg
        viewBox="0 0 120 80"
        className={styles.prop}
        style={{ left: '30%', top: `${a.mouth.y * 100 + 4}%`, width: '40%' }}
        aria-hidden="true"
      >
        <path
          d="M60 70 C 30 60 10 64 4 70 L4 16 C 14 8 40 8 60 18Z"
          fill="#a9c98b"
          stroke="#5f8a4c"
          strokeWidth="3"
        />
        <path
          d="M60 70 C 90 60 110 64 116 70 L116 16 C 106 8 80 8 60 18Z"
          fill="#bcd99d"
          stroke="#5f8a4c"
          strokeWidth="3"
        />
        <path
          d="M60 18 L60 70 M20 30 L48 32 M20 42 L46 44 M72 32 L100 30 M74 44 L100 42"
          stroke="#5f8a4c"
          strokeWidth="2"
        />
      </svg>
    );
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={styles.prop}
      style={style}
      initial={{ x: 160 * facing, y: -40, opacity: 0, rotate: 20 * facing }}
      animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 14 }}
      aria-hidden="true"
    >
      {prop === 'spoon' && (
        <g>
          <path d="M20 20 L70 70" stroke="#b8946a" strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="18" cy="18" rx="18" ry="13" transform="rotate(45 18 18)" fill="#d9b88a" />
          <ellipse cx="16" cy="16" rx="11" ry="7" transform="rotate(45 16 16)" fill="#a45a7a" />
        </g>
      )}
      {prop === 'candy' && (
        <g>
          <circle cx="40" cy="40" r="20" fill="#f2c76e" stroke="#d6a440" strokeWidth="4" />
          <circle cx="34" cy="33" r="6" fill="#fff4d0" />
        </g>
      )}
      {prop === 'vial' && (
        <g>
          <rect
            x="30"
            y="30"
            width="30"
            height="46"
            rx="12"
            fill="#a8d69a"
            stroke="#5f8a4c"
            strokeWidth="4"
          />
          <path d="M26 30 C 26 10 64 10 64 30Z" fill="#c8604f" />
          <circle cx="36" cy="20" r="4" fill="#f6efdf" />
          <circle cx="40" cy="56" r="4" fill="#eaffd8" />
        </g>
      )}
    </motion.svg>
  );
}

function WishBubble({ text }: { text: string }) {
  return (
    <motion.div
      className={styles.wish}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      role="status"
    >
      <svg viewBox="0 0 60 40" aria-hidden="true" className={styles.wishDoodle}>
        <path
          d="M30 4 l5 10 l11 2 l-8 8 l2 11 l-10 -5 l-10 5 l2 -11 l-8 -8 l11 -2z"
          fill="#f2c76e"
          stroke="#c99a3a"
          strokeWidth="2"
        />
      </svg>
      <span>{text}</span>
    </motion.div>
  );
}

function Butterfly() {
  return (
    <motion.svg
      viewBox="0 0 40 30"
      className={styles.butterfly}
      animate={{ x: [-60, 80, 20, 120, -40], y: [-40, -90, -20, -70, -50] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <g className={styles.flap}>
        <ellipse cx="12" cy="12" rx="10" ry="8" fill="#f2c76e" />
        <ellipse cx="28" cy="12" rx="10" ry="8" fill="#f2c76e" />
        <ellipse cx="13" cy="22" rx="6" ry="5" fill="#d86b6b" />
        <ellipse cx="27" cy="22" rx="6" ry="5" fill="#d86b6b" />
      </g>
      <rect x="19" y="6" width="2" height="18" rx="1" fill="#3f5e3a" />
    </motion.svg>
  );
}
