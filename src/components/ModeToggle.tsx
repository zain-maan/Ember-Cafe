import type { MouseEvent } from 'react'
import { useMode } from '../lib/mode'
import { Moon, Sun } from './icons'

// A pill switch between the café (day) and kitchen (night) moods. The new mood grows out of the knob.
export default function ModeToggle({ className = '' }: { className?: string }) {
  const { mode, setMode } = useMode()
  const night = mode === 'night'

  function flip(e: MouseEvent<HTMLButtonElement>) {
    const knob = e.currentTarget.querySelector('[data-knob]')!.getBoundingClientRect()
    setMode(night ? 'day' : 'night', { x: knob.left + knob.width / 2, y: knob.top + knob.height / 2 })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={night}
      aria-label={night ? 'Switch to café mood (day)' : 'Switch to kitchen mood (night)'}
      onClick={flip}
      className={`group relative flex h-10 w-[4.6rem] shrink-0 items-center rounded-full border border-current/25 p-1 ${className}`}
    >
      <Sun size={14} className="absolute left-2.5 opacity-60" />
      <Moon size={14} className="absolute right-2.5 opacity-60" />
      <span
        data-knob
        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${night ? 'translate-x-[2.1rem]' : ''}`}
      >
        {night ? <Moon size={15} /> : <Sun size={15} />}
      </span>
    </button>
  )
}
