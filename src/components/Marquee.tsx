import { MOOD } from '../data'
import { useMode } from '../lib/mode'

// An endless band of words that changes with the mood. The list is rendered twice and shifted by half its width per loop.
export default function Marquee() {
  const { mode } = useMode()
  const words = MOOD[mode].marquee
  const items = [...words, ...words]
  return (
    <div data-skew className="relative -rotate-1 overflow-hidden bg-accent py-5 text-accent-ink sm:py-6" aria-hidden="true">
      <div className="animate-marquee flex w-max items-center hover:[animation-play-state:paused]">
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-8 pr-8 font-display text-3xl sm:text-5xl">
            <span className={i % 2 ? 'italic-wonk' : ''}>{w}</span>
            <svg width="22" height="28" viewBox="0 0 22 28" aria-hidden="true" className="opacity-70">
              <ellipse cx="11" cy="14" rx="9" ry="12.5" fill="currentColor" />
              <path d="M11 3c-4 6 4 16 0 22" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  )
}
