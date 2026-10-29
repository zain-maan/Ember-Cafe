import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { dishById } from '../data'
import { FREE_DELIVERY_FROM, useCart } from '../lib/cart'
import { money } from '../lib/format'
import { gsap, prefersReducedMotion, setScrollLocked } from '../lib/motion'
import { ArrowRight, Bag, Minus, Plus, X } from './icons'
import Img from './Img'

// Little extras offered when they are not already in the bag.
const UPSELLS = ['croissant', 'mud-cake', 'cold-brew']

export default function CartDrawer() {
  const { lines, open, setOpen, setQty, subtotal, add } = useCart()
  const { pathname } = useLocation()
  const [mounted, setMounted] = useState(open)
  const panel = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(false), [pathname, setOpen])

  useEffect(() => {
    if (open) setMounted(true)
    setScrollLocked(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  useLayoutEffect(() => {
    if (!mounted) return
    if (prefersReducedMotion()) {
      if (!open) setMounted(false)
      return
    }
    if (open) {
      gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: 'expo.out' })
      gsap.fromTo(shade.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      gsap.from('[data-cart-line]', { x: 40, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out', delay: 0.15 })
      panel.current?.focus()
    } else {
      gsap.to(panel.current, { xPercent: 100, duration: 0.5, ease: 'expo.in' })
      gsap.to(shade.current, { opacity: 0, duration: 0.4, onComplete: () => setMounted(false) })
    }
    // Only the open/close change should animate, not every quantity tweak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted])

  if (!mounted) return null

  const toFree = Math.max(0, FREE_DELIVERY_FROM - subtotal)
  const upsell = UPSELLS.map(dishById).find((d) => d && !lines.some((l) => l.key.startsWith(`${d.id}|`)))

  return (
    <div className="fixed inset-0 z-50">
      <div ref={shade} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        tabIndex={-1}
        data-lenis-prevent
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg text-ink shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl">Your order</h2>
          <button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Close order">
            <X size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-accent">
              <Bag size={32} />
            </span>
            <p className="font-display text-2xl">Your bag is empty</p>
            <p className="text-sm text-soft">Pick something from the menu for pickup or delivery, ready in about 15 minutes.</p>
            <Link to="/menu" className="btn btn-ink mt-2">
              Browse the menu <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <p className="text-xs font-semibold text-soft">{toFree > 0 ? `Add ${money(toFree)} more for free delivery` : 'You have unlocked free delivery'}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100)}%` }} />
              </div>
            </div>

            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {lines.map((l) => (
                <li key={l.key} data-cart-line className="flex gap-4">
                  <Img name={l.img} sizes="80px" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold leading-snug">{l.name}</p>
                      <p className="font-semibold">{money(l.price * l.qty)}</p>
                    </div>
                    {l.options && <p className="mt-0.5 text-xs text-soft">{l.options}</p>}
                    <div className="mt-2 inline-flex items-center rounded-full border border-line">
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} className="flex h-8 w-8 items-center justify-center" aria-label={`One less ${l.name}`}>
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold" aria-live="polite">
                        {l.qty}
                      </span>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} className="flex h-8 w-8 items-center justify-center" aria-label={`One more ${l.name}`}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}

              {upsell && (
                <li className="flex items-center gap-3 rounded-2xl border border-dashed border-line p-3">
                  <Img name={upsell.img} sizes="56px" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">Goes well with it</p>
                    <p className="font-semibold">{upsell.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => add({ id: upsell.id, name: upsell.name, price: upsell.price, img: upsell.img })}
                    className="chip"
                    aria-label={`Add ${upsell.name}`}
                  >
                    <Plus size={14} /> {money(upsell.price)}
                  </button>
                </li>
              )}
            </ul>

            <div className="border-t border-line px-6 py-5">
              <div className="mb-4 flex justify-between text-lg">
                <span>Subtotal</span>
                <span className="font-semibold">{money(subtotal)}</span>
              </div>
              <Link to="/order" className="btn btn-accent w-full">
                Checkout <ArrowRight size={16} />
              </Link>
              <p className="mt-3 text-center text-xs text-soft">Pickup in ~15 min · Delivery in ~35 min</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
