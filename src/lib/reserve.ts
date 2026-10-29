import { BRAND, HOURS } from '../data'
import { fromISO, toISO } from './format'

// Demo availability: deterministic per date, time and party size, so the same search always
// shows the same free tables. A live build swaps this for the booking system's API (e.g. SevenRooms).
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967295
}

export const toHour = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

export type Slot = { time: string; free: boolean; service: 'brunch' | 'dinner' }

export function slotsFor(date: string, guests: number): Slot[] {
  const { open, close } = HOURS[fromISO(date).getDay()]
  const out: Slot[] = []
  for (let h = open + 0.5; h <= close - 1.5; h += 0.5) {
    if (h > 15 && h < BRAND.dinnerFrom + 0.5) continue // kitchen changeover between brunch and dinner
    const time = `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`
    const service = h < BRAND.dinnerFrom ? 'brunch' : 'dinner'
    // Bigger groups and weekend nights are harder to seat.
    const busy = 0.25 + (guests > 6 ? 0.25 : guests > 4 ? 0.12 : 0) + (service === 'dinner' && [5, 6].includes(fromISO(date).getDay()) ? 0.15 : 0)
    out.push({ time, service, free: hash(`${date}|${time}|${Math.min(guests, 8)}`) > busy })
  }
  // Same-day slots in the past can't be booked.
  if (date === toISO(new Date())) {
    const now = new Date().getHours() + new Date().getMinutes() / 60 + 0.5
    return out.map((s) => (toHour(s.time) < now ? { ...s, free: false } : s))
  }
  return out
}

export const fullyBooked = (date: string) => hash(`full|${date}`) > 0.93

export const timeLabel = (t: string) => {
  const h = toHour(t)
  const hh = Math.floor(h)
  return `${hh % 12 === 0 ? 12 : hh % 12}:${t.split(':')[1]} ${hh >= 12 ? 'PM' : 'AM'}`
}

// A calendar file for the confirmation screen: works with Apple, Google and Outlook calendars.
export function icsFile({ date, time, guests, code }: { date: string; time: string; guests: number; code: string }) {
  const start = fromISO(date)
  start.setHours(Math.floor(toHour(time)), toHour(time) % 1 ? 30 : 0)
  const end = new Date(start.getTime() + 2 * 3600_000)
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ember//Reservations//EN',
    'BEGIN:VEVENT',
    `UID:${code}@embercafe.co`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Table for ${guests} at ${BRAND.full}`,
    `LOCATION:${BRAND.street}\\, ${BRAND.suburb}`,
    `DESCRIPTION:Booking ${code}. Call ${BRAND.phone} to change it.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return new Blob([body], { type: 'text/calendar' })
}
