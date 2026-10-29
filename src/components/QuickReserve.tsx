import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, today } from '../lib/format'
import { ArrowRight } from './icons'

// Date, time and party size on the home page; the full booking flow picks up from there.
export default function QuickReserve() {
  const navigate = useNavigate()
  const [date, setDate] = useState(today())
  const [guests, setGuests] = useState(2)
  const [time, setTime] = useState('19:00')

  function go(e: FormEvent) {
    e.preventDefault()
    navigate(`/reserve?date=${date}&guests=${guests}&time=${time}&step=2`)
  }

  return (
    <form onSubmit={go} className="grid gap-3 rounded-[1.75rem] border border-cream/15 bg-black/25 p-3 backdrop-blur-md sm:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="rounded-2xl px-4 py-2 transition-colors focus-within:bg-white/10 hover:bg-white/5">
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cream/50">Date</span>
        <input type="date" value={date} min={today()} max={addDays(today(), 60)} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-cream outline-none [color-scheme:dark]" required />
      </label>
      <label className="rounded-2xl px-4 py-2 transition-colors focus-within:bg-white/10 hover:bg-white/5">
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cream/50">Time</span>
        <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-transparent text-cream outline-none [&>option]:text-black">
          {['08:00', '09:30', '11:00', '12:30', '14:00', '17:30', '18:30', '19:00', '20:00', '21:00'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="rounded-2xl px-4 py-2 transition-colors focus-within:bg-white/10 hover:bg-white/5">
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cream/50">Guests</span>
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-cream outline-none [&>option]:text-black">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" data-magnetic className="btn btn-cream">
        Find a table <ArrowRight size={16} />
      </button>
    </form>
  )
}
