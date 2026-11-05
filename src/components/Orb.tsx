/** The crystal orb on the attract screen. Pure CSS, no images. */
export function Orb({ size = 230 }: { size?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size * 1.1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      aria-hidden
    >
      <div
        className="orb-halo"
        style={{
          position: 'absolute',
          width: size * 2,
          height: size * 2,
          left: -size * 0.5,
          top: -size * 0.5,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(227,154,111,0.32), transparent)',
          animation: 'breathe 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 78%, #f0a272 0%, #c4606a 28%, #5b3c78 58%, #1d1826 100%)',
          boxShadow:
            'inset 0 0 50px rgba(255,255,255,0.1), inset 0 -30px 60px rgba(0,0,0,0.35), 0 40px 120px rgba(227,154,111,0.3)',
        }}
      >
        <div
          className="orb-mist"
          style={{
            position: 'absolute',
            inset: '-30%',
            background:
              'conic-gradient(from 0deg, transparent, rgba(255,230,210,0.35), transparent 30%, rgba(182,166,230,0.4), transparent 60%, rgba(255,180,140,0.3), transparent 85%)',
            filter: 'blur(24px)',
            animation: 'swirl 16s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '20%',
            top: '9%',
            width: '36%',
            height: '20%',
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(255,255,255,0.65), transparent)',
            filter: 'blur(3px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            boxShadow: 'inset 0 1.5px 1px rgba(255,255,255,0.4), inset 0 -2px 12px rgba(255,190,150,0.25)',
          }}
        />
      </div>
      <div
        style={{
          width: size * 0.7,
          height: size * 0.07,
          marginTop: size * 0.05,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(0,0,0,0.6), transparent)',
        }}
      />
    </div>
  );
}
