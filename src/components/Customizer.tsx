import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useCart } from '../lib/cart'
import { money } from '../lib/format'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { flyToBag } from './DishCard'
import RealCup, { type CupState } from './RealCup'
import { Check, Plus } from './icons'

const BASES = [
  { id: 'latte', label: 'Latte', price: 5.5, liquid: '#4a2614', milky: '#c4925f' },
  { id: 'matcha', label: 'Matcha', price: 6.8, liquid: '#4f6e1f', milky: '#a5bf6c' },
  { id: 'chai', label: 'Dirty chai', price: 6.2, liquid: '#7a4520', milky: '#d3a46f' },
  { id: 'mocha', label: 'Mocha', price: 6.5, liquid: '#2a140a', milky: '#93603f' },
] as const
const MILKS = [
  { id: 'whole', label: 'Whole', price: 0, art: 1 },
  { id: 'oat', label: 'Oat', price: 0.8, art: 0.85 },
  { id: 'almond', label: 'Almond', price: 0.8, art: 0.65 },
  { id: 'none', label: 'No milk', price: 0, art: 0 },
] as const
const SIZES = [
  { id: 's', label: 'Small', oz: '8 oz', price: -0.5, scale: 0.84 },
  { id: 'r', label: 'Regular', oz: '12 oz', price: 0, scale: 0.94 },
  { id: 'l', label: 'Large', oz: '16 oz', price: 1, scale: 1.04 },
] as const
const SWEET = [
  { id: 'none', label: 'Unsweetened', price: 0, color: '' },
  { id: 'honey', label: 'Burnt honey', price: 0.6, color: '#d8902c' },
  { id: 'vanilla', label: 'Vanilla bean', price: 0.6, color: '#efd9a8' },
  { id: 'maple', label: 'Smoked maple', price: 0.6, color: '#a4521c' },
] as const

type Choice = { base: number; milk: number; size: number; sweet: number; shot: boolean; iced: boolean }

