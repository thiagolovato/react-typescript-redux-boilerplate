import { useId } from 'react';

type Role = 'MENTOR' | 'MENTEE';

interface BirdProps {
  role: Role;
  /** Beats the wing while the bird flies. */
  flapping?: boolean;
  className?: string;
}

// Gradient stops per role, following the logo: blue to teal for the mentor, leaf green to the chartreuse tail
// for the mentee.
const tones: Record<Role, { body: [string, string]; wing: [string, string]; legs: string }> = {
  MENTOR: {
    body: ['var(--color-primary-500)', 'var(--color-teal-400)'],
    wing: ['var(--color-primary-600)', 'var(--color-primary-400)'],
    legs: 'var(--color-teal-400)',
  },
  MENTEE: {
    body: ['var(--color-secondary-400)', 'var(--color-secondary-300)'],
    wing: ['var(--color-secondary-500)', 'var(--color-secondary-300)'],
    legs: 'var(--color-secondary-300)',
  },
};

/** A bird drawn after the logo, facing right. Decorative: the surrounding text says what it means. */
export function Bird({ role, flapping = false, className = '' }: BirdProps) {
  const id = useId();
  const tone = tones[role];
  const bodyId = `${id}-body`;
  const wingId = `${id}-wing`;

  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className={`block overflow-visible ${className}`}>
      <defs>
        <linearGradient id={bodyId} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" style={{ stopColor: tone.body[0] }} />
          <stop offset="1" style={{ stopColor: tone.body[1] }} />
        </linearGradient>
        <linearGradient id={wingId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: tone.wing[0] }} />
          <stop offset="1" style={{ stopColor: tone.wing[1] }} />
        </linearGradient>
      </defs>
      <g stroke={tone.legs} strokeWidth="3" strokeLinecap="round">
        <path d="M60 80 L56 94" />
        <path d="M74 77 L78 94" />
      </g>
      <path d="M32 80 L10 97 L48 82 Z" fill={`url(#${wingId})`} />
      <path
        d="M6 84 C26 70 46 56 58 40 C60 22 70 12 82 12 C94 12 100 22 100 30 L114 32 L99 38
          C98 56 88 72 70 78 C52 84 30 84 6 84 Z"
        fill={`url(#${bodyId})`}
      />
      <g className={flapping ? 'nf-flap' : undefined}>
        <path d="M34 70 C42 52 58 44 72 48 C82 52 80 64 70 72 C58 80 44 78 34 70 Z" fill={`url(#${wingId})`} />
      </g>
      <circle cx="86" cy="26" r="4" fill="var(--color-neutral-800)" />
    </svg>
  );
}
