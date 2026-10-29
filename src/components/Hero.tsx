import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BRAND, dishById, MOOD, type Dish, type ImageName, type Mode } from '../data'
import { useCart } from '../lib/cart'
import { money } from '../lib/format'
import { openStatus } from '../lib/hours'
import { useMode } from '../lib/mode'
import { gsap, introDelay, prefersReducedMotion } from '../lib/motion'
import { flyToBag } from './DishCard'
import { ExpandPhoto, HandNote, PenUnderline, Polaroid } from './Handmade'
import { ArrowDown, ArrowRight, Plus } from './icons'
import Img from './Img'
import Steam from './Steam'

const TINT: Record<Mode, [number, number, number]> = { day: [1, 0.98, 0.95], night: [1, 0.72, 0.5] }
const PILLS: Record<Mode, [ImageName, ImageName]> = { day: ['latte-pour', 'croissant-table'], night: ['night-bar', 'steak-frites'] }

// A little photo set into the line of the headline, like a magazine cover.
function Pill({ img, className = '' }: { img: ImageName; className?: string }) {
  return (
    <span data-pill className={`relative mx-[0.12em] inline-block h-[0.78em] w-[1.6em] translate-y-[0.06em] overflow-hidden rounded-full align-baseline ${className}`}>
      <Img name={img} priority sizes="240px" className="absolute inset-0 h-full w-full object-cover" />
    </span>
  )
}

function Title() {
  const { mode } = useMode()
  const [a, b] = MOOD[mode].title
  const [first, ...rest] = a.split(' ')
  const [lead, ...tail] = b.split(' ')
  return (
    <h1 key={mode} data-hero-title className="font-display text-[clamp(2.9rem,9.2vw,9.2rem)] font-light leading-[0.98] tracking-tight">
      {/* Each line rises from behind its own mask. (No SplitText here: it rebuilds the DOM and would
          detach the photos and pen stroke that React renders inside the line.) */}
      <span className="block overflow-hidden pb-[0.08em]">
        <span data-line className="block">
          {first}
          <Pill img={PILLS[mode][0]} /> {rest.join(' ')}
        </span>
      </span>
      <span className="block overflow-hidden pb-[0.12em]">
        <span data-line className={`block italic-wonk ${mode === 'day' ? 'text-accent' : 'text-honey'}`}>
          <PenUnderline delay={introDelay(1.3)}>{lead}</PenUnderline> {tail.join(' ')}
          <Pill img={PILLS[mode][1]} className="hidden sm:inline-block" />
        </span>
      </span>
    </h1>
  )
}

