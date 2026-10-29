import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Coffee, Flame, Leaf } from '../components/icons'
import Img from '../components/Img'
import PageHero from '../components/PageHero'
import { BRAND, TEAM, TIMELINE } from '../data'
import { useReveal } from '../hooks/useReveal'
import { gsap, prefersReducedMotion } from '../lib/motion'

const VALUES = [
  { icon: Coffee, title: 'Roast it ourselves', text: 'Green beans from three farms we visit, roasted in small batches every Tuesday in the back room.' },
  { icon: Leaf, title: 'Six farms, one hour away', text: 'Eggs, greens, dairy and lamb from growers within an hour of Fitzroy. The menu changes when they say so.' },
  { icon: Flame, title: 'Cook with real fire', text: 'No gas on the grill. Ironbark and binchotan give dinner its smoke, and the leftover embers bake our bread.' },
]

// Desktop: the timeline pins and scrolls sideways, with a progress line that fills as you go.
function Timeline() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      const distance = () => track.current!.scrollWidth - window.innerWidth
      const st = { trigger: section.current, start: 'top top', end: () => `+=${distance()}`, scrub: 0.8, pin: true, invalidateOnRefresh: true }
      gsap.to(track.current, { x: () => -distance(), ease: 'none', scrollTrigger: st })
      gsap.fromTo('[data-progress]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { ...st, pin: false } })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={section} className="bg-panel grain relative overflow-hidden py-20 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0">
      <div className="relative z-[2] mx-auto mb-10 w-full max-w-7xl px-4 sm:px-6">
        <p className="eyebrow !text-panel-accent">Nine years on Gertrude Street</p>
        <div className="mt-6 hidden h-px bg-panel-ink/15 lg:block">
          <div data-progress className="h-full origin-left bg-panel-accent" />
        </div>
      </div>
      <div ref={track} className="no-scrollbar relative z-[2] flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 sm:px-6 lg:snap-none lg:gap-10 lg:overflow-visible lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-[20vw]">
        {TIMELINE.map((t) => (
          <article key={t.year} className="w-[80vw] shrink-0 snap-start sm:w-[420px] lg:w-[460px]">
            <p className="font-display text-7xl text-panel-accent sm:text-8xl">{t.year}</p>
            <div className="mt-5 aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <Img name={t.img} sizes="460px" className="h-full w-full object-cover" />
            </div>
            <h3 className="mt-5 font-display text-3xl">{t.title}</h3>
            <p className="mt-2 max-w-sm text-panel-ink/70">{t.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function About() {
  const page = useRef<HTMLDivElement>(null)
  useReveal(page)

  return (
    <div ref={page}>
      <PageHero
        eyebrow="Our story"
        title={
          <>
            A neighbourhood café that <span className="italic-wonk text-accent">learned to cook with fire.</span>
          </>
        }
        lead={`${BRAND.name} began as six seats and one grinder. It grew into a roastery, a bakery and a dinner kitchen, all still under one roof on Gertrude Street.`}
        note={<>most of these people are regulars</>}
        wide={{ img: 'busy-cafe', caption: 'a Tuesday, around 10 am' }}
      />

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <div key={v.title} data-reveal={i * 0.1} className="card p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-ink">
                <v.icon size={22} />
              </span>
              <h2 className="mt-6 font-display text-2xl">{v.title}</h2>
              <p className="mt-3 leading-relaxed text-soft">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Timeline />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <p data-reveal className="eyebrow">
          The people
        </p>
        <h2 data-split className="mt-5 max-w-3xl font-display text-5xl leading-[1] sm:text-6xl">
          Small team, <span className="italic-wonk text-accent">very early starts.</span>
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {TEAM.map((m, i) => (
            <article key={m.name} data-reveal={i * 0.1} className="group">
              <div className="aspect-[4/5] overflow-hidden rounded-[1.75rem]">
                <Img name={m.img} sizes="(min-width: 768px) 30vw, 100vw" className="h-full w-full object-cover grayscale-[40%] transition-[transform,filter] duration-700 group-hover:scale-105 group-hover:grayscale-0" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-accent">{m.role}</p>
              <h3 className="mt-1 font-display text-2xl">{m.name}</h3>
              <p className="mt-2 text-soft">{m.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2.5rem] bg-accent p-10 text-accent-ink sm:p-16 lg:flex-row lg:items-end">
          <h2 data-split className="max-w-2xl font-display text-5xl leading-[1] sm:text-6xl">
            The kettle is on. The grill is warming up.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/reserve" className="btn btn-ink">
              Book a table <ArrowRight size={16} />
            </Link>
            <Link to="/menu" className="btn btn-ghost">
              See the menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
