import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

export type CupState = {
  liquid: string // the coffee or tea itself
  milky: string // the colour once milk is folded in
  art: number // 0 = no milk (bare crema), up to 1 = full rosetta
  iced: boolean
  syrup: string // '' for none
  shot: boolean
  scale: number
  label: string
}

const CX = 200
const CY = 196

// A cup seen from above, the way it lands on the table: saucer, spoon, ceramic cup with a handle,
// and a drink with crema, microfoam and latte art. Iced drinks swap to a glass on a cork coaster.
// Every change "re-pours": the art swirls in and the colours blend to the new drink.
export default function RealCup({ cup }: { cup: CupState }) {
  const svg = useRef<SVGSVGElement>(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    const q = gsap.utils.selector(svg)
    const d = prefersReducedMotion() ? 0 : 1
    const pour = !first.current && d > 0
    first.current = false

    gsap.to(q('[data-cup]'), { scale: cup.scale, svgOrigin: `${CX} ${CY}`, duration: 0.9 * d, ease: 'elastic.out(1, 0.6)' })
    gsap.to(q('[data-ceramic]'), { opacity: cup.iced ? 0 : 1, duration: 0.6 * d })
    gsap.to(q('[data-glass]'), { opacity: cup.iced ? 1 : 0, duration: 0.6 * d })
    gsap.to(q('[data-saucer]'), { opacity: cup.iced ? 0 : 1, duration: 0.6 * d })
    gsap.to(q('[data-coaster]'), { opacity: cup.iced ? 1 : 0, duration: 0.6 * d })

    // Surface colours: milky centre fading to the darker drink at the edge (crema ring).
    const centre = cup.art > 0 ? cup.milky : cup.iced ? cup.milky : '#b4702f'
    gsap.to(q('[data-liq-a]'), { stopColor: centre, duration: 0.9 * d })
    gsap.to(q('[data-liq-b]'), { stopColor: cup.art > 0 ? cup.milky : '#8a4a1d', duration: 0.9 * d })
    gsap.to(q('[data-liq-c]'), { stopColor: cup.liquid, duration: 0.9 * d })
    gsap.to(q('[data-crema]'), { opacity: cup.shot ? 0.9 : 0.45, strokeWidth: cup.shot ? 12 : 6, duration: 0.6 * d })

    const art = cup.iced ? 0 : cup.art
    gsap.to(q('[data-art]'), { opacity: art ? 0.96 : 0, duration: 0.6 * d })
    gsap.to(q('[data-art-shape]'), { scale: 0.55 + art * 0.45, svgOrigin: `${CX} ${CY}`, duration: 0.9 * d, ease: 'power3.out' })
    if (pour) gsap.fromTo(q('[data-art]'), { rotate: -200, svgOrigin: `${CX} ${CY}` }, { rotate: 0, svgOrigin: `${CX} ${CY}`, duration: 1.4, ease: 'expo.out' })

    gsap.to(q('[data-marble]'), { opacity: cup.iced && cup.art > 0 ? 0.85 : 0, duration: 0.6 * d })
    gsap.to(q('[data-ice]'), { opacity: cup.iced ? 1 : 0, scale: cup.iced ? 1 : 0.4, svgOrigin: `${CX} ${CY}`, stagger: 0.06, duration: 0.7 * d, ease: 'back.out(2)' })
    gsap.to(q('[data-syrup]'), { opacity: cup.syrup ? 0.6 : 0, stroke: cup.syrup || '#000', duration: 0.6 * d })
    gsap.to(q('[data-steam]'), { opacity: cup.iced ? 0 : 1, duration: 0.5 * d })
  }, [cup])

  return (
    <svg ref={svg} viewBox="0 0 400 400" className="relative h-auto w-full max-w-[460px]" role="img" aria-label={cup.label}>
      <defs>
        <filter id="cup-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id="cup-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        {/* Fine bubbles in the microfoam */}
        <filter id="foam-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.88  0 0 0 -2.2 1.35" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="art-edge" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id="cork-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="9" />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.28  0 0 0 0 0.14  0 0 0 -1.6 1.1" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="saucer" cx="0.42" cy="0.4" r="0.65">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.62" stopColor="#f3eee7" />
          <stop offset="0.86" stopColor="#e2d9cc" />
          <stop offset="1" stopColor="#cfc4b4" />
        </radialGradient>
        <radialGradient id="ceramic" cx="0.38" cy="0.34" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f1ebe2" />
          <stop offset="1" stopColor="#d6ccbe" />
        </radialGradient>
        <radialGradient id="inner-wall" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.82" stopColor="#e9e2d8" />
          <stop offset="1" stopColor="#b9ad9c" />
        </radialGradient>
        <radialGradient id="liquid" cx="0.47" cy="0.47" r="0.55">
          <stop data-liq-a offset="0" stopColor="#c99c6e" />
          <stop data-liq-b offset="0.55" stopColor="#c99c6e" />
          <stop data-liq-c offset="1" stopColor="#4a2a17" />
        </radialGradient>
        <linearGradient id="spoon" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f4f4f2" />
          <stop offset="0.45" stopColor="#a9abad" />
          <stop offset="0.7" stopColor="#e8e9ea" />
          <stop offset="1" stopColor="#8d9093" />
        </linearGradient>
        <radialGradient id="glass" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.8" stopColor="#e6f1f5" stopOpacity="0.25" />
          <stop offset="1" stopColor="#c9dbe2" stopOpacity="0.6" />
        </radialGradient>
        <clipPath id="liquid-clip">
          <circle cx={CX} cy={CY} r="96" />
        </clipPath>
      </defs>

      {/* Scattered beans on the table */}
      {[
        [52, 330, 30],
        [78, 352, -20],
        [346, 78, 60],
        [362, 108, 10],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <ellipse rx="13" ry="9" fill="#3b2012" />
          <ellipse rx="13" ry="9" fill="url(#ceramic)" opacity="0.08" />
          <path d="M-11 0c6-4 15 3 22 0" stroke="#1b0d06" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* Saucer and spoon (hot drinks) */}
      <g data-saucer>
        <ellipse cx={CX + 6} cy={CY + 14} rx="168" ry="164" fill="#5a3a22" opacity="0.28" filter="url(#cup-shadow)" />
        <circle cx={CX} cy={CY} r="162" fill="url(#saucer)" />
        <circle cx={CX} cy={CY} r="150" fill="none" stroke="#d8cebf" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r="128" fill="none" stroke="#e7dfd3" strokeWidth="6" />
        <path d="M74 132a150 150 0 0 1 96-82" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.9" fill="none" />
        <g transform="rotate(-38 200 196)">
          <ellipse cx="96" cy="312" rx="10" ry="6" fill="#000" opacity="0.15" filter="url(#cup-soft)" />
          <path d="M90 214c-6 0-10 4-10 12l4 70c0 6 4 10 8 10s8-4 8-10l4-70c0-8-4-12-10-12z" fill="url(#spoon)" transform="translate(0 4)" />
          <ellipse cx="92" cy="322" rx="15" ry="22" fill="url(#spoon)" />
          <ellipse cx="88" cy="316" rx="5" ry="10" fill="#fff" opacity="0.6" />
        </g>
      </g>

      {/* Cork coaster (iced drinks) */}
      <g data-coaster opacity="0">
        <ellipse cx={CX + 6} cy={CY + 14} rx="150" ry="146" fill="#3a2414" opacity="0.25" filter="url(#cup-shadow)" />
        <circle cx={CX} cy={CY} r="146" fill="#c9a074" />
        <circle cx={CX} cy={CY} r="146" fill="#c9a074" filter="url(#cork-grain)" />
        <circle cx={CX} cy={CY} r="138" fill="none" stroke="#a87e54" strokeWidth="1.5" strokeDasharray="2 5" />
      </g>

      <g data-cup>
        {/* Cup shadow and handle */}
        <ellipse cx={CX + 10} cy={CY + 12} rx="124" ry="122" fill="#3a2414" opacity="0.32" filter="url(#cup-soft)" />
        <g data-ceramic>
          <rect x="300" y="174" width="72" height="44" rx="22" fill="#3a2414" opacity="0.2" filter="url(#cup-soft)" transform="translate(4 8)" />
          <rect x="300" y="174" width="72" height="44" rx="22" fill="url(#ceramic)" />
          <rect x="318" y="186" width="40" height="20" rx="10" fill="#cdbfad" />
          <circle cx={CX} cy={CY} r="120" fill="url(#ceramic)" />
          <circle cx={CX} cy={CY} r="106" fill="url(#inner-wall)" />
          <path d="M112 140a104 104 0 0 1 70-50" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.95" fill="none" />
        </g>
        <g data-glass opacity="0">
          <circle cx={CX} cy={CY} r="118" fill="url(#glass)" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="3" />
          <circle cx={CX} cy={CY} r="106" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
          {/* Condensation */}
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2 + (i % 3) * 0.1
            const r = 112 + (i % 2) * 3
            return <circle key={i} cx={CX + Math.cos(a) * r} cy={CY + Math.sin(a) * r} r={1.4 + (i % 3) * 0.6} fill="#fff" opacity="0.75" />
          })}
        </g>

        {/* The drink */}
        <g clipPath="url(#liquid-clip)">
          <circle cx={CX} cy={CY} r="96" fill="url(#liquid)" />
          <circle cx={CX} cy={CY} r="96" fill="#fff" filter="url(#foam-grain)" opacity="0.22" />
          <circle data-crema cx={CX} cy={CY} r="93" fill="none" stroke="#2b1408" strokeWidth="6" opacity="0.45" filter="url(#cup-soft)" />

          {/* Heart latte art with a soft, poured edge */}
          <g data-art>
            <g data-art-shape>
              <path
                d="M200 252C154 222 136 196 146 172c9-22 38-24 54 0 16-24 45-22 54 0 10 24-8 50-54 80z"
                fill="#fbf2e4"
                filter="url(#art-edge)"
              />
              <path d="M200 176c2 26 1 52 0 74" stroke="#d9b48c" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55" />
              <ellipse cx="176" cy="180" rx="12" ry="7" fill="#fff" opacity="0.5" transform="rotate(-30 176 180)" />
            </g>
          </g>

          {/* Iced: milk marbling through the drink */}
          <path data-marble d="M140 150c40-30 90 10 70 40s-80 10-60 50 100 20 110-20" stroke="#f3e6d2" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0" filter="url(#cup-soft)" />

          {/* Syrup drizzle */}
          <path data-syrup d="M124 150l30 18 24-20 26 22 26-20 28 18M120 236l30-16 26 20 24-18 26 20 30-16" stroke="#d8902c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0" />

          {/* Ice cubes */}
          {[
            [150, 150, 12],
            [222, 140, -18],
            [236, 214, 24],
            [160, 226, -8],
          ].map(([x, y, r], i) => (
            <g key={i} data-ice opacity="0" transform={`rotate(${r} ${x} ${y})`}>
              <rect x={x - 26} y={y - 26} width="52" height="52" rx="12" fill="#ffffff" fillOpacity="0.32" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2" />
              <path d={`M${x - 16} ${y - 14}l18-4`} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            </g>
          ))}

          {/* Light from the window */}
          <ellipse cx="160" cy="146" rx="38" ry="18" fill="#fff" opacity="0.18" transform="rotate(-30 160 146)" filter="url(#cup-soft)" />
        </g>
      </g>

      {/* Steam */}
      <g data-steam filter="url(#cup-soft)" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" fill="none" opacity="1">
        {[170, 205, 238].map((x, i) => (
          <path key={x} d={`M${x} 190c-18-26 18-40 0-66s16-40 0-62`} className="cup-steam" style={{ animationDelay: `${i * 1.1}s` }} />
        ))}
      </g>
    </svg>
  )
}
