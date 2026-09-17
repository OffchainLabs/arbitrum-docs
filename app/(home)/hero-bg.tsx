'use client';

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-1 overflow-hidden">
      <div className="absolute -inset-[40%] animate-fd-fade-in bg-[conic-gradient(from_180deg_at_50%_50%,var(--color-fd-primary)_0deg,transparent_120deg,var(--color-fd-accent)_240deg,var(--color-fd-primary)_360deg)] opacity-20 blur-3xl [animation-duration:1200ms]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-fd-background" />
    </div>
  );
}
