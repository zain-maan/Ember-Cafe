import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import DishCard from '../components/DishCard'
import { ArrowRight, Bike, Check, CheckCircle2, Clock, Minus, Plus, Store } from '../components/icons'
import Img from '../components/Img'
import PageHero from '../components/PageHero'
import { BRAND, dishById, HOURS, SIGNATURES } from '../data'
import { DELIVERY_FEE, FREE_DELIVERY_FROM, useCart, type CartLine } from '../lib/cart'
import { hourLabel, money } from '../lib/format'
import { useMode } from '../lib/mode'
import { gsap, prefersReducedMotion, scrollToTop } from '../lib/motion'

type Method = 'pickup' | 'delivery'
const TIPS = [0, 10, 15, 20]
const PROMO = { code: 'EMBER10', off: 0.1 }

// The next few 15-minute slots that fall inside today's opening hours.
function slots(method: Method) {
  const now = new Date()
  const { close } = HOURS[now.getDay()]
  const lead = method === 'pickup' ? 20 : 45
  const first = new Date(now.getTime() + lead * 60_000)
  first.setMinutes(Math.ceil(first.getMinutes() / 15) * 15, 0, 0)
  const out: string[] = []
  for (let t = first; out.length < 8; t = new Date(t.getTime() + 15 * 60_000)) {
    const h = t.getHours() + t.getMinutes() / 60
    if (t.getDate() !== now.getDate() || h > close - 0.25) break
    out.push(hourLabel(h))
  }
  return out
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="card p-6 sm:p-8">
      <legend className="sr-only">{title}</legend>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-bg">{n}</span>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      {children}
    </fieldset>
  )
}

type Placed = { id: string; method: Method; when: string; name: string; lines: CartLine[]; total: number }

