import { useLayoutEffect, type RefObject } from 'react'
import { gsap, prefersReducedMotion, SplitText } from '../lib/motion'

// Scroll animations for everything inside `scope`, driven by data attributes:
//   data-reveal="0.1"   fade and lift in (value = delay in seconds)
//   data-split          heading rises in line by line from behind a mask
//   data-reveal-img     curtain wipe on a wrapper, the photo inside settles from a zoom
//   data-count="4.9"    number counts up when it scrolls into view
//   data-speed="0.15"   parallax drift while scrolling (positive = slower than the page)
//   data-words          paragraph words brighten one by one, tied to the scroll
//   data-card="0.1"     phones and tablets: the card flips up into place in 3D (value = delay)
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const trigger = (el: Element, start = 'top 88%') => ({ trigger: el, start, once: true })

      const small = window.matchMedia('(max-width: 1023px)').matches

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        if (small && el.hasAttribute('data-card')) return // the 3D card entrance below handles it
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: Number(el.dataset.reveal) || 0,
          scrollTrigger: trigger(el),
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 1.15,
              ease: 'power4.out',
              stagger: 0.09,
              delay: Number(el.dataset.split) || 0,
              scrollTrigger: trigger(el, 'top 90%'),
            }),
        })
      })

      // Words light up one by one as the paragraph scrolls through the middle of the screen.
      gsap.utils.toArray<HTMLElement>('[data-words]').forEach((el) => {
        const split = SplitText.create(el, { type: 'words' })
        gsap.fromTo(
          split.words,
          { opacity: 0.15 },
          { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
        const tl = gsap.timeline({ scrollTrigger: trigger(el, 'top 85%'), delay: Number(el.dataset.revealImg) || 0 })
        tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
        const img = el.querySelector('img')
        if (img) tl.from(img, { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.2)
      })

      // Cards tip up from below like they are being dealt onto the table. Desktop keeps its own reveals.
      if (small) {
        gsap.utils.toArray<HTMLElement>('[data-card]').forEach((el) => {
          gsap.from(el, {
            rotateX: 28,
            y: 60,
            scale: 0.9,
            opacity: 0,
            transformPerspective: 1000,
            transformOrigin: '50% 100%',
            duration: 1.1,
            ease: 'back.out(1.3)',
            delay: Number(el.dataset.card) || 0,
            scrollTrigger: trigger(el, 'top bottom-=40'),
          })
        })
      }

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count)
        const decimals = (el.dataset.count!.split('.')[1] ?? '').length
        const counter = { v: 0 }
        gsap.to(counter, {
          v: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: trigger(el),
          onUpdate: () => {
            el.textContent = counter.v.toFixed(decimals)
          },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
        const speed = Number(el.dataset.speed)
        gsap.fromTo(
          el,
          { yPercent: -speed * 100 },
          {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
