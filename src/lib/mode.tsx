import { createContext, useCallback, useContext, useLayoutEffect, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import type { Mode } from '../data'
import { prefersReducedMotion } from './motion'

const KEY = 'ember-mode-v2'
const THEME_COLOR: Record<Mode, string> = { day: '#fbf8f3', night: '#110c09' }

type Ctx = { mode: Mode; setMode: (m: Mode, from?: { x: number; y: number }) => void }
const ModeContext = createContext<Ctx | null>(null)

function stored(): Mode | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'day' || v === 'night' ? v : null
  } catch {
    return null
  }
}

// The site opens in the bright café mood; the kitchen (night) mood is one tap away and remembered.
export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setState] = useState<Mode>(() => stored() ?? 'day')

  useLayoutEffect(() => {
    document.documentElement.dataset.mode = mode
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[mode])
  }, [mode])

  const setMode = useCallback(
    (next: Mode, from?: { x: number; y: number }) => {
      if (next === mode) return
      try {
        localStorage.setItem(KEY, next)
      } catch {
        /* the choice just won't survive a reload */
      }
      const root = document.documentElement
      const apply = () => flushSync(() => setState(next))

      // Where supported, the new mood spreads out of the toggle as a growing circle.
      if (!document.startViewTransition || prefersReducedMotion()) return apply()
      const x = from?.x ?? innerWidth / 2
      const y = from?.y ?? 0
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      root.classList.add('mode-switching')
      const vt = document.startViewTransition(apply)
      vt.ready.then(() =>
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 900, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
        ),
      )
      vt.finished.finally(() => root.classList.remove('mode-switching'))
    },
    [mode],
  )

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used inside ModeProvider')
  return ctx
}
