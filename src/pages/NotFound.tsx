import { Link } from 'react-router-dom'
import { ArrowRight } from '../components/icons'

// A spilled cup, still steaming.
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[90vh] max-w-3xl flex-col items-center justify-center px-4 pt-24 text-center sm:px-6">
      <svg viewBox="0 0 240 150" className="w-64 text-ink" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M30 128c30 10 140 12 190-2" stroke="var(--accent)" strokeWidth="10" opacity="0.35" />
        <path d="M70 70l58-30 26 50-58 30z" />
        <path d="M154 90c12-4 18 8 8 16l-8 4" />
        <path d="M96 120c20 6 70 8 110 0" stroke="var(--accent)" />
        {[100, 116, 132].map((x, i) => (
          <path key={x} d={`M${x} 34c-8-8 8-14 0-22`} className="animate-float" style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
      </svg>
      <p className="eyebrow mt-10">Error 404</p>
      <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">
        We spilled <span className="italic-wonk text-accent">this page.</span>
      </h1>
      <p className="mt-4 text-lg text-soft">It is not on the menu any more. The coffee, luckily, still is.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-ink">
          Back home <ArrowRight size={16} />
        </Link>
        <Link to="/menu" className="btn btn-ghost">
          See the menu
        </Link>
      </div>
    </section>
  )
}
