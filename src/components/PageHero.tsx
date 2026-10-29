import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type { ImageName } from '../data'
import { gsap, introDelay, prefersReducedMotion, SplitText } from '../lib/motion'
import { ExpandPhoto, HandNote, Polaroid } from './Handmade'

type Photo = { img: ImageName; caption: string }

type Props = {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  note?: ReactNode
  // Three taped prints beside the title...
  collage?: [Photo, Photo, Photo]
  // ...or one wide photo under it that opens to full width on scroll.
  wide?: Photo
}

// Where each print sits in the collage, and how far it drifts on scroll (deeper = further).
const SPOTS = [
  { pos: 'left-0 top-[6%] z-10', rotate: -7, drift: 60 },
  { pos: 'right-0 top-0 z-20 sm:right-[4%]', rotate: 5, drift: 120 },
  { pos: 'left-[24%] top-[54%] z-30 sm:top-[44%]', rotate: -2, drift: 30 },
]

// The opening block of every inner page. The title rises line by line once the curtain lifts,
// the photos drop onto the page like prints being laid on a table.
export default function PageHero({ eyebrow, title, lead, children, note, collage, wide }: Props) {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const delay = introDelay(0.35)
      const split = SplitText.create('[data-page-title]', { type: 'lines', mask: 'lines' })
      gsap.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.08, ease: 'power4.out', delay })
      gsap.from('[data-page-fade]', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: delay + 0.25 })
      gsap.utils.toArray<HTMLElement>('[data-print]').forEach((el, i) => {
        gsap.from(el, { y: -160, x: i % 2 ? 60 : -60, rotate: i % 2 ? 25 : -25, opacity: 0, duration: 1.3, ease: 'back.out(1.3)', delay: delay + 0.3 + i * 0.14 })
        gsap.to(el, { y: -SPOTS[i].drift, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative overflow-hidden pb-12 pt-32 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
      <div className={`relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 ${collage ? 'items-center lg:grid-cols-[1.15fr_1fr]' : ''}`}>
        <div className={wide ? 'grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end' : ''}>
          <div>
            <p data-page-fade className="eyebrow">
              {eyebrow}
            </p>
            <h1 data-page-title className="mt-5 max-w-5xl font-display text-[clamp(2.8rem,7vw,6.2rem)] font-light leading-[0.98] tracking-tight">
              {title}
            </h1>
            {lead && !wide && (
              <p data-page-fade className="mt-6 max-w-xl text-lg leading-relaxed text-soft">
                {lead}
              </p>
            )}
            {children && <div data-page-fade>{children}</div>}
          </div>
          {wide && (
            <div data-page-fade className="space-y-5">
              {lead && <p className="text-lg leading-relaxed text-soft">{lead}</p>}
              {note && <HandNote arrow="down">{note}</HandNote>}
            </div>
          )}
          {collage && note && (
            <div data-page-fade className="mt-8 hidden lg:block">
              <HandNote arrow="right">{note}</HandNote>
            </div>
          )}
        </div>

        {collage && (
          <div className="relative mx-auto h-[380px] w-full max-w-[520px] sm:h-[460px]">
            {collage.map((p, i) => (
              <div key={p.img} data-print className={`absolute ${SPOTS[i].pos}`}>
                <Polaroid img={p.img} caption={p.caption} rotate={SPOTS[i].rotate} className="w-36 sm:w-56" sizes="224px" />
              </div>
            ))}
          </div>
        )}
      </div>

      {wide && (
        <ExpandPhoto img={wide.img} priority className="mt-12 h-[52svh] min-h-[340px] sm:mt-16 lg:h-[72vh]">
          <p className="absolute bottom-5 left-[7%] font-hand text-2xl text-white drop-shadow-md sm:bottom-8 sm:text-3xl">{wide.caption}</p>
        </ExpandPhoto>
      )}
    </section>
  )
}