export default function Order() {
  const { lines, setQty, subtotal, clear } = useCart()
  const { mode } = useMode()
  const [method, setMethod] = useState<Method>('pickup')
  const [when, setWhen] = useState('asap')
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' })
  const [tip, setTip] = useState(10)
  const [pay, setPay] = useState<'store' | 'card'>('store')
  const [promo, setPromo] = useState('')
  const [promoOn, setPromoOn] = useState(false)
  const [tried, setTried] = useState(false)
  const [placed, setPlaced] = useState<Placed | null>(null)

  const times = useMemo(() => slots(method), [method])
  const discount = promoOn ? subtotal * PROMO.off : 0
  const delivery = method === 'delivery' && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0
  const tipAmount = ((subtotal - discount) * tip) / 100
  const total = subtotal - discount + delivery + tipAmount

  const errors = {
    name: form.name.trim().length < 2 ? 'Tell us who to call out' : '',
    phone: form.phone.replace(/\D/g, '').length < 8 ? 'A mobile number, in case we need you' : '',
    address: method === 'delivery' && form.address.trim().length < 6 ? 'Where should the rider go?' : '',
  }
  const valid = !errors.name && !errors.phone && !errors.address
  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value })),
    'aria-invalid': tried && !!errors[k as keyof typeof errors],
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    setTried(true)
    if (!valid || !lines.length) return
    const id = `E-${Math.floor(1000 + Math.random() * 9000)}`
    setPlaced({ id, method, when: when === 'asap' ? (method === 'pickup' ? 'in about 15 minutes' : 'in about 35 minutes') : `at ${when}`, name: form.name.trim().split(' ')[0], lines, total })
    clear()
    scrollToTop()
  }

  if (placed) return <Confirmation order={placed} />

  if (!lines.length) {
    const picks = SIGNATURES[mode].slice(0, 3).map((id) => dishById(id)!)
    return (
      <>
        <PageHero
          eyebrow="Order online"
          title={
            <>
              Your bag is <span className="italic-wonk text-accent">empty.</span>
            </>
          }
          lead="Pickup in about 15 minutes, or delivery within 4 km in about 35."
          note={<>still warm when you get it</>}
          collage={[
            { img: 'bakery-case', caption: 'out of the oven 6:30' },
            { img: 'iced-latte', caption: 'ready in 15' },
            { img: 'croissant-table', caption: 'take it home' },
          ]}
        >
          <ol className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm">
            {['Pick from the menu', 'Pay now or at the counter', 'Collect in ~15 min'].map((s, i) => (
              <li key={s} className="border-t-2 border-accent pt-3">
                <span className="font-display text-2xl text-accent">0{i + 1}</span>
                <p className="mt-1 font-semibold leading-snug">{s}</p>
              </li>
            ))}
          </ol>
        </PageHero>
        <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </div>
          <Link to="/menu" className="btn btn-ink mt-12">
            See the full menu <ArrowRight size={16} />
          </Link>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title={
          <>
            Nearly there, <span className="italic-wonk text-accent">almost warm.</span>
          </>
        }
      />
      <form onSubmit={submit} noValidate className="mx-auto grid max-w-7xl gap-8 px-4 pb-28 sm:px-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Step n={1} title="Pickup or delivery?">
            <div role="radiogroup" aria-label="Pickup or delivery" className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['pickup', 'Pickup', `${BRAND.street} · ready in ~15 min`, Store],
                  ['delivery', 'Delivery', `Within 4 km · ~35 min · ${subtotal >= FREE_DELIVERY_FROM ? 'free' : money(DELIVERY_FEE)}`, Bike],
                ] as const
              ).map(([id, label, note, Icon]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={method === id}
                  onClick={() => {
                    setMethod(id)
                    setWhen('asap')
                  }}
                  className="flex items-start gap-4 rounded-2xl border-2 border-line p-4 text-left transition-colors aria-checked:border-accent aria-checked:bg-accent/5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-accent">
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className="text-sm text-soft">{note}</span>
                  </span>
                </button>
              ))}
            </div>
          </Step>

          <Step n={2} title="When?">
            <div role="radiogroup" aria-label="Time" className="flex flex-wrap gap-2">
              <button type="button" role="radio" aria-checked={when === 'asap'} onClick={() => setWhen('asap')} className="chip">
                <Clock size={14} /> As soon as possible
              </button>
              {times.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={when === t} onClick={() => setWhen(t)} className="chip">
                  {t}
                </button>
              ))}
            </div>
            {times.length === 0 && <p className="mt-3 text-sm text-soft">The kitchen is closing soon, so we will prepare it straight away.</p>}
          </Step>

          <Step n={3} title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Name</span>
                <input className="field" autoComplete="name" placeholder="Alex Chen" {...field('name')} />
                {tried && errors.name && <span className="mt-1 block text-xs text-[#d9443a]">{errors.name}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Mobile</span>
                <input className="field" type="tel" autoComplete="tel" placeholder="0412 345 678" {...field('phone')} />
                {tried && errors.phone && <span className="mt-1 block text-xs text-[#d9443a]">{errors.phone}</span>}
              </label>
              {method === 'delivery' && (
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold">Delivery address</span>
                  <input className="field" autoComplete="street-address" placeholder="Street, suburb" {...field('address')} />
                  {tried && errors.address && <span className="mt-1 block text-xs text-[#d9443a]">{errors.address}</span>}
                </label>
              )}
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold">
                  Notes <span className="font-normal text-soft">(optional)</span>
                </span>
                <textarea className="field min-h-20" placeholder="Allergies, extra napkins, buzzer number…" {...field('notes')} />
              </label>
            </div>
          </Step>

          <Step n={4} title="Tip & payment">
            <p className="mb-3 text-sm text-soft">100% of tips go to the team on shift.</p>
            <div role="radiogroup" aria-label="Tip" className="flex flex-wrap gap-2">
              {TIPS.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={tip === t} onClick={() => setTip(t)} className="chip min-w-16 justify-center">
                  {t ? `${t}%` : 'No tip'}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label="Payment" className="mt-6 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['store', method === 'pickup' ? 'Pay at the counter' : 'Pay the rider', 'Card, phone or cash'],
                  ['card', 'Pay online now', 'Apple Pay, Google Pay, card'],
                ] as const
              ).map(([id, label, note]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={pay === id}
                  onClick={() => setPay(id)}
                  className="rounded-2xl border-2 border-line p-4 text-left transition-colors aria-checked:border-accent aria-checked:bg-accent/5"
                >
                  <span className="block font-semibold">{label}</span>
                  <span className="text-sm text-soft">{note}</span>
                </button>
              ))}
            </div>
            {pay === 'card' && (
              <p className="mt-3 rounded-xl bg-muted px-4 py-3 text-sm text-soft">
                Demo site: no card details are collected. In a live build this opens Stripe Checkout.
              </p>
            )}
          </Step>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-2xl">Your order</h2>
            <ul className="mt-5 space-y-4">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-3">
                  <Img name={l.img} sizes="64px" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-sm">
                      <p className="font-semibold">{l.name}</p>
                      <p>{money(l.price * l.qty)}</p>
                    </div>
                    {l.options && <p className="text-xs text-soft">{l.options}</p>}
                    <div className="mt-1.5 inline-flex items-center rounded-full border border-line">
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} className="flex h-7 w-7 items-center justify-center" aria-label={`One less ${l.name}`}>
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs font-semibold">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} className="flex h-7 w-7 items-center justify-center" aria-label={`One more ${l.name}`}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-2">
              <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" aria-label="Promo code" className="field !rounded-full !py-2.5 uppercase" disabled={promoOn} />
              <button type="button" onClick={() => setPromoOn(promo.trim().toUpperCase() === PROMO.code)} className="chip shrink-0" disabled={promoOn}>
                {promoOn ? <Check size={14} /> : 'Apply'}
              </button>
            </div>
            {!promoOn && promo && promo.trim().toUpperCase() !== PROMO.code && <p className="mt-2 text-xs text-soft">Hint: try {PROMO.code} for 10% off.</p>}

            <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-soft">Subtotal</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              {promoOn && (
                <div className="flex justify-between text-accent">
                  <dt>{PROMO.code}</dt>
                  <dd>−{money(discount)}</dd>
                </div>
              )}
              {method === 'delivery' && (
                <div className="flex justify-between">
                  <dt className="text-soft">Delivery</dt>
                  <dd>{delivery ? money(delivery) : 'Free'}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-soft">Tip ({tip}%)</dt>
                <dd>{money(tipAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
                <dt>Total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>
            <button type="submit" className="btn btn-accent mt-6 w-full">
              Place order · {money(total)}
            </button>
            {tried && !valid && <p className="mt-3 text-center text-xs text-[#d9443a]">Please check your details above.</p>}
          </div>
        </aside>
      </form>
    </>
  )
}

const STAGES: Record<Method, string[]> = {
  pickup: ['Order received', 'On the pass', 'Ready at the counter'],
  delivery: ['Order received', 'In the kitchen', 'With your rider'],
}

// The tracker moves through the stages on a timer, the way a live order screen would.
function Confirmation({ order }: { order: Placed }) {
  const [stage, setStage] = useState(0)
  const root = useRef<HTMLElement>(null)
  const stages = STAGES[order.method]

  useEffect(() => {
    const a = window.setTimeout(() => setStage(1), 2500)
    const b = window.setTimeout(() => setStage(2), 7000)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-tick] path', { strokeDasharray: 40, strokeDashoffset: 40, duration: 0.9, ease: 'power3.out', delay: 0.6 })
      gsap.from('[data-confirm]', { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', delay: 0.4 })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="mx-auto max-w-3xl px-4 pb-28 pt-36 text-center sm:px-6 sm:pt-44">
      <span data-tick className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-ink">
        <CheckCircle2 size={40} />
      </span>
      <p data-confirm className="eyebrow mt-8 justify-center">
        Order {order.id}
      </p>
      <h1 data-confirm className="mt-4 font-display text-5xl leading-tight sm:text-6xl">
        Thanks, {order.name}. <span className="italic-wonk text-accent">It is on.</span>
      </h1>
      <p data-confirm className="mt-4 text-lg text-soft">
        {order.method === 'pickup' ? `Pick it up at ${BRAND.street}` : 'Your rider will bring it'} {order.when}. We have texted you a receipt.
      </p>

      <ol data-confirm className="card mt-12 grid grid-cols-3 gap-2 p-6 text-left" aria-label="Order progress">
        {stages.map((s, i) => (
          <li key={s} className="relative">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent transition-[width] duration-[1.5s] ease-out" style={{ width: stage >= i ? '100%' : '0%' }} />
            </div>
            <p className={`mt-3 text-sm font-semibold transition-colors ${stage >= i ? 'text-ink' : 'text-soft'}`} aria-current={stage === i ? 'step' : undefined}>
              {s}
            </p>
          </li>
        ))}
      </ol>

      <div data-confirm className="card mt-6 p-6 text-left">
        <ul className="space-y-2 text-sm">
          {order.lines.map((l) => (
            <li key={l.key} className="flex justify-between">
              <span>
                {l.qty} × {l.name}
              </span>
              <span>{money(l.qty * l.price)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
          <span>Total</span>
          <span>{money(order.total)}</span>
        </p>
      </div>

      <div data-confirm className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/reserve" className="btn btn-ink">
          Book a table too
        </Link>
        <Link to="/" className="btn btn-ghost">
          Back home
        </Link>
      </div>
    </section>
  )
}
