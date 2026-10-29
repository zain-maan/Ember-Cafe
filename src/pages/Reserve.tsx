import { useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DatePicker from '../components/DatePicker'
import { ArrowLeft, ArrowRight, CalendarIcon, Check, Clock, Download, MapPin, Minus, Moon, Plus, Sun, Users } from '../components/icons'
import Img from '../components/Img'
import PageHero from '../components/PageHero'
import { BRAND, SEATING, type ImageName } from '../data'
import { longDate, today } from '../lib/format'
import { gsap, prefersReducedMotion, scrollToElement, scrollToTop } from '../lib/motion'
import { fullyBooked, icsFile, slotsFor, timeLabel, toHour } from '../lib/reserve'

const SEAT_IMG: Record<(typeof SEATING)[number]['id'], ImageName> = { window: 'street', dining: 'dining-room', terrace: 'greenhouse', bar: 'coffee-bar' }
const OCCASIONS = ['Just because', 'Birthday', 'Anniversary', 'Date night', 'Business']
const STEPS = ['Date & guests', 'Time & table', 'Your details']
const MAX_GUESTS = 12

type Booking = { code: string; name: string; email: string; occasion: string }

// All choices except personal details live in the URL, so a half-finished booking survives a refresh
// and the home page (or the chat assistant) can deep-link straight into step two.
export default function Reserve() {
  const [params, setParams] = useSearchParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [occasion, setOccasion] = useState(OCCASIONS[0])
  const [tried, setTried] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  const rawDate = params.get('date')
  const date = rawDate && rawDate >= today() && !fullyBooked(rawDate) ? rawDate : null
  const guests = Math.min(MAX_GUESTS, Math.max(1, Number(params.get('guests')) || 2))
  const seating = SEATING.find((s) => s.id === params.get('seating')) ?? SEATING[1]
  const slots = useMemo(() => (date ? slotsFor(date, guests) : []), [date, guests])
  const rawTime = params.get('time')
  const time = slots.some((s) => s.time === rawTime && s.free) ? rawTime : null
  // When a deep link asks for a taken time, offer the two free slots closest to it.
  const nearest =
    rawTime && !time && /^\d{2}:\d{2}$/.test(rawTime)
      ? slots
          .filter((s) => s.free)
          .sort((a, b) => Math.abs(toHour(a.time) - toHour(rawTime)) - Math.abs(toHour(b.time) - toHour(rawTime)))
          .slice(0, 2)
      : []
  const wanted = Number(params.get('step')) || 1
  // Never land on a step whose earlier choices are missing.
  const step = Math.min(wanted, date ? (time ? 3 : 2) : 1)

  function update(patch: Record<string, string | number | null>) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k)
      else next.set(k, String(v))
    }
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const go = (n: number) => {
    update({ step: n })
    scrollToElement('#booking', -100)
  }

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !panel.current) return
    gsap.fromTo(panel.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
  }, [step, booking])

  const errors = {
    name: form.name.trim().length < 2 ? 'Who is the booking for?' : '',
    email: /^\S+@\S+\.\S+$/.test(form.email) ? '' : 'We send your confirmation here',
    phone: form.phone.replace(/\D/g, '').length < 8 ? 'In case we need to reach you' : '',
  }

  function confirm(e: FormEvent) {
    e.preventDefault()
    setTried(true)
    if (Object.values(errors).some(Boolean)) return
    const code = `EMB-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    setBooking({ code, name: form.name.trim().split(' ')[0], email: form.email.trim(), occasion })
    scrollToTop()
  }

  if (booking && date && time) return <Ticket booking={booking} date={date} time={time} guests={guests} seating={seating} />

  const brunch = slots.filter((s) => s.service === 'brunch')
  const dinner = slots.filter((s) => s.service === 'dinner')

  return (
    <>
      <PageHero
        eyebrow="Reservations"
        title={
          <>
            Pull up a chair. <span className="italic-wonk text-accent">We saved you one.</span>
          </>
        }
        lead="Brunch, dinner or the greenhouse terrace. Instant confirmation, free changes up to two hours before."
        note={<>ask for table 3, it gets the sun</>}
        collage={[
          { img: 'window-seat', caption: 'table 3, the window' },
          { img: 'night-terrace', caption: 'the terrace at dusk' },
          { img: 'evening-diner', caption: 'friday, 8 pm' },
        ]}
      />

      <section id="booking" className="mx-auto grid max-w-7xl gap-8 px-4 pb-28 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div>
          <ol className="mb-6 flex gap-2" aria-label="Booking steps">
            {STEPS.map((s, i) => (
              <li key={s} className="flex-1">
                <button
                  type="button"
                  disabled={i + 1 > step}
                  onClick={() => go(i + 1)}
                  aria-current={step === i + 1 ? 'step' : undefined}
                  className="w-full text-left disabled:cursor-default"
                >
                  <span className={`block h-1 rounded-full transition-colors ${i + 1 <= step ? 'bg-accent' : 'bg-line'}`} />
                  <span className={`mt-2 block text-xs font-semibold ${i + 1 === step ? 'text-ink' : 'text-soft'}`}>
                    {i + 1}. {s}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div ref={panel} className="card p-6 sm:p-8">
            {step === 1 && (
              <div className="grid gap-10 md:grid-cols-[1fr_220px]">
                <div>
                  <h2 className="mb-5 font-display text-2xl">Pick a day</h2>
                  <DatePicker value={date} onChange={(d) => update({ date: d, time: null })} />
                </div>
                <div>
                  <h2 className="mb-5 font-display text-2xl">How many?</h2>
                  <div className="flex items-center justify-between rounded-2xl border border-line p-2">
                    <button type="button" onClick={() => update({ guests: guests - 1, time: null })} disabled={guests <= 1} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30" aria-label="One fewer guest">
                      <Minus size={18} />
                    </button>
                    <span className="font-display text-3xl" aria-live="polite">
                      {guests}
                    </span>
                    <button type="button" onClick={() => update({ guests: guests + 1, time: null })} disabled={guests >= MAX_GUESTS} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30" aria-label="One more guest">
                      <Plus size={18} />
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-soft">
                    {guests >= 10 ? 'Groups of 10+ get our set feasting menu.' : 'More than 12? Call us on'} {guests < 10 && <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="underline">{BRAND.phone}</a>}
                  </p>
                  <button type="button" disabled={!date} onClick={() => go(2)} className="btn btn-accent mt-8 w-full">
                    Choose a time <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && date && (
              <div>
                <h2 className="font-display text-2xl">{longDate(date)}</h2>
                <p className="mt-1 text-sm text-soft">
                  Table for {guests}. Greyed-out times are taken.
                </p>
                {rawTime && !time && nearest.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-muted p-4 text-sm">
                    <span>{timeLabel(rawTime)} is already taken. Closest free tables:</span>
                    {nearest.map((s) => (
                      <button key={s.time} type="button" onClick={() => update({ time: s.time })} className="chip !bg-surface">
                        {timeLabel(s.time)}
                      </button>
                    ))}
                  </div>
                )}
                {(
                  [
                    ['Brunch', brunch, Sun],
                    ['Dinner', dinner, Moon],
                  ] as const
                ).map(([label, list, Icon]) =>
                  list.length ? (
                    <div key={label} className="mt-7">
                      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-soft">
                        <Icon size={14} /> {label}
                      </p>
                      <div role="radiogroup" aria-label={`${label} times`} className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {list.map((s) => (
                          <button
                            key={s.time}
                            type="button"
                            role="radio"
                            aria-checked={time === s.time}
                            disabled={!s.free}
                            onClick={() => update({ time: s.time })}
                            className="chip justify-center disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-35 disabled:line-through"
                          >
                            {timeLabel(s.time)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null,
                )}
                {!slots.some((s) => s.free) && <p className="mt-6 rounded-xl bg-muted p-4 text-sm">We are full that day for {guests}. Try another date or a smaller table.</p>}

                <h3 className="mt-10 font-display text-xl">Where would you like to sit?</h3>
                <div role="radiogroup" aria-label="Seating" className="mt-4 grid gap-3 sm:grid-cols-2">
                  {SEATING.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={seating.id === s.id}
                      onClick={() => update({ seating: s.id })}
                      className="group flex items-center gap-3 rounded-2xl border-2 border-line p-2 pr-4 text-left transition-colors aria-checked:border-accent aria-checked:bg-accent/5"
                    >
                      <Img name={SEAT_IMG[s.id]} sizes="64px" className="h-16 w-16 rounded-xl object-cover" />
                      <span>
                        <span className="block font-semibold">{s.label}</span>
                        <span className="text-xs text-soft">{s.note}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex justify-between gap-3">
                  <button type="button" onClick={() => go(1)} className="btn btn-ghost">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" disabled={!time} onClick={() => go(3)} className="btn btn-accent">
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={confirm} noValidate>
                <h2 className="font-display text-2xl">Last thing: who is coming?</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ['name', 'Full name', 'text', 'name', 'Alex Chen'],
                      ['email', 'Email', 'email', 'email', 'alex@email.com'],
                      ['phone', 'Mobile', 'tel', 'tel', '0412 345 678'],
                    ] as const
                  ).map(([k, label, type, auto, ph]) => (
                    <label key={k} className={`block ${k === 'name' ? 'sm:col-span-2' : ''}`}>
                      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
                      <input
                        type={type}
                        autoComplete={auto}
                        placeholder={ph}
                        value={form[k]}
                        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                        aria-invalid={tried && !!errors[k]}
                        className="field"
                      />
                      {tried && errors[k] && <span className="mt-1 block text-xs text-[#d9443a]">{errors[k]}</span>}
                    </label>
                  ))}
                </div>
                <p className="mb-3 mt-6 text-sm font-semibold">Celebrating something?</p>
                <div role="radiogroup" aria-label="Occasion" className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button key={o} type="button" role="radio" aria-checked={occasion === o} onClick={() => setOccasion(o)} className="chip">
                      {o}
                    </button>
                  ))}
                </div>
                <label className="mt-6 block">
                  <span className="mb-1.5 block text-sm font-semibold">
                    Anything we should know? <span className="font-normal text-soft">(optional)</span>
                  </span>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Allergies, a high chair, a surprise cake…" className="field min-h-24" />
                </label>
                <div className="mt-10 flex justify-between gap-3">
                  <button type="button" onClick={() => go(2)} className="btn btn-ghost">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="btn btn-accent">
                    Confirm booking <Check size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Img key={seating.id} name={SEAT_IMG[seating.id]} sizes="380px" className="h-full w-full object-cover" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-cream backdrop-blur">{seating.label}</span>
            </div>
            <dl className="space-y-3 p-6 text-sm">
              <div className="flex items-center gap-3">
                <CalendarIcon size={16} className="text-accent" />
                <dt className="sr-only">Date</dt>
                <dd>{date ? longDate(date) : 'Pick a date'}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-accent" />
                <dt className="sr-only">Time</dt>
                <dd>{time ? timeLabel(time) : 'Pick a time'}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Users size={16} className="text-accent" />
                <dt className="sr-only">Guests</dt>
                <dd>
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </dd>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-accent" />
                <dt className="sr-only">Address</dt>
                <dd>{BRAND.street}, Fitzroy</dd>
              </div>
            </dl>
            <p className="border-t border-line px-6 py-4 text-xs text-soft">No deposit for tables under 8. Free changes up to 2 hours before.</p>
          </div>
        </aside>
      </section>
    </>
  )
}

function Ticket({ booking, date, time, guests, seating }: { booking: Booking; date: string; time: string; guests: number; seating: (typeof SEATING)[number] }) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-ticket]', { y: 80, rotate: -4, opacity: 0, duration: 1.1, ease: 'expo.out', delay: 0.2 })
      gsap.from('[data-ticket-row]', { y: 16, opacity: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out', delay: 0.6 })
    }, root)
    return () => ctx.revert()
  }, [])

  function download() {
    const url = URL.createObjectURL(icsFile({ date, time, guests, code: booking.code }))
    const a = document.createElement('a')
    a.href = url
    a.download = `ember-${date}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={root} className="mx-auto max-w-xl px-4 pb-28 pt-36 sm:px-6 sm:pt-44">
      <p className="eyebrow justify-center">You are booked</p>
      <h1 className="mt-4 text-center font-display text-5xl leading-tight">
        See you soon, <span className="italic-wonk text-accent">{booking.name}.</span>
      </h1>
      <p className="mt-3 text-center text-soft">A confirmation is on its way to {booking.email}.</p>

      <div data-ticket className="mt-10 drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]">
        <div className="rounded-t-[2rem] bg-surface p-7">
          <div data-ticket-row className="flex items-center justify-between">
            <span className="font-display text-2xl">
              {BRAND.name}
              <span className="text-accent">.</span>
            </span>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-ink">{booking.code}</span>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-6">
            {[
              ['Date', longDate(date)],
              ['Time', timeLabel(time)],
              ['Guests', `${guests} ${guests === 1 ? 'guest' : 'guests'}`],
              ['Table', seating.label],
            ].map(([k, v]) => (
              <div key={k} data-ticket-row>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-soft">{k}</dt>
                <dd className="mt-1 font-display text-xl leading-tight">{v}</dd>
              </div>
            ))}
          </dl>
          {booking.occasion !== OCCASIONS[0] && (
            <p data-ticket-row className="mt-6 rounded-xl bg-muted px-4 py-3 text-sm">
              {booking.occasion}? The team has been told. Expect a little something.
            </p>
          )}
        </div>
        {/* Tear line with a notch cut out of each side */}
        <div className="relative h-0 border-t-2 border-dashed border-line">
          <span className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-bg" />
          <span className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-bg" />
        </div>
        <div className="rounded-b-[2rem] bg-surface px-7 py-6">
          <div data-ticket-row className="flex flex-wrap gap-2">
            <button type="button" onClick={download} className="btn btn-ink flex-1">
              <Download size={16} /> Add to calendar
            </button>
            <a href={BRAND.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-ghost flex-1">
              <MapPin size={16} /> Directions
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <Link to="/menu" className="btn btn-ghost">
          Peek at the menu
        </Link>
        <Link to="/order" className="btn btn-accent">
          Order ahead
        </Link>
      </div>
    </div>
  )
}
