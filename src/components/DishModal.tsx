import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TAG_LABELS, type Dish } from '../data'
import { useCart } from '../lib/cart'
import { money } from '../lib/format'
import { gsap, prefersReducedMotion, setScrollLocked } from '../lib/motion'
import { flyToBag, TagIcon } from './DishCard'
import { Minus, Plus, X } from './icons'
import Img from './Img'

const NOTES = ['No changes', 'Make it vegan', 'Extra hot', 'Allergy: tell the kitchen']

// Quick view: big photo, story, allergens and a quantity stepper, without leaving the menu.
export default function DishModal({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState(NOTES[0])
  const box = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setQty(1)
    setNote(NOTES[0])
    setScrollLocked(!!dish)
    if (dish) closeBtn.current?.focus()
  }, [dish])

  useEffect(() => {
    if (!dish) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dish, onClose])

  useLayoutEffect(() => {
    if (!dish || prefersReducedMotion()) return
    gsap.fromTo(box.current, { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' })
    gsap.fromTo('[data-modal-img] img', { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'expo.out' })
  }, [dish])

  if (!dish) return null

  function addToBag(btn: HTMLElement) {
    add({ id: dish!.id, name: dish!.name, price: dish!.price, img: dish!.img, options: note === NOTES[0] ? undefined : note }, qty)
    flyToBag(btn, `/images/${dish!.img}-640.webp`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-title"
        data-lenis-prevent
        className="relative grid max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-bg text-ink shadow-2xl sm:rounded-[2rem] md:grid-cols-2"
      >
        <div data-modal-img className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
          <Img name={dish.img} sizes="(min-width: 768px) 450px, 100vw" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <button ref={closeBtn} type="button" onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-bg/80 backdrop-blur" aria-label="Close">
            <X size={18} />
          </button>
          {dish.signature && <p className="eyebrow mb-3">House signature</p>}
          <h2 id="dish-title" className="font-display text-3xl leading-tight sm:text-4xl">
            {dish.name}
          </h2>
          <p className="mt-2 font-display text-2xl text-accent">{money(dish.price)}</p>
          <p className="mt-4 leading-relaxed text-soft">{dish.details}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {dish.tags.map((t) => (
              <span key={t} className="chip !cursor-default !py-1.5">
                <TagIcon tag={t} /> {TAG_LABELS[t]}
              </span>
            ))}
            <span className="chip !cursor-default !py-1.5">{dish.kcal} kcal</span>
          </div>
          <p className="mt-4 text-xs text-soft">
            <span className="font-semibold text-ink">Contains:</span> {dish.allergens.length ? dish.allergens.join(', ') : 'No major allergens'}
          </p>

          <fieldset className="mt-6">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-soft">Note for the kitchen</legend>
            <div className="flex flex-wrap gap-2">
              {NOTES.map((n) => (
                <button key={n} type="button" aria-pressed={note === n} onClick={() => setNote(n)} className="chip">
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-auto flex items-center gap-3 pt-8">
            <div className="inline-flex items-center rounded-full border border-line">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-12 w-12 items-center justify-center" aria-label="One less">
                <Minus size={16} />
              </button>
              <span className="w-6 text-center font-semibold" aria-live="polite">
                {qty}
              </span>
              <button type="button" onClick={() => setQty((q) => q + 1)} className="flex h-12 w-12 items-center justify-center" aria-label="One more">
                <Plus size={16} />
              </button>
            </div>
            <button type="button" onClick={(e) => addToBag(e.currentTarget)} className="btn btn-accent flex-1">
              Add {qty > 1 ? `${qty} · ` : ''}
              {money(dish.price * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
