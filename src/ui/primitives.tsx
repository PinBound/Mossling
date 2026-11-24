import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import { bus } from '../game/bus';
import { useReducedMotion } from '../game/prefs';
import { Icon } from './Icons';
import styles from './ui.module.css';

export const squish = {
  whileTap: { scale: 0.92 },
  whileHover: { scale: 1.04 },
  transition: { type: 'spring' as const, stiffness: 500, damping: 15 },
};

export function Button({
  children,
  className,
  variant = 'primary',
  onClick,
  ...p
}: HTMLMotionProps<'button'> & { variant?: 'primary' | 'soft' | 'ghost' | 'danger' }) {
  return (
    <motion.button
      type="button"
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${className ?? ''}`}
      {...squish}
      onClick={(e) => {
        bus.fx('tap');
        onClick?.(e);
      }}
      {...p}
    >
      {children}
    </motion.button>
  );
}

/** Slide-up sheet with a slight bounce. Esc closes it. Focus moves in and is restored after. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  wide,
  className,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
  labelledBy?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(
      () =>
        ref.current
          ?.querySelector<HTMLElement>('button, [href], input, select, [tabindex]')
          ?.focus(),
      60,
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, [open, onClose]);
  const id = labelledBy ?? `sheet-${title.replace(/\W+/g, '-')}`;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.scrim}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            className={`${styles.sheet} ${wide ? styles.sheetWide : ''} ${className ?? ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className={styles.sheetHead}>
              <h2 id={id}>{title}</h2>
              <motion.button
                type="button"
                className={styles.iconBtn}
                onClick={onClose}
                aria-label="Close"
                {...squish}
              >
                <Icon name="close" width={26} height={26} />
              </motion.button>
            </div>
            <div className={styles.sheetBody}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Hearts({
  value,
  label,
  icon = 'heart',
}: {
  value: number;
  label: string;
  icon?: 'heart' | 'sprout';
}) {
  const n = Math.max(0, Math.min(4, Math.ceil(value / 25 - 1e-9)));
  return (
    <div
      className={styles.hearts}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-valuetext={`${n} of 4 (${Math.round(value)} / 100)`}
    >
      <span className={styles.heartsLabel}>{label}</span>
      <span className={styles.heartRow}>
        {[0, 1, 2, 3].map((i) => (
          <motion.svg
            key={i}
            viewBox="0 0 48 48"
            width="30"
            height="30"
            initial={false}
            animate={{ scale: i < n ? 1 : 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            {icon === 'heart' ? (
              <path
                d="M24 41 C 9 31 4 22 6 15 C 8 8 18 6 24 14 C 30 6 40 8 42 15 C 44 22 39 31 24 41Z"
                fill={i < n ? 'var(--berry)' : 'transparent'}
                stroke="var(--berry)"
                strokeWidth="3"
              />
            ) : (
              <g>
                <path d="M24 42 V22" stroke="var(--fern)" strokeWidth="3.5" strokeLinecap="round" />
                <path
                  d="M24 26 C 14 26 8 18 10 10 C 20 10 25 18 24 26Z"
                  fill={i < n ? 'var(--moss)' : 'transparent'}
                  stroke="var(--fern)"
                  strokeWidth="3"
                />
                <path
                  d="M24 22 C 32 22 38 15 37 8 C 29 8 24 14 24 22Z"
                  fill={i < n ? 'var(--moss)' : 'transparent'}
                  stroke="var(--fern)"
                  strokeWidth="3"
                />
              </g>
            )}
          </motion.svg>
        ))}
      </span>
      <span className={styles.heartsNum}>{Math.round(value)}</span>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <label className={styles.toggleRow}>
      <span>
        <span className={styles.rowLabel}>{label}</span>
        {desc && <span className={styles.rowDesc}>{desc}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => {
          bus.fx('tap');
          onChange(!checked);
        }}
      >
        <motion.span
          className={styles.knob}
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        />
      </button>
    </label>
  );
}
