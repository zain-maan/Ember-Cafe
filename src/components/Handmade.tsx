import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type { ImageName } from '../data'
import { gsap, prefersReducedMotion } from '../lib/motion'
import Img from './Img'

// Small pieces that make the site feel put together by people, not a template:
// handwritten notes with pen-drawn arrows, taped photos, and pen underlines.

const ARROWS = {
  down: 'M10 6c18 4 30 18 26 40M28 38l8 10 8-12',
  left: 'M58 14C40 4 18 8 8 26M6 12l2 15 14-3',
  right: 'M6 14c18-10 40-6 50 12M50 12l6 15-14-1',
  'down-left': 'M50 6C48 28 34 42 10 46M8 32l1 15 15-2',
}

export function HandNote({ children, arrow, className = '' }: { children: ReactNode; arrow?: keyof typeof ARROWS; className?: string }) {
  const svg = useRef<SVGSVGElement>(null)

  // The pen line draws itself when the note comes into view.
  useLayoutEffect(() => {
    if (!svg.current || prefersReducedMotion()) return
    const path = svg.current.querySelector('path')!
    const len = path.getTotalLength()
    const tween = gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', delay: 0.3, scrollTrigger: { trigger: svg.current, start: 'top 90%', once: true } })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <div className={`font-hand text-2xl leading-tight text-accent ${className}`}>
      <p className="-rotate-2">{children}</p>
      {arrow && (
        <svg ref={svg} width="64" height="56" viewBox="0 0 64 56" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1">
          <path d={ARROWS[arrow]} />
        </svg>
      )}
    </div>
  )
}

// A pen stroke under a word, drawn on when the heading appears.
export function PenUnderline({ children, delay = 0.9 }: { children: ReactNode; delay?: number }) {
  const path = useRef<SVGPathElement>(null)
  useLayoutEffect(() => {
    if (!path.current || prefersReducedMotion()) return
    const len = path.current.getTotalLength()
    const tween = gsap.fromTo(path.current, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out', delay })
    return () => {
      tween.kill()
    }
  }, [delay])
  return (
    <span className="relative inline-block">
      {children}
      <svg aria-hidden="true" viewBox="0 0 300 20" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-[0.08em] left-0 h-[0.22em] w-full overflow-visible text-honey">
        <path ref={path} d="M4 14C60 4 140 6 296 10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

type PolaroidProps = { img: ImageName; caption?: ReactNode; rotate?: number; className?: string; sizes?: string; children?: ReactNode; [data: `data-${string}`]: unknown }

// A photo print with a strip of tape on top and a handwritten caption underneath.
export function Polaroid({ img, caption, rotate = -3, className = '', sizes = '280px', children, ...rest }: PolaroidProps) {
  return (
    <figure {...rest} className={`relative bg-[#fffdf8] p-2.5 pb-3 shadow-[0_18px_40px_-18px_rgba(60,30,10,0.45)] ${className}`} style={{ rotate: `${rotate}deg` }}>
      <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-4deg] bg-[#efe1c6]/80 shadow-sm" />
      <div className="aspect-square overflow-hidden bg-muted">
        <Img name={img} sizes={sizes} className="h-full w-full object-cover" />
      </div>
      {(caption || children) && (
        <figcaption className="flex items-center justify-between gap-2 px-1 pt-2.5 font-hand text-base leading-none text-[#3a2a1e] sm:text-xl">
          <span>{caption}</span>
          {children}
        </figcaption>
      )}
    </figure>
  )
}

// A wide photo that starts as a rounded card inside the page and opens out to the full width
// of the screen as you scroll past it.
export function ExpandPhoto({ img, children, className = '', priority }: { img: ImageName; children?: ReactNode; className?: string; priority?: boolean }) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const st = { trigger: root.current, start: 'top 85%', end: 'top 15%', scrub: 0.6 }
      gsap.fromTo('[data-expand-frame]', { clipPath: 'inset(0% 5% 0% 5% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: st })
      gsap.fromTo('[data-expand-frame] img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { ...st, end: 'bottom top' } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className={`relative ${className}`}>
      <div data-expand-frame className="relative h-full w-full overflow-hidden" style={{ clipPath: 'inset(0% 5% 0% 5% round 32px)' }}>
        <Img name={img} priority={priority} sizes="100vw" className="h-full w-full object-cover" />
      </div>
      {children}
    </div>
  )
}
