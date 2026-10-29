import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DishCard, { TagIcon } from '../components/DishCard'
import DishModal from '../components/DishModal'
import { Moon, Search, Sun, X } from '../components/icons'
import PageHero from '../components/PageHero'
import { BRAND, CATEGORIES, MENU, TAG_LABELS, type Category, type Dish, type Tag } from '../data'
import { hourLabel } from '../lib/format'
import { useMode } from '../lib/mode'
import { Flip, gsap, prefersReducedMotion, ScrollTrigger } from '../lib/motion'

const TAGS = Object.keys(TAG_LABELS) as Tag[]

export default function MenuPage() {
  const { mode } = useMode()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [open, setOpen] = useState<Dish | null>(null)
  const grid = useRef<HTMLDivElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)

  const catParam = params.get('cat')
  const cat: Category | 'all' = CATEGORIES.some((c) => c.id === catParam) ? (catParam as Category) : catParam === 'all' ? 'all' : mode === 'day' ? 'coffee' : 'mains'
  const catInfo = CATEGORIES.find((c) => c.id === cat)

  const dishes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MENU.filter(
      (d) =>
        (cat === 'all' || d.cat === cat) &&
        tags.every((t) => d.tags.includes(t) || (t === 'veg' && d.tags.includes('vegan'))) &&
        (!q || `${d.name} ${d.desc}`.toLowerCase().includes(q)),
    )
  }, [cat, tags, query])

  // Remember where every card was, change the filter, then let Flip glide them to their new places.
  function remember() {
    if (grid.current && !prefersReducedMotion()) flipState.current = Flip.getState(grid.current.querySelectorAll('[data-flip-id]'))
  }

  useLayoutEffect(() => {
    const state = flipState.current
    flipState.current = null
    if (!state || !grid.current) return
    Flip.from(state, {
      targets: grid.current.querySelectorAll('[data-flip-id]'),
      duration: 0.7,
      ease: 'power3.inOut',
      absolute: true,
      stagger: 0.02,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4 }),
      onComplete: () => ScrollTrigger.refresh(),
    })
  }, [dishes])

  // First visit: the cards deal in from below, one after another.
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !grid.current) return
    const tween = gsap.from(grid.current.querySelectorAll('[data-flip-id]'), { y: 60, opacity: 0, rotateX: 12, transformPerspective: 900, duration: 1, stagger: 0.07, ease: 'power3.out', delay: 0.6 })
    return () => {
      tween.progress(1).kill()
    }
  }, [])

  function pickCat(c: Category | 'all') {
    remember()
    setParams(c === (mode === 'day' ? 'coffee' : 'mains') ? {} : { cat: c }, { replace: true, preventScrollReset: true })
  }
  function toggleTag(t: Tag) {
    remember()
    setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))
  }

  const servingLater = mode === 'day' && catInfo?.mode === 'night'

  return (
    <>
      <PageHero
        eyebrow="The menu"
        title={
          <>
            Cooked from scratch, <span className="italic-wonk text-accent">morning to midnight.</span>
          </>
        }
        lead="Everything can be ordered for pickup or delivery. Tap a dish for the full story, allergens and kitchen notes."
        note={<>even the ketchup is made here</>}
        collage={[
          { img: 'brunch-spread', caption: 'brunch, all weekend' },
          { img: 'latte-top', caption: 'flat white no. 1' },
          { img: 'steak-frites', caption: 'after 5 pm' },
        ]}
      />

      <div className="sticky top-0 z-30 border-y border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center">
          <div role="tablist" aria-label="Menu sections" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {[{ id: 'all' as const, label: 'Everything', mode: 'all' as const }, ...CATEGORIES].map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => pickCat(c.id)} className="chip shrink-0">
                {c.mode === 'day' && <Sun size={13} />}
                {c.mode === 'night' && <Moon size={13} />}
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 lg:ml-auto">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {TAGS.map((t) => (
                <button key={t} type="button" aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)} className="chip shrink-0 !px-3" title={TAG_LABELS[t]}>
                  <TagIcon tag={t} /> <span className="hidden sm:inline">{TAG_LABELS[t]}</span>
                </button>
              ))}
            </div>
            <label className="relative ml-auto flex items-center">
              <Search size={16} className="pointer-events-none absolute left-3 text-soft" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  remember()
                  setQuery(e.target.value)
                }}
                placeholder="Search"
                aria-label="Search the menu"
                className="field !w-36 !rounded-full !py-2 !pl-9 sm:!w-48"
              />
            </label>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-28 pt-10 sm:px-6">
        {catInfo && (
          <p className="mb-8 flex flex-wrap items-center gap-2 text-sm text-soft">
            {catInfo.note}
            {servingLater && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-ink">
                Served from {hourLabel(BRAND.dinnerFrom)}. Order now to pick up tonight.
              </span>
            )}
          </p>
        )}

        <div ref={grid} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.map((d) => (
            <DishCard key={d.id} dish={d} onOpen={setOpen} />
          ))}
        </div>

        {dishes.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <p className="font-display text-3xl">Nothing matches that, yet.</p>
            <p className="mt-2 text-soft">Try fewer filters, or ask our kitchen. They love a challenge.</p>
            <button
              type="button"
              onClick={() => {
                setTags([])
                setQuery('')
              }}
              className="btn btn-ink mt-6"
            >
              <X size={16} /> Clear filters
            </button>
          </div>
        )}
      </section>

      <DishModal dish={open} onClose={() => setOpen(null)} />
    </>
  )
}