function Status({ light }: { light?: boolean }) {
  const status = openStatus()
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${status.open ? 'animate-pulse bg-[#3fbf63]' : light ? 'bg-cream/40' : 'bg-soft/40'}`} />
      {status.label}
    </span>
  )
}

// Today's pick as a taped photo with a pen caption and an add button.
function TodaysPick({ dish, rotate, className = '' }: { dish: Dish; rotate: number; className?: string }) {
  const { add } = useCart()
  return (
    <div data-polaroid className={className}>
      <Polaroid img={dish.img} rotate={rotate} className="w-44 sm:w-56" sizes="224px" caption={<>today · {money(dish.price)}</>}>
        <button
          type="button"
          onClick={(e) => {
            add({ id: dish.id, name: dish.name, price: dish.price, img: dish.img })
            flyToBag(e.currentTarget, `/images/${dish.img}-640.webp`)
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4622a] text-white transition-transform hover:rotate-90 hover:scale-110"
          aria-label={`Add ${dish.name} to your order`}
        >
          <Plus size={15} />
        </button>
      </Polaroid>
    </div>
  )
}

function DayHero() {
  const mood = MOOD.day
  const special = dishById(mood.special.dish)!
  return (
    <>
      <div data-hero-copy className="relative mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:pt-36">
        <div data-hero-fade className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-b border-line pb-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-soft">
          <span>Café & Kitchen · {BRAND.street}, Fitzroy · Est. 2017</span>
          <Status />
        </div>
        <div className="mt-8 sm:mt-12">
          <Title />
        </div>
        <div className="mt-8 grid items-end gap-8 sm:mt-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p data-hero-fade className="max-w-xl text-lg leading-relaxed text-soft">
              {mood.lead}
            </p>
            <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu?cat=coffee" data-magnetic className="btn btn-accent">
                Order for pickup <ArrowRight size={16} />
              </Link>
              <Link to="/reserve" className="btn btn-ghost">
                Book a table
              </Link>
            </div>
          </div>
          <div data-hero-fade className="hidden lg:block">
            <HandNote arrow="down-left">
              Tom’s been on the
              <br />
              machine since 6:30
            </HandNote>
          </div>
        </div>
      </div>

      <ExpandPhoto img="counter-chat" priority className="mt-12 h-[62svh] min-h-[420px] sm:mt-16 lg:h-[86vh]">
        <TodaysPick dish={special} rotate={-5} className="absolute -top-10 right-6 sm:-top-14 sm:right-[9%]" />
        <p className="absolute bottom-5 left-[7%] font-hand text-2xl text-white drop-shadow-md sm:bottom-8 sm:text-3xl">Saturday, 9:14 am · the counter</p>
      </ExpandPhoto>
    </>
  )
}

function NightHero() {
  const mood = MOOD.night
  const special = dishById(mood.special.dish)!
  return (
    <div className="relative flex h-[100svh] min-h-[720px] items-end text-cream">
      <div data-hero-photos className="absolute inset-0">
        <div data-hero-img className="absolute inset-0">
          <Img name={mood.hero} priority sizes="100vw" alt="" className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0805] via-[#0d0805]/60 to-[#0d0805]/30" />
      <Steam tint={TINT.night} />

      <TodaysPick dish={special} rotate={4} className="absolute right-6 top-28 hidden sm:block lg:right-[8%] lg:top-32" />

      <div data-hero-copy className="relative mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div data-hero-fade className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cream/70">
          <Status light />
          <span>Dinner from 5 PM · Bar till late</span>
        </div>
        <Title />
        <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p data-hero-fade className="max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
              {mood.lead}
            </p>
            <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
              <Link to="/reserve" data-magnetic className="btn btn-cream">
                Book tonight <ArrowRight size={16} />
              </Link>
              <Link to="/menu" className="btn btn-ghost">
                See the dinner menu
              </Link>
            </div>
          </div>
          <div data-hero-fade className="hidden lg:block">
            <HandNote className="!text-honey">Lucia lights the grill at 4:30</HandNote>
          </div>
        </div>
        <div className="mt-10 hidden items-center gap-3 text-xs uppercase tracking-[0.25em] text-cream/60 sm:flex">
          <ArrowDown size={14} className="animate-bounce" /> Scroll
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const { mode } = useMode()
  const root = useRef<HTMLElement>(null)
  const firstRun = useRef(true)

  // Entrance: headline lines rise from behind a mask, the photos in the headline open up,
  // the taped photo drops onto the page. After the intro on first load, and again whenever the mood flips.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const delay = firstRun.current ? introDelay(0.1) : 0.35
    firstRun.current = false
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-title] [data-line]', { yPercent: 110, duration: 1.2, stagger: 0.12, ease: 'power4.out', delay })
      gsap.from('[data-pill]', { width: 0, marginLeft: 0, marginRight: 0, duration: 1.1, stagger: 0.15, ease: 'expo.inOut', delay: delay + 0.5 })
      gsap.from('[data-pill] img', { scale: 1.6, duration: 1.6, ease: 'expo.out', delay: delay + 0.5 })
      gsap.from('[data-hero-fade]', { y: 26, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: delay + 0.3 })
      gsap.from('[data-polaroid]', { y: -120, rotate: 18, opacity: 0, duration: 1.3, ease: 'back.out(1.4)', delay: delay + 0.9 })

      // Scroll: copy drifts up and fades; the night photo sinks slower than the page.
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      if (mode === 'night') gsap.to('[data-hero-photos]', { yPercent: 18, ease: 'none', scrollTrigger: st })
      gsap.to('[data-hero-copy]', { yPercent: -12, opacity: mode === 'night' ? 0 : 0.3, ease: 'none', scrollTrigger: { ...st, end: mode === 'night' ? '80% top' : '40% top' } })
      gsap.to('[data-polaroid]', { y: -80, rotate: '+=8', ease: 'none', scrollTrigger: st })
    }, root)
    return () => ctx.revert()
  }, [mode])

  return (
    <section ref={root} className={`relative overflow-hidden ${mode === 'night' ? 'bg-espresso' : 'bg-bg'}`}>
      {mode === 'day' ? <DayHero /> : <NightHero />}
    </section>
  )
}
