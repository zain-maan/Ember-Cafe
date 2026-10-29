import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BRAND, HOURS } from '../data'
import { hourLabel } from '../lib/format'
import { openStatus } from '../lib/hours'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { ArrowRight, Check, Instagram, MapPin, Phone } from './icons'
import Logo from './Logo'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  const todayIdx = new Date().getDay()
  const status = openStatus()
  const mark = useRef<HTMLParagraphElement>(null)

  // The giant wordmark rises letter by letter as the footer comes into view.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-mark-letter]', {
        yPercent: 100,
        rotate: 8,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: mark.current, start: 'top bottom', end: 'bottom 85%', scrub: 1 },
      })
    }, mark)
    return () => ctx.revert()
  }, [])

  function join(e: FormEvent) {
    e.preventDefault()
    if (email.includes('@')) setJoined(true)
  }

  return (
    <footer className="bg-panel grain relative overflow-hidden text-panel-ink">
      <div className="relative z-[2] mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm font-display text-3xl leading-tight">
              Come for the coffee, <span className="italic-wonk text-panel-accent">stay for the fire.</span>
            </p>
            <form onSubmit={join} className="mt-8 max-w-sm">
              <label htmlFor="news" className="text-xs font-semibold uppercase tracking-[0.2em] text-panel-ink/60">
                Seasonal menus & events
              </label>
              {joined ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-panel-accent">
                  <Check size={16} /> You are on the list. See you soon.
                </p>
              ) : (
                <div className="mt-3 flex rounded-full border border-panel-ink/20 p-1 focus-within:border-panel-accent">
                  <input
                    id="news"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-panel-ink/40"
                  />
                  <button type="submit" className="btn btn-ink !px-4 !py-2.5" aria-label="Join the list">
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </form>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-panel-ink/60">Opening hours</h3>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${status.open ? 'animate-pulse bg-[#5ccf7a]' : 'bg-panel-ink/40'}`} />
              {status.label}
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {[1, 2, 3, 4, 5, 6, 0].map((i) => (
                <li key={i} className={`flex justify-between gap-6 ${i === todayIdx ? 'font-semibold text-panel-accent' : 'text-panel-ink/70'}`}>
                  <span>{HOURS[i].day}</span>
                  <span>
                    {hourLabel(HOURS[i].open)} to {hourLabel(HOURS[i].close)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-panel-ink/50">Brunch until 4 PM · Dinner from {hourLabel(BRAND.dinnerFrom)}</p>
          </div>

          <div className="space-y-5 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-panel-ink/60">Find us</h3>
            <a href={BRAND.mapsUrl} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-panel-accent">
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <span>
                {BRAND.street}
                <br />
                {BRAND.suburb}
              </span>
            </a>
            <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="flex gap-3 hover:text-panel-accent">
              <Phone size={18} className="shrink-0" /> {BRAND.phone}
            </a>
            <p className="flex gap-3">
              <Instagram size={18} className="shrink-0" /> {BRAND.instagram}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                ['/menu', 'Menu'],
                ['/order', 'Order'],
                ['/reserve', 'Reserve'],
                ['/about', 'Story'],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="rounded-full border border-panel-ink/20 px-4 py-2 hover:border-panel-accent hover:text-panel-accent">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p ref={mark} aria-hidden="true" className="pointer-events-none mt-16 flex select-none justify-center overflow-hidden font-display text-[24vw] leading-[0.85] tracking-tighter text-panel-ink/[0.07]">
          {BRAND.name.toLowerCase().split('').map((ch, i) => (
            <span key={i} data-mark-letter className="inline-block">
              {ch}
            </span>
          ))}
        </p>

        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-panel-ink/10 pt-6 text-xs text-panel-ink/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND.full}. A portfolio concept, not a real business.
          </p>
          <p>Photos: Unsplash</p>
        </div>
      </div>
    </footer>
  )
}
