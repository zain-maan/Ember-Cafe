import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap, holdForIntro, prefersReducedMotion, setScrollLocked } from '../lib/motion'

const INTRO_MS = 2300

function seenIntro() {
  try {
    return sessionStorage.getItem('ember-intro') === '1'
  } catch {
    return false
  }
}

// First visit in a session: a short branded intro with a loading counter that lifts away.
// Every route change after that: the same panel sweeps up to reveal the new page.
export default function Curtain() {
  const { pathname } = useLocation()
  const panel = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const lastPath = useRef<string | null>(null)
  const [intro] = useState(() => !prefersReducedMotion() && !seenIntro())

  useLayoutEffect(() => {
    const el = panel.current!
    if (prefersReducedMotion()) {
      gsap.set(el, { display: 'none' })
      return
    }

    // Same path as last run means first mount (React StrictMode runs effects twice in dev).
    const firstMount = lastPath.current === null || lastPath.current === pathname
    lastPath.current = pathname

    if (firstMount) {
      if (!intro) {
        gsap.set(el, { display: 'none' })
        return
      }
      try {
        sessionStorage.setItem('ember-intro', '1')
      } catch {
        /* private mode: the intro simply plays again next time */
      }
      holdForIntro(INTRO_MS)
      setScrollLocked(true)
      const counter = { v: 0 }
      const show = () => count.current && (count.current.textContent = String(Math.round(counter.v)))
      gsap.set(el, { display: 'flex', yPercent: 0, borderRadius: 0 })
      gsap.set('[data-intro-content]', { opacity: 1, yPercent: 0 })
      gsap.set('[data-intro-bar]', { scaleX: 0 })
      // Count to 85% while the hero photo downloads, then finish only once it's ready (or after a
      // short timeout on slow connections), so the curtain never lifts onto a blank hero.
      const loading = gsap.timeline()
      loading
        .fromTo('[data-intro-cup]', { strokeDashoffset: 120 }, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' })
        .fromTo('[data-intro-steam]', { strokeDashoffset: 40, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power2.out' }, 0.5)
        .fromTo('[data-intro-letter]', { yPercent: 120 }, { yPercent: 0, duration: 0.9, stagger: 0.05, ease: 'power4.out' }, 0.2)
        .to(counter, { v: 85, duration: 1.1, ease: 'power2.out', onUpdate: show }, 0.1)
        .to('[data-intro-bar]', { scaleX: 0.85, duration: 1.1, ease: 'power2.out' }, 0.1)
      let finish: gsap.core.Timeline | null = null
      let done = false
      const lift = () => {
        if (done) return
        done = true
        finish = gsap.timeline({ delay: Math.max(0, 1.2 - loading.time()), onComplete: () => setScrollLocked(false) })
        finish
          .to(counter, { v: 100, duration: 0.35, ease: 'power1.out', onUpdate: show })
          .to('[data-intro-bar]', { scaleX: 1, duration: 0.35 }, 0)
          .to('[data-intro-content]', { yPercent: -40, opacity: 0, duration: 0.6, ease: 'power3.in' }, 0.3)
          .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 0.4)
          .to(el, { borderBottomLeftRadius: '50% 12vh', borderBottomRightRadius: '50% 12vh', duration: 0.5, ease: 'power2.in' }, 0.4)
          .set(el, { display: 'none' })
      }
      const hero = document.querySelector<HTMLImageElement>('[data-hero-img] img, [data-expand-frame] img')
      if (!hero || (hero.complete && hero.naturalWidth)) lift()
      else hero.addEventListener('load', lift, { once: true })
      const timeout = window.setTimeout(lift, 2500)
      return () => {
        window.clearTimeout(timeout)
        hero?.removeEventListener('load', lift)
        loading.kill()
        finish?.kill()
        setScrollLocked(false)
      }
    }

    // Route change: sweep the panel up from a covered state.
    const tl = gsap.timeline()
    tl.set(el, { display: 'flex', yPercent: 0, borderRadius: 0 })
      .set('[data-intro-content]', { opacity: 0 })
      .to(el, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.05 })
      .to(el, { borderBottomLeftRadius: '50% 10vh', borderBottomRightRadius: '50% 10vh', duration: 0.45, ease: 'power2.in' }, 0.05)
      .set(el, { display: 'none' })
    return () => {
      tl.progress(1).kill()
    }
  }, [pathname, intro])

  return (
    <div ref={panel} aria-hidden="true" className="bg-panel grain fixed inset-0 z-[60] flex items-center justify-center text-panel-ink">
      <div data-intro-content className="flex w-64 flex-col items-center">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mb-5 text-panel-accent">
          <path data-intro-cup pathLength={120} strokeDasharray="120" d="M12 30h34v8a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14zM46 33h3a5 5 0 0 1 0 10h-4M8 56h44" />
          {[22, 29, 36].map((x) => (
            <path key={x} data-intro-steam pathLength={40} strokeDasharray="40" d={`M${x} 24c-3-3 3-6 0-9s3-6 0-9`} />
          ))}
        </svg>
        <p className="flex overflow-hidden font-display text-5xl tracking-[0.2em]">
          {'EMBER'.split('').map((ch, i) => (
            <span key={i} data-intro-letter className="inline-block">
              {ch}
            </span>
          ))}
        </p>
        <div className="mt-6 h-px w-full overflow-hidden bg-white/15">
          <div data-intro-bar className="h-full origin-left bg-gradient-to-r from-[#f1bf69] to-[#ff8a3d]" />
        </div>
        <p className="mt-3 flex w-full justify-between text-[0.65rem] uppercase tracking-[0.3em] text-panel-ink/60">
          <span>Grinding beans</span>
          <span>
            <span ref={count}>0</span>%
          </span>
        </p>
      </div>
    </div>
  )
}
