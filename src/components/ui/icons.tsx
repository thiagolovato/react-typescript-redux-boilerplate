// Decorative icons. The control that uses one must carry the accessible name.

const svgProps = {
  'width': 18,
  'height': 18,
  'viewBox': '0 0 24 24',
  'fill': 'none',
  'stroke': 'currentColor',
  'strokeWidth': 1.75,
  'strokeLinecap': 'round',
  'strokeLinejoin': 'round',
  'aria-hidden': true,
} as const;

export function PlusIcon() {
  return (
    <svg {...svgProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...svgProps}>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg {...svgProps}>
      <path d="M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg {...svgProps}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function LogoutIcon() {
  return (
    <svg {...svgProps}>
      <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg {...svgProps}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function PanelIcon() {
  return (
    <svg {...svgProps}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}
