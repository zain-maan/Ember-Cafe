import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { dishById, SIGNATURES, type Dish } from '../data'
import { useMode } from '../lib/mode'
import { gsap, prefersReducedMotion } from '../lib/motion'
import DishCard from './DishCard'
import DishModal from './DishModal'
import { HandNote } from './Handmade'
import { ArrowLeft, ArrowRight } from './icons'

// Phones and tablets: the heading on top, then a swipeable deck where the card in focus sits forward,
// with a counter, progress bar and arrow buttons.
function SwipeDeck({ dishes, onOpen }: { dishes: Dish[]; onOpen: (d: Dish) => void }) {
  const row = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = row.current!
    const onScroll = () => {
      const card = el.firstElementChild as HTMLElement | null
      if (!card) return
      setActive(Math.round(el.scrollLeft / (card.offsetWidth + 16)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function go(i: number) {
    const el = row.current!
    const card = el.children[Math.max(0, Math.min(dishes.length - 1, i))] as HTMLElement
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: 'smooth' })
  }

  return (
    <div className="lg:hidden">
      <div ref={row} data-lenis-prevent className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-6 sm:px-6">
        {dishes.map((d, i) => (
          <div
            key={d.id}
            className={`w-[80%] max-w-[360px] shrink-0 snap-start transition-[transform,opacity] duration-500 ease-out sm:w-[46%] ${
              i === active ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-60'
            }`}
          >
            <DishCard dish={d} onOpen={onOpen} size="lg" />
          </div>
        ))}
        <span className="w-1 shrink-0" aria-hidden="true" />
      </div>
      {/* Arrows on the left, so the chat button in the corner never sits on top of them. */}
      <div className="mt-6 flex items-center gap-3 px-4 sm:px-6">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line disabled:opacity-30" aria-label="Previous dish">
          <ArrowLeft size={18} />
        </button>
        <button type="button" onClick={() => go(active + 1)} disabled={active === dishes.length - 1} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-bg disabled:opacity-30" aria-label="Next dish">
          <ArrowRight size={18} />
        </button>
        <div className="mx-1 h-[3px] flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${((active + 1) / dishes.length) * 100}%` }} />
        </div>
        <span className="font-display text-lg tabular-nums">
          {String(active + 1).padStart(2, '0')}
          <span className="text-soft"> / {String(dishes.length).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  )
}

// Desktop: the section pins and the signature dishes glide past sideways as you scroll.
export default function Signatures() {
  const { mode } = useMode()
  const [open, setOpen] = useState<Dish | null>(null)
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const dishes = SIGNATURES[mode].map((id) => dishById(id)!)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      const distance = () => track.current!.scrollWidth - window.innerWidth + 48
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top top', end: () => `+=${distance()}`, scrub: 0.8, pin: true, invalidateOnRefresh: true },
      })
      // Cards tilt a touch as they travel, as if being slid across a table.
      gsap.utils.toArray<HTMLElement>('[data-sig-card]').forEach((card) => {
        gsap.fromTo(
          card,
          { rotate: 3, y: 40 },
          { rotate: -2, y: -20, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
        )
      })
    })
    return () => mm.revert()
  }, [mode])

  const copy = {
    eyebrow: mode === 'day' ? 'Morning favourites' : 'After dark',
    title: mode === 'day' ? ['What everyone', 'orders first.'] : ['Cooked over', 'ironbark.'],
    text:
      mode === 'day'
        ? 'Six plates and cups that made our name. Add any of them to a pickup order in one tap.'
        : 'Our dinner signatures, plus the drinks people book the bar for. Flip the switch to see the café menu.',
    note: mode === 'day' ? 'start with the french toast' : 'the short rib sells out by 8',
  }

  return (
    <section ref={section} className="relative overflow-hidden py-20 sm:py-24 lg:flex lg:h-screen lg:items-center lg:py-0">
      {/* Phones and tablets */}
      <div className="mb-10 flex flex-col px-4 sm:px-6 lg:hidden">
        <p className="eyebrow">{copy.eyebrow}</p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-[2.7rem] leading-[0.98] sm:text-6xl">
            {copy.title[0]} <span className="italic-wonk text-accent">{copy.title[1]}</span>
          </h2>
          <HandNote arrow="down" className="hidden shrink-0 text-xl sm:block">
            swipe
          </HandNote>
        </div>
        <p className="mt-4 max-w-md text-soft">{copy.text}</p>
      </div>
      <SwipeDeck key={mode} dishes={dishes} onOpen={setOpen} />
      <div className="mt-10 flex items-center justify-between gap-4 px-4 sm:px-6 lg:hidden">
        <Link to="/menu" className="btn btn-ink">
          Full menu <ArrowRight size={16} />
        </Link>
        <HandNote className="text-xl">{copy.note}</HandNote>
      </div>

      {/* Desktop */}
      <div ref={track} className="hidden gap-10 pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pr-24 lg:flex">
        <div className="flex w-[420px] shrink-0 flex-col justify-center">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-5 font-display text-7xl leading-[0.98]">
            {copy.title[0]} <span className="italic-wonk text-accent">{copy.title[1]}</span>
          </h2>
          <p className="mt-5 max-w-sm text-soft">{copy.text}</p>
          <Link to="/menu" className="btn btn-ink mt-8 self-start">
            Full menu <ArrowRight size={16} />
          </Link>
          <HandNote arrow="right" className="mt-8">
            {copy.note}
          </HandNote>
        </div>
        {dishes.map((d) => (
          <div key={`${mode}-${d.id}`} data-sig-card className="w-[380px] shrink-0">
            <DishCard dish={d} onOpen={setOpen} size="lg" />
          </div>
        ))}
      </div>
      <DishModal dish={open} onClose={() => setOpen(null)} />
    </section>
  )
}
