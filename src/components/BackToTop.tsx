import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, scrollToTop } from '../lib/motion'
import { ArrowDown } from './icons'

const R = 22
const C = 2 * Math.PI * R

// Appears after the first screen: a ring around it fills as the page is read, and a tap glides back up.
export default function BackToTop() {
  const ring = useRef<SVGCircleElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(ring.current, { strokeDashoffset: C * (1 - self.progress) })
        setShow(self.scroll() > window.innerHeight)
      },
    })
    return () => st.kill()
  }, [])

  return (
    <button
      type="button"
      onClick={() => scrollToTop(true)}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-[5.25rem] right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink shadow-soft ring-1 ring-line transition-[opacity,transform] duration-500 hover:-translate-y-1 ${
        show ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle ref={ring} cx="24" cy="24" r={R} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <ArrowDown size={18} className="rotate-180" />
    </button>
  )
}
