import { HOURS } from '../data'
import { hourLabel } from './format'

const decimalHour = (d: Date) => d.getHours() + d.getMinutes() / 60

// "Open now · until 10 PM" or "Closed · opens 7 AM tomorrow"
export function openStatus(now = new Date()) {
  const today = HOURS[now.getDay()]
  const h = decimalHour(now)
  if (h >= today.open && h < today.close) return { open: true, label: `Open now · until ${hourLabel(today.close)}` }
  if (h < today.open) return { open: false, label: `Closed · opens ${hourLabel(today.open)}` }
  const next = HOURS[(now.getDay() + 1) % 7]
  return { open: false, label: `Closed · opens ${hourLabel(next.open)} tomorrow` }
}
