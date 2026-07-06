// Lightweight, GPU-cheap ambient backdrop (no WebGL). Two drifting color blobs
// plus a faint grid. Honors prefers-reduced-motion via the global CSS rule.
export default function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div className="absolute -left-[10%] -top-[15%] h-[55vh] w-[55vh] animate-aurora rounded-full bg-primary/25 blur-[120px]" />
      <div className="absolute -right-[5%] top-[20%] h-[45vh] w-[45vh] animate-aurora rounded-full bg-accent/20 blur-[120px] [animation-delay:-6s]" />
      <div className="absolute bottom-[-15%] left-[30%] h-[40vh] w-[40vh] animate-aurora rounded-full bg-indigo-600/15 blur-[120px] [animation-delay:-12s]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
    </div>
  );
}
