import { BRAND } from '../data'

// Flame mark with a coffee-drop core, plus the wordmark.
export default function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width={small ? 26 : 32} height={small ? 26 : 32} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 6c7 9 14 15 14 26a14 14 0 0 1-28 0c0-6 2.5-9.5 6-13 0 6 2.4 9.5 6 9.5C27.6 20 29.5 13 32 6z" fill="var(--accent)" />
        <path d="M32 30c3.5 4.5 6 7 6 11a6 6 0 0 1-12 0c0-3.5 2.5-7 6-11z" fill="var(--honey)" />
      </svg>
      <span className="font-display text-2xl font-medium tracking-tight">
        {BRAND.name}
        <span className="text-accent">.</span>
      </span>
    </span>
  )
}
