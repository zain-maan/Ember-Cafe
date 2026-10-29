import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { useMode } from '../lib/mode'
import { gsap, prefersReducedMotion, setScrollLocked } from '../lib/motion'
import { openStatus } from '../lib/hours'
import { BRAND } from '../data'
import { Bag, Menu, X } from './icons'
import Logo from './Logo'
import ModeToggle from './ModeToggle'

const LINKS = [
  { to: '/menu', label: 'Menu' },
  { to: '/order', label: 'Order online' },
  { to: '/reserve', label: 'Reserve' },
  { to: '/about', label: 'Our story' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const { count, setOpen, pulse } = useCart()
  const { mode } = useMode()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const bag = useRef<HTMLButtonElement>(null)
  const overlay = useRef<HTMLDivElement>(null)

  // Solid after the first screen; slides away while reading down, comes back on the way up.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      setHidden(y > 500 && y > last + 4 ? true : y < last - 4 ? false : (h) => h)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    if (!pulse || prefersReducedMotion()) return
    gsap.fromTo(bag.current, { scale: 1 }, { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' })
  }, [pulse])

  useEffect(() => {
    setScrollLocked(menuOpen)
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    if (!prefersReducedMotion()) {
      gsap.fromTo(overlay.current, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 0.8, ease: 'expo.inOut' })
      gsap.from('[data-menu-link]', { yPercent: 110, duration: 0.8, stagger: 0.06, ease: 'power4.out', delay: 0.25 })
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // At the top of the page the bar is see-through: light text over the night hero photo, ink over the bright day hero.
  const onPhoto = pathname === '/' && !scrolled && mode === 'night'
  const status = openStatus()

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[transform,background-color,box-shadow,color] duration-500 ${
          hidden && !menuOpen ? '-translate-y-full' : ''
        } ${onPhoto ? 'text-cream' : !scrolled ? 'text-ink' : 'bg-bg/80 text-ink shadow-[0_1px_0_var(--line)] backdrop-blur-xl'}`}
      >
        <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-4 px-4 sm:px-6" aria-label="Main">
          <Link to="/" className="mr-auto flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `relative rounded-full px-4 py-2 text-sm font-semibold transition-colors after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                      isActive ? 'after:scale-x-100' : 'after:scale-x-0'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <ModeToggle />

          <button
            ref={bag}
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-current/25 transition-colors hover:bg-current/10"
            aria-label={`Open your order, ${count} item${count === 1 ? '' : 's'}`}
          >
            <Bag size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] font-bold text-accent-ink">
                {count}
              </span>
            )}
          </button>

          <Link to="/reserve" data-magnetic className="btn btn-accent hidden !py-2.5 sm:inline-flex">
            Book a table
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-current/25 lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={18} />
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div ref={overlay} role="dialog" aria-modal="true" aria-label="Menu" className="bg-panel grain fixed inset-0 z-[55] flex flex-col px-6 pb-10 pt-5 text-panel-ink lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" onClick={() => setMenuOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-panel-ink/25" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
          <ul className="mt-14 space-y-2">
            {[{ to: '/', label: 'Home' }, ...LINKS].map((l, i) => (
              <li key={l.to} className="overflow-hidden">
                <Link data-menu-link to={l.to} className="flex items-baseline gap-4 font-display text-5xl leading-tight">
                  <span className="font-sans text-xs text-panel-accent">0{i + 1}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-4 text-sm text-panel-ink/70">
            <p className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${status.open ? 'bg-[#5ccf7a]' : 'bg-panel-ink/40'}`} />
              {status.label}
            </p>
            <p>
              {BRAND.street}, {BRAND.suburb}
            </p>
            <Link to="/reserve" className="btn btn-ink w-full">
              Book a table
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
