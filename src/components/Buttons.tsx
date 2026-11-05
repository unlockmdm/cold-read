import type { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick: () => void;
  style?: CSSProperties;
}

/** Cream pill. Pass `arrow` for the trailing "→". */
export function PrimaryButton({ children, onClick, style, arrow = true }: Props & { arrow?: boolean }) {
  return (
    <button type="button" className="btn btn-primary" onClick={onClick} style={style}>
      {children}
      {arrow && <span aria-hidden>→</span>}
    </button>
  );
}

/** Outlined pill. */
export function SecondaryButton({ children, onClick, style }: Props) {
  return (
    <button type="button" className="btn btn-secondary" onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="back-btn" onClick={onClick} aria-label="Back">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
