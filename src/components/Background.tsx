import type { CSSProperties } from 'react';
import { AURA, LAVENDER, type StageId } from '../content';

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const anchor = (x: number, y: number, scale: number): CSSProperties => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  transform: `translate(-50%,-50%) scale(${scale})`,
  transition: `left 2.4s ${EASE}, top 2.4s ${EASE}, transform 2.4s ${EASE}`,
});

/** Copper aura + lavender glow that glide to a new spot on every stage, plus vignette and grain. */
export function Background({ stage }: { stage: StageId }) {
  const [ax, ay, as] = AURA[stage] ?? AURA.attract;
  const [lx, ly] = LAVENDER[stage] ?? LAVENDER.attract;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }} aria-hidden>
      <div style={anchor(ax, ay, as)}>
        <div
          className="bg-drift"
          style={{
            width: '78vmax',
            height: '78vmax',
            borderRadius: '50%',
            background:
              'radial-gradient(closest-side, rgba(214,108,62,0.55), rgba(160,70,92,0.26) 48%, rgba(80,50,110,0.1) 68%, transparent 76%)',
            filter: 'blur(24px)',
            animation: 'drift1 28s ease-in-out infinite alternate',
          }}
        />
      </div>
      <div style={anchor(lx, ly, 1)}>
        <div
          className="bg-drift"
          style={{
            width: '56vmax',
            height: '56vmax',
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(170,150,230,0.22), transparent 72%)',
            filter: 'blur(40px)',
            animation: 'drift2 34s ease-in-out infinite alternate',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(5,4,8,0.6) 100%)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: NOISE, opacity: 0.07 }} />
    </div>
  );
}
