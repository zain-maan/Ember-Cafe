import { BRAND, HOURS, MENU, type Dish } from '../data'
import { addDays, hourLabel, longDate, money, today } from './format'
import { openStatus } from './hours'

export type Reply = {
  text: string
  link?: { to: string; label: string }
  dish?: Dish // offers an "Add to order" button
}

// Demo host: keyword intents plus a small parser for booking requests ("table for 4 tomorrow at 7pm").
// In a client build `answer` becomes a call to an LLM with this same menu, hours and booking API as tools.
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const WORD_NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }

export function parseBooking(q: string) {
  const guests = Number(q.match(/(?:for|party of|table of)\s+(\d{1,2})|(\d{1,2})\s*(?:people|guests|pax|of us|persons)/)?.slice(1).find(Boolean)) ||
    WORD_NUM[q.match(/(?:for|party of)\s+(one|two|three|four|five|six|seven|eight|nine|ten)\b/)?.[1] ?? ''] ||
    null

  let date: string | null = null
  if (/\b(today|tonight)\b/.test(q)) date = today()
  else if (/\btomorrow\b/.test(q)) date = addDays(today(), 1)
  else {
    const d = DAYS.findIndex((day) => q.includes(day))
    if (d >= 0) date = addDays(today(), ((d - new Date().getDay() + 7) % 7) || 7)
  }

  let time: string | null = null
  const t = q.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/) ?? q.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\b/)
  if (t) {
    let h = Number(t[1])
    const m = t[2] && Number(t[2]) >= 30 ? '30' : '00'
    if (t[3] === 'pm' && h < 12) h += 12
    if (!t[3] && h < 7) h += 12 // "at 7" in a booking chat means the evening
    if (h <= 23) time = `${String(h).padStart(2, '0')}:${m}`
  }
  if (!time && /\btonight\b/.test(q)) time = '19:00'
  return { guests, date, time }
}

const INTENTS: { keys: string[]; reply: (q: string) => Reply }[] = [
  {
    keys: ['book', 'table', 'reserv', 'reservation', 'seat', 'party of'],
    reply: (q) => {
      const { guests, date, time } = parseBooking(q)
      const params = new URLSearchParams()
      if (date) params.set('date', date)
      params.set('guests', String(guests ?? 2))
      if (time) params.set('time', time)
      if (date) params.set('step', '2')
      const bits = [guests && `${guests} ${guests === 1 ? 'guest' : 'guests'}`, date && longDate(date), time && `around ${hourLabel(Number(time.slice(0, 2)) + (time.endsWith('30') ? 0.5 : 0))}`].filter(Boolean)
      return {
        text: bits.length
          ? `Lovely. I have started a booking for ${bits.join(', ')}. Pick your exact time and table on the next screen, it takes about 30 seconds.`
          : 'Happy to help you book. How many of you, and which day? Or jump straight into the booking page:',
        link: { to: `/reserve?${params}`, label: bits.length ? 'Finish my booking' : 'Book a table' },
      }
    },
  },
  {
    keys: ['open', 'hour', 'close', 'closing', 'when are you', 'time do you'],
    reply: () => {
      const today = HOURS[new Date().getDay()]
      return {
        text: `${openStatus().label}. Today we are open ${hourLabel(today.open)} to ${hourLabel(today.close)}. Brunch runs until 4 PM and dinner starts at ${hourLabel(BRAND.dinnerFrom)}. Weekends we stay open until 11.`,
      }
    },
  },
  {
    keys: ['where', 'address', 'location', 'park', 'tram', 'find you', 'directions'],
    reply: () => ({
      text: `We are at ${BRAND.street}, ${BRAND.suburb}. The 86 tram stops right outside, and there is 2-hour street parking on Napier Street.`,
    }),
  },
  {
    keys: ['vegan', 'vegetarian', 'gluten', 'coeliac', 'allerg', 'dairy', 'nut'],
    reply: (q) => {
      const tag = q.includes('gluten') || q.includes('coeliac') ? 'gf' : q.includes('vegan') || q.includes('dairy') ? 'vegan' : 'veg'
      const picks = MENU.filter((d) => d.tags.includes(tag) && d.cat !== 'drinks').slice(0, 4)
      const label = { gf: 'gluten-free', vegan: 'vegan', veg: 'vegetarian' }[tag]
      return {
        text: `Plenty of ${label} options: ${picks.map((d) => d.name).join(', ')}. Every dish on the menu lists its allergens, and the kitchen can adapt most plates.`,
        link: { to: '/menu?cat=all', label: 'Filter the menu' },
      }
    },
  },
  {
    keys: ['deliver', 'pickup', 'pick up', 'takeaway', 'take away', 'order'],
    reply: () => ({
      text: 'You can order right here: pickup is ready in about 15 minutes, delivery within 4 km takes about 35 and is free over $60.',
      link: { to: '/menu', label: 'Start an order' },
    }),
  },
  {
    keys: ['price', 'cost', 'expensive', 'how much', 'budget'],
    reply: () => ({
      text: 'Coffee is $4.80 to $6.80, brunch plates $17 to $22, and dinner mains $28 to $46. Our 2-course dinner set is $59.',
      link: { to: '/menu', label: 'See the full menu' },
    }),
  },
  {
    keys: ['wifi', 'wi-fi', 'laptop', 'work', 'plug'],
    reply: () => ({ text: 'Yes, free Wi-Fi and power points along the window bench. Laptops are welcome until noon on weekends, any time on weekdays.' }),
  },
  {
    keys: ['dog', 'pet'],
    reply: () => ({ text: 'Dogs are very welcome on the greenhouse terrace. We even have puppuccinos.' }),
  },
  {
    keys: ['kid', 'child', 'baby', 'high chair', 'pram'],
    reply: () => ({ text: 'Little ones are welcome. We have high chairs, a small kids menu and room for prams by the window.' }),
  },
  {
    keys: ['beans', 'buy coffee', 'retail', 'roast'],
    reply: () => ({ text: 'We roast every Tuesday. 250 g bags of our Ember blend are $19 at the counter, ground to order for your machine.' }),
  },
  {
    keys: ['event', 'private', 'function', 'group', 'birthday', 'wedding'],
    reply: () => ({
      text: 'The greenhouse terrace seats 40 for private events, with set menus from $65 a head. For groups of 10 or more, book online and we will be in touch about the menu.',
      link: { to: '/reserve?seating=terrace&guests=10', label: 'Book for a group' },
    }),
  },
  {
    keys: ['hi', 'hello', 'hey', 'good morning', 'good evening'],
    reply: () => ({ text: 'Hi there! I can book a table, tell you what is vegan or gluten-free, or start an order. What are you after?' }),
  },
]

export function answer(input: string): Reply {
  const q = input.toLowerCase()
  // A dish by name gets its price and a one-tap add.
  const dish = MENU.find((d) => q.includes(d.name.toLowerCase()) || d.name.toLowerCase().split(' ').filter((w) => w.length > 5).some((w) => q.includes(w)))
  if (dish && !/book|table|reserv/.test(q)) return { text: `${dish.name}, ${money(dish.price)}: ${dish.desc} ${dish.details}`, dish }

  const hit = INTENTS.find((i) => i.keys.some((k) => (k.length <= 3 ? new RegExp(`\\b${k}\\b`).test(q) : q.includes(k))))
  if (hit) return hit.reply(q)
  return {
    text: `Good question. I will pass it to the team, who reply within the hour on ${BRAND.phone}. Meanwhile I can help with bookings, the menu, hours or orders.`,
  }
}