function OptionGroup<T extends { label: string; price: number }>({
  label,
  options,
  value,
  onChange,
  extra,
}: {
  label: string
  options: readonly T[]
  value: number
  onChange: (i: number) => void
  extra?: (o: T) => string
}) {
  return (
    <div>
      <p className="mb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-panel-ink/50">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={value === i}
            onClick={() => onChange(i)}
            className="chip border-panel-ink/20 aria-checked:!border-accent aria-checked:!bg-accent aria-checked:!text-accent-ink hover:border-panel-ink/60"
          >
            {o.label}
            {extra ? <span className="opacity-60">{extra(o)}</span> : o.price > 0 && <span className="opacity-60">+{money(o.price)}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Customizer() {
  const { add } = useCart()
  const [c, setC] = useState<Choice>({ base: 0, milk: 1, size: 1, sweet: 1, shot: false, iced: false })
  const priceEl = useRef<HTMLSpanElement>(null)
  const shown = useRef({ price: 0 })
  const [added, setAdded] = useState(false)

  const base = BASES[c.base]
  const milk = MILKS[c.milk]
  const size = SIZES[c.size]
  const sweet = SWEET[c.sweet]
  const price = base.price + milk.price + size.price + sweet.price + (c.shot ? 0.8 : 0) + (c.iced ? 0.5 : 0)

  const name = useMemo(() => {
    const parts = [size.label, c.iced ? 'iced' : '', milk.id === 'none' ? '' : milk.label.toLowerCase(), base.label.toLowerCase()].filter(Boolean)
    return parts.join(' ').replace(/^./, (s) => s.toUpperCase())
  }, [size, c.iced, milk, base])
  const options = [sweet.id === 'none' ? '' : sweet.label, c.shot ? 'extra shot' : ''].filter(Boolean).join(', ')

  const cup = useMemo<CupState>(
    () => ({ liquid: base.liquid, milky: base.milky, art: milk.art, iced: c.iced, syrup: sweet.color, shot: c.shot, scale: size.scale + 0.04, label: `${name}${options ? ` with ${options}` : ''}` }),
    [base, milk, c.iced, sweet, c.shot, size, name, options],
  )

  // The price counts to its new total.
  useLayoutEffect(() => {
    const d = prefersReducedMotion() ? 0 : 1
    gsap.to(shown.current, {
      price,
      duration: 0.6 * d,
      ease: 'power2.out',
      onUpdate: () => priceEl.current && (priceEl.current.textContent = money(Math.round(shown.current.price * 10) / 10)),
    })
  }, [price])

  function order(e: MouseEvent<HTMLButtonElement>) {
    add({ id: `custom-${c.base}${c.milk}${c.size}${c.sweet}${+c.shot}${+c.iced}`, name, price, img: base.id === 'matcha' ? 'matcha' : c.iced ? 'iced-latte' : 'latte', options: options || undefined })
    flyToBag(e.currentTarget, `/images/${base.id === 'matcha' ? 'matcha' : 'latte'}-640.webp`)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  const set = (patch: Partial<Choice>) => setC((v) => ({ ...v, ...patch }))

  return (
    <div className="bg-panel grain relative overflow-clip rounded-[2.5rem] text-panel-ink">
      <div className="relative z-[2] grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:p-16">
        {/* The drink */}
        <div className="relative flex items-center justify-center lg:sticky lg:top-24 lg:self-start">
          <div aria-hidden="true" className="absolute inset-4 rounded-full bg-[radial-gradient(closest-side,rgba(255,180,110,0.35),transparent)] blur-2xl" />
          <RealCup cup={cup} />
        </div>

        {/* The options */}
        <div className="flex flex-col">
          <p className="eyebrow !text-panel-accent">Build your cup</p>
          <h2 data-split className="mt-4 font-display text-4xl leading-[1.02] sm:text-6xl">
            Your order, <span className="italic-wonk text-panel-accent">exactly</span> how you like it.
          </h2>
          <p className="mt-4 max-w-md text-panel-ink/70">Pick a base, a milk and a little sweetness. Watch the cup change, then send it straight to the bar.</p>

          <div className="mt-8 space-y-6">
            <OptionGroup label="Base" options={BASES} value={c.base} onChange={(i) => set({ base: i })} extra={(o) => money(o.price)} />
            <OptionGroup label="Milk" options={MILKS} value={c.milk} onChange={(i) => set({ milk: i })} />
            <OptionGroup label="Size" options={SIZES} value={c.size} onChange={(i) => set({ size: i })} extra={(o) => o.oz} />
            <OptionGroup label="Sweetness" options={SWEET} value={c.sweet} onChange={(i) => set({ sweet: i })} />
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['shot', 'Extra shot', 0.8],
                  ['iced', 'Make it iced', 0.5],
                ] as const
              ).map(([k, label, p]) => (
                <button
                  key={k}
                  type="button"
                  role="switch"
                  aria-checked={c[k]}
                  onClick={() => set({ [k]: !c[k] })}
                  className="chip border-panel-ink/20 aria-checked:!border-accent aria-checked:!bg-accent aria-checked:!text-accent-ink hover:border-panel-ink/60"
                >
                  {c[k] ? <Check size={14} /> : <Plus size={14} />} {label} <span className="opacity-60">+{money(p)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-panel-ink/15 bg-panel-ink/[0.04] p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex-1">
              <p className="font-display text-xl leading-snug" aria-live="polite">
                {name}
              </p>
              <p className="text-sm text-panel-ink/60">{options || 'Just as it comes'}</p>
            </div>
            <span ref={priceEl} className="font-display text-3xl text-panel-accent">
              {money(price)}
            </span>
            <button type="button" onClick={order} className="btn btn-ink">
              {added ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                <>
                  <Plus size={16} /> Add to order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
