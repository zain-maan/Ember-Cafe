import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'

// A thin ember-coloured line along the top edge that fills as the page is read.
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
    })
    return () => st.kill()
  }, [])

  return <div ref={bar} aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left scale-x-0 bg-accent" />
}
