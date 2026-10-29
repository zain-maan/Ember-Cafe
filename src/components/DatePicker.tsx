import { useMemo, useState } from 'react'
import { addDays, fromISO, toISO, today } from '../lib/format'
import { fullyBooked } from '../lib/reserve'
import { ChevronLeft, ChevronRight } from './icons'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MAX_DAYS = 60

function monthDays(year: number, month: number) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7 // Monday-first grid
  const count = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = Array(lead).fill(null)
  for (let d = 1; d <= count; d++) cells.push(toISO(new Date(year, month, d)))
  return cells
}

export default function DatePicker({ value, onChange }: { value: string | null; onChange: (d: string) => void }) {
  const now = today()
  const last = addDays(now, MAX_DAYS)
  const [offset, setOffset] = useState(() => {
    if (!value) return 0
    const v = fromISO(value)
    const n = new Date()
    return Math.max(0, (v.getFullYear() - n.getFullYear()) * 12 + v.getMonth() - n.getMonth())
  })

  const month = useMemo(() => {
    const n = new Date()
    const d = new Date(n.getFullYear(), n.getMonth() + offset, 1)
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }) }
  }, [offset])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => setOffset((o) => o - 1)} disabled={offset === 0} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <p className="font-display text-xl" aria-live="polite">
          {month.label}
        </p>
        <button type="button" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 2} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={month.label}>
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-2 text-xs font-semibold text-soft">
            {w}
          </span>
        ))}
        {monthDays(month.year, month.month).map((d, i) => {
          if (!d) return <span key={`e${i}`} />
          const full = fullyBooked(d)
          const disabled = d < now || d > last || full
          const selected = d === value
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d)}
              aria-pressed={selected}
              aria-label={`${fromISO(d).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}${full ? ', fully booked' : ''}`}
              className={`relative aspect-square rounded-full text-sm font-semibold transition-colors ${
                selected ? 'bg-accent text-accent-ink' : disabled ? 'text-soft/40' : 'hover:bg-muted'
              } ${d === now && !selected ? 'ring-1 ring-line' : ''}`}
            >
              {fromISO(d).getDate()}
              {full && d >= now && <span className="absolute inset-x-0 bottom-1 mx-auto h-1 w-1 rounded-full bg-soft/50" />}
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-soft">Dotted days are fully booked. Bookings open {MAX_DAYS} days ahead.</p>
    </div>
  )
}
