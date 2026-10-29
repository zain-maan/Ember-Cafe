import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ImageName } from '../data'

export type CartLine = {
  key: string // same dish with the same options stacks into one line
  name: string
  price: number
  qty: number
  img: ImageName
  options?: string
}

type Ctx = {
  lines: CartLine[]
  count: number
  subtotal: number
  open: boolean
  setOpen: (o: boolean) => void
  add: (line: Omit<CartLine, 'qty' | 'key'> & { id: string }, qty?: number) => void
  setQty: (key: string, qty: number) => void
  clear: () => void
  // Bumped on every add so the bag icon can bounce.
  pulse: number
}

const KEY = 'ember-cart'
const CartContext = createContext<Ctx | null>(null)

function load(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load)
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* private mode: the bag lasts for this visit only */
    }
  }, [lines])

  const add = useCallback<Ctx['add']>(({ id, ...line }, qty = 1) => {
    const key = `${id}|${line.options ?? ''}`
    setLines((ls) => {
      const hit = ls.find((l) => l.key === key)
      if (hit) return ls.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
      return [...ls, { ...line, key, qty }]
    })
    setPulse((p) => p + 1)
  }, [])

  const setQty = useCallback((key: string, qty: number) => {
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0)
    return { lines, count, subtotal, open, setOpen, add, setQty, clear, pulse }
  }, [lines, open, add, setQty, clear, pulse])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

export const DELIVERY_FEE = 6.5
export const FREE_DELIVERY_FROM = 60
