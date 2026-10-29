import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, prefersReducedMotion } from '../lib/motion'

// Desktop only, alongside the normal pointer: a faint ring that eases after the mouse and
// opens into a small label over anything marked data-cursor="View".
// Elements marked data-magnetic lean gently towards the pointer.
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const { pathname } = useLocation()

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine || prefersReducedMotion()) return

    const x = gsap.quickTo(ring.current, 'x', { duration: 0.6, ease: 'power3' })
    const y = gsap.quickTo(ring.current, 'y', { duration: 0.6, ease: 'power3' })
    let magnet: HTMLElement | null = null

    const move = (e: PointerEvent) => {
      gsap.to(ring.current, { opacity: 1, duration: 0.4, overwrite: 'auto' })
      x(e.clientX)
      y(e.clientY)
      if (magnet) {
        const r = magnet.getBoundingClientRect()
        gsap.to(magnet, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.15,
          y: (e.clientY - (r.top + r.height / 2)) * 0.2,
          duration: 0.5,
          ease: 'power3',
        })
      }
    }

    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      const labelled = t.closest<HTMLElement>('[data-cursor]')
      setLabel(labelled?.dataset.cursor ?? '')
      gsap.to(ring.current, {
        width: labelled ? 76 : 26,
        height: labelled ? 76 : 26,
        backgroundColor: labelled ? 'rgba(26, 17, 11, 0.6)' : 'rgba(255, 255, 255, 0)',
        borderColor: labelled ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 138, 61, 0.5)',
        duration: 0.45,
        ease: 'power3.out',
      })

      const m = t.closest<HTMLElement>('[data-magnetic]')
      if (m !== magnet) {
        if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' })
        magnet = m
      }
    }

    const leave = () => gsap.to(ring.current, { opacity: 0, duration: 0.3 })

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.removeEventListener('pointerleave', leave)
    }
  }, [])

  // A new page may render under a still pointer: reset the hover state.
  useEffect(() => {
    setLabel('')
    gsap.to(ring.current, { width: 26, height: 26, backgroundColor: 'rgba(255, 255, 255, 0)', duration: 0.3 })
  }, [pathname])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] hidden [@media(pointer:fine)]:block">
      <div
        ref={ring}
        className="absolute left-0 top-0 flex h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 opacity-0 backdrop-blur-[2px]"
      >
        <span className={`text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white transition-opacity duration-300 ${label ? 'opacity-100' : 'opacity-0'}`}>
          {label}
        </span>
      </div>
    </div>
  )
}
