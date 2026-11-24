/** Hand-drawn-feeling icon set. 48×48, soft round strokes. */
import type { SVGProps } from 'react';

const base = (p: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 48 48',
  width: 48,
  height: 48,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
});

export type IconName =
  | 'feed'
  | 'play'
  | 'bathe'
  | 'lights'
  | 'medicine'
  | 'discipline'
  | 'praise'
  | 'status'
  | 'bell'
  | 'journal'
  | 'settings'
  | 'photo'
  | 'sound'
  | 'mute'
  | 'pause'
  | 'close'
  | 'left'
  | 'right'
  | 'heart'
  | 'sun'
  | 'moon'
  | 'dawn'
  | 'dusk'
  | 'menu';

export function Icon({ name, ...p }: { name: IconName } & SVGProps<SVGSVGElement>) {
  switch (name) {
    case 'feed': // acorn bowl
      return (
        <svg {...base(p)}>
          <path
            d="M8 26 C 8 36 16 41 24 41 C 32 41 40 36 40 26Z"
            fill="currentColor"
            fillOpacity="0.18"
          />
          <path d="M6 26 H42" />
          <path d="M17 22 C 17 14 31 14 31 22" />
          <path d="M24 14 V10 M24 10 C 26 8 29 8 30 9" />
          <path d="M14 33 C 18 35 22 35 25 34" strokeWidth="2" />
        </svg>
      );
    case 'play': // leaf ball
      return (
        <svg {...base(p)}>
          <circle cx="24" cy="25" r="15" fill="currentColor" fillOpacity="0.15" />
          <path
            d="M11 20 C 18 24 30 24 37 19 M12 31 C 19 27 30 28 36 32 M24 10 C 20 18 20 32 24 40"
            strokeWidth="2.5"
          />
        </svg>
      );
    case 'bathe': // dewdrop wave
      return (
        <svg {...base(p)}>
          <path
            d="M24 6 C 30 15 33 20 33 25 C 33 30 29 33 24 33 C 19 33 15 30 15 25 C 15 20 18 15 24 6Z"
            fill="currentColor"
            fillOpacity="0.18"
          />
          <path d="M6 40 C 10 36 14 36 18 40 C 22 44 26 44 30 40 C 34 36 38 36 42 40" />
        </svg>
      );
    case 'lights': // lantern
      return (
        <svg {...base(p)}>
          <path d="M24 5 V9 M17 12 H31 L34 16 H14Z" />
          <rect x="15" y="16" width="18" height="20" rx="6" fill="currentColor" fillOpacity="0.2" />
          <path d="M24 22 C 27 25 26 29 24 30 C 22 29 21 25 24 22Z" strokeWidth="2" />
          <path d="M16 36 H32 L29 41 H19Z" />
        </svg>
      );
    case 'medicine': // mushroom vial
      return (
        <svg {...base(p)}>
          <path d="M12 18 C 12 8 36 8 36 18Z" fill="currentColor" fillOpacity="0.22" />
          <rect x="17" y="18" width="14" height="22" rx="6" />
          <path d="M20 30 H28" strokeWidth="2.5" />
          <circle cx="19" cy="13" r="1.5" fill="currentColor" />
          <circle cx="28" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'discipline': // furled leaf
      return (
        <svg {...base(p)}>
          <path
            d="M10 38 C 10 20 22 8 38 8 C 38 24 28 38 10 38Z"
            fill="currentColor"
            fillOpacity="0.16"
          />
          <path d="M10 38 L28 20" />
          <path d="M30 26 C 26 26 24 24 24 20" strokeWidth="2.5" />
        </svg>
      );
    case 'praise': // glow star
      return (
        <svg {...base(p)}>
          <path
            d="M24 7 L28.5 18 L40 19 L31 26.5 L34 38 L24 31.5 L14 38 L17 26.5 L8 19 L19.5 18Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path d="M6 8 L8 10 M42 8 L40 10 M24 42 V45" strokeWidth="2.5" />
        </svg>
      );
    case 'status': // notebook
      return (
        <svg {...base(p)}>
          <rect x="11" y="7" width="27" height="34" rx="4" fill="currentColor" fillOpacity="0.14" />
          <path d="M16 7 V41" />
          <path d="M21 16 H32 M21 22 H32 M21 28 H28" strokeWidth="2.5" />
          <path d="M8 14 H13 M8 22 H13 M8 30 H13" strokeWidth="2.5" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...base(p)}>
          <path
            d="M14 32 C 14 20 16 13 24 13 C 32 13 34 20 34 32 L37 35 H11Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          <path d="M24 13 V9 M20 39 C 21 42 27 42 28 39" />
        </svg>
      );
    case 'journal':
      return (
        <svg {...base(p)}>
          <path
            d="M24 12 C 18 8 11 8 6 10 V38 C 11 36 18 36 24 40 C 30 36 37 36 42 38 V10 C 37 8 30 8 24 12Z"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <path d="M24 12 V40" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...base(p)}>
          <circle cx="24" cy="24" r="6" />
          <path d="M24 6 V12 M24 36 V42 M6 24 H12 M36 24 H42 M11 11 L15 15 M33 33 L37 37 M37 11 L33 15 M15 33 L11 37" />
        </svg>
      );
    case 'photo':
      return (
        <svg {...base(p)}>
          <rect x="7" y="14" width="34" height="24" rx="6" fill="currentColor" fillOpacity="0.14" />
          <path d="M17 14 L20 9 H28 L31 14" />
          <circle cx="24" cy="26" r="7" />
        </svg>
      );
    case 'sound':
      return (
        <svg {...base(p)}>
          <path d="M9 19 H16 L25 11 V37 L16 29 H9Z" fill="currentColor" fillOpacity="0.18" />
          <path d="M31 18 C 34 21 34 27 31 30 M35 14 C 41 19 41 29 35 34" />
        </svg>
      );
    case 'mute':
      return (
        <svg {...base(p)}>
          <path d="M9 19 H16 L25 11 V37 L16 29 H9Z" fill="currentColor" fillOpacity="0.18" />
          <path d="M32 19 L41 28 M41 19 L32 28" />
        </svg>
      );
    case 'pause':
      return (
        <svg {...base(p)}>
          <rect x="13" y="11" width="7" height="26" rx="3" fill="currentColor" fillOpacity="0.3" />
          <rect x="28" y="11" width="7" height="26" rx="3" fill="currentColor" fillOpacity="0.3" />
        </svg>
      );
    case 'close':
      return (
        <svg {...base(p)}>
          <path d="M14 14 L34 34 M34 14 L14 34" />
        </svg>
      );
    case 'left':
      return (
        <svg {...base(p)}>
          <path d="M29 12 L17 24 L29 36" />
        </svg>
      );
    case 'right':
      return (
        <svg {...base(p)}>
          <path d="M19 12 L31 24 L19 36" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...base(p)}>
          <path d="M24 39 C 10 30 6 22 8 16 C 10 10 18 8 24 15 C 30 8 38 10 40 16 C 42 22 38 30 24 39Z" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...base(p)}>
          <circle cx="24" cy="24" r="8" fill="currentColor" fillOpacity="0.3" />
          <path d="M24 6 V10 M24 38 V42 M6 24 H10 M38 24 H42 M11 11 L14 14 M34 34 L37 37 M37 11 L34 14 M14 34 L11 37" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...base(p)}>
          <path
            d="M30 8 C 20 10 15 20 18 29 C 21 37 31 41 39 36 C 28 36 22 24 30 8Z"
            fill="currentColor"
            fillOpacity="0.3"
          />
        </svg>
      );
    case 'dawn':
      return (
        <svg {...base(p)}>
          <path
            d="M14 32 C 14 26 18 22 24 22 C 30 22 34 26 34 32"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <path d="M6 34 H42 M24 12 V16 M12 18 L15 21 M36 18 L33 21" />
        </svg>
      );
    case 'dusk':
      return (
        <svg {...base(p)}>
          <path
            d="M14 30 C 14 24 18 20 24 20 C 30 20 34 24 34 30"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <path d="M6 32 H42 M12 38 H36" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...base(p)}>
          <path d="M12 16 H36 M12 24 H36 M12 32 H36" />
        </svg>
      );
  }
}
