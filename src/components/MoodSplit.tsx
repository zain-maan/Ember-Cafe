import type { MouseEvent } from 'react'
import { BRAND, type ImageName, type Mode } from '../data'
import { hourLabel } from '../lib/format'
import { useMode } from '../lib/mode'
import { ArrowRight, Moon, Sun } from './icons'
import Img from './Img'

const PANELS: { mode: Mode; title: string; hours: string; text: string; img: ImageName; points: string[] }[] = [
  {
    mode: 'day',
    title: 'The café',
    hours: `7 AM to ${hourLabel(BRAND.dinnerFrom - 1)}`,
    text: 'House-roasted espresso, laminated pastry and a brunch menu built for lingering.',
    img: 'coffee-bar',
    points: ['Single-origin espresso', 'Pastry from 6:30 am', 'Laptop-friendly mornings'],
  },
  {
    mode: 'night',
    title: 'The kitchen',
    hours: `${hourLabel(BRAND.dinnerFrom)} till late`,
    text: 'The lights go low and the ironbark grill takes over. Share plates, natural wine, coffee cocktails.',
    img: 'dining-room',
    points: ['Ironbark & charcoal grill', 'Natural wine list', 'Groups up to 20'],
  },
]

// Two panels, one for each mood. The hovered one opens wide; clicking it switches the whole site.
export default function MoodSplit() {
  const { mode, setMode } = useMode()

  function pick(m: Mode, e: MouseEvent<HTMLButtonElement>) {
    setMode(m, { x: e.clientX, y: e.clientY })
  }

  return (
    <div className="flex flex-col gap-4 lg:h-[620px] lg:flex-row">
      {PANELS.map((p) => {
        const active = mode === p.mode
        return (
          <button
            key={p.mode}
            type="button"
            onClick={(e) => pick(p.mode, e)}
            aria-pressed={active}
            {...(!active && { 'data-cursor': p.mode === 'day' ? 'Day' : 'Night' })}
            className={`group relative isolate flex min-h-[440px] overflow-hidden rounded-[2rem] text-left text-cream transition-[flex-grow] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] lg:min-h-0 ${
              active ? 'lg:grow-[1.6]' : 'lg:grow hover:lg:grow-[1.3]'
            } lg:basis-0`}
          >
            <Img name={p.img} sizes="(min-width: 1024px) 60vw, 100vw" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            <div className="flex w-full flex-col p-7 sm:p-10">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-xs font-semibold backdrop-blur">
                  {p.mode === 'day' ? <Sun size={14} /> : <Moon size={14} />}
                  {p.hours}
                </span>
                {active && <span className="rounded-full bg-accent px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-ink">You are here</span>}
              </div>
              <div className="mt-auto">
                <h3 className="font-display text-5xl sm:text-6xl">
                  {p.title.split(' ')[0]} <span className="italic-wonk text-honey">{p.title.split(' ')[1]}</span>
                </h3>
                <p className="mt-3 max-w-md text-cream/80">{p.text}</p>
                <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                  {p.points.map((pt) => (
                    <li key={pt} className="rounded-full border border-cream/25 px-3 py-1.5">
                      {pt}
                    </li>
                  ))}
                </ul>
                {!active && (
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-honey">
                    Switch to the {p.mode === 'day' ? 'café' : 'kitchen'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
