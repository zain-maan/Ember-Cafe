import type { MouseEvent, PointerEvent } from 'react'
import { TAG_LABELS, type Dish, type Tag } from '../data'
import { useCart } from '../lib/cart'
import { money } from '../lib/format'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { Flame, Leaf, Plus } from './icons'
import Img from './Img'

export function TagIcon({ tag, size = 14 }: { tag: Tag; size?: number }) {
  if (tag === 'spicy') return <Flame size={size} />
  if (tag === 'gf') return <span className="text-[0.6rem] font-extrabold leading-none tracking-tight">GF</span>
  return <Leaf size={size} fill={tag === 'vegan' ? 'currentColor' : 'none'} />
}

export function TagBadges({ tags, className = '' }: { tags: Tag[]; className?: string }) {
  return (
    <span className={`flex gap-1.5 ${className}`}>
      {tags.map((t) => (
        <span key={t} title={TAG_LABELS[t]} className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-ink backdrop-blur" aria-label={TAG_LABELS[t]}>
          <TagIcon tag={t} />
        </span>
      ))}
    </span>
  )
}

// A tiny photo flies from the card to the bag icon, so it is obvious where the dish went.
export function flyToBag(from: HTMLElement, img: string) {
  const bag = document.querySelector<HTMLElement>('[aria-label^="Open your order"]')
  if (!bag || prefersReducedMotion()) return
  const a = from.getBoundingClientRect()
  const b = bag.getBoundingClientRect()
  const dot = document.createElement('div')
  dot.style.cssText = `position:fixed;z-index:80;left:${a.left + a.width / 2 - 28}px;top:${a.top + a.height / 2 - 28}px;width:56px;height:56px;border-radius:999px;background:url(${img}) center/cover;box-shadow:0 10px 30px rgba(0,0,0,.35);pointer-events:none`
  document.body.appendChild(dot)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  gsap
    .timeline({ onComplete: () => dot.remove() })
    .to(dot, { x: dx, duration: 0.8, ease: 'power1.inOut' }, 0)
    .to(dot, { y: dy, duration: 0.8, ease: 'back.in(1.6)' }, 0)
    .to(dot, { scale: 0.25, opacity: 0.4, duration: 0.8, ease: 'power2.in' }, 0)
}

type Props = { dish: Dish; onOpen?: (d: Dish) => void; className?: string; size?: 'md' | 'lg' }

export default function DishCard({ dish, onOpen, className = '', size = 'md' }: Props) {
  const { add } = useCart()

  function addToBag(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    add({ id: dish.id, name: dish.name, price: dish.price, img: dish.img })
    flyToBag(e.currentTarget, `/images/${dish.img}-640.webp`)
  }

  // The photo leans towards the pointer like a card picked up off the table (mouse only).
  function tilt(e: PointerEvent<HTMLButtonElement>) {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(e.currentTarget, { rotateY: x * 10, rotateX: -y * 10, transformPerspective: 900, duration: 0.5, ease: 'power3.out' })
  }
  function untilt(e: PointerEvent<HTMLButtonElement>) {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
  }

  return (
    <article data-flip-id={dish.id} className={`group relative flex flex-col ${className}`}>
      <button
        onPointerMove={tilt}
        onPointerLeave={untilt}
        type="button"
        onClick={() => onOpen?.(dish)}
        data-cursor="View"
        className={`relative block w-full overflow-hidden rounded-[1.75rem] bg-muted text-left shadow-[0_0_0_rgba(0,0,0,0)] transition-shadow duration-500 group-hover:shadow-soft ${size === 'lg' ? 'aspect-[4/5]' : 'aspect-[5/4]'}`}
        aria-label={`View ${dish.name}`}
      >
        <Img name={dish.img} sizes="(min-width: 1024px) 30vw, 80vw" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-110" />
        <TagBadges tags={dish.tags} className="absolute left-3 top-3" />
        {dish.signature && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-accent-ink">Signature</span>
        )}
      </button>
      <div className="flex items-start gap-4 px-1 pt-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl leading-snug sm:text-2xl">{dish.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-soft">{dish.desc}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="font-display text-xl">{money(dish.price)}</span>
          <button
            type="button"
            onClick={addToBag}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-bg transition-[transform,background-color] hover:scale-110 hover:bg-accent hover:text-accent-ink"
            aria-label={`Add ${dish.name} to your order`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
