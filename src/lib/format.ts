export const money = (n: number) => `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`

// 17 → "5 PM", 7.5 → "7:30 AM"
export function hourLabel(h: number) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  const suffix = hh >= 12 && hh < 24 ? 'PM' : 'AM'
  const twelve = hh % 12 === 0 ? 12 : hh % 12
  return `${twelve}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${suffix}`
}

export const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function fromISO(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const today = () => toISO(new Date())

export function addDays(iso: string, n: number) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const longDate = (iso: string) => fromISO(iso).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })
