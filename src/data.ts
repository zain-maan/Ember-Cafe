// Everything a client would change lives here: name, hours, menu, team, reviews.
// Re-skinning the site for a real café or restaurant means editing this file and swapping photos.
import type lqip from './lqip.json'

export type ImageName = keyof typeof lqip
export type Mode = 'day' | 'night'

export const BRAND = {
  name: 'Ember',
  full: 'Ember Café & Kitchen',
  tagline: 'Café by day. Kitchen by night.',
  street: '214 Gertrude Street',
  suburb: 'Fitzroy, Melbourne VIC 3065',
  phone: '+61 3 9417 2210',
  email: 'hello@embercafe.co',
  instagram: '@ember.fitzroy',
  mapsUrl: 'https://maps.google.com/?q=Gertrude+Street+Fitzroy+Melbourne',
  // Day service (coffee and brunch) ends here; the kitchen opens for dinner after it.
  dinnerFrom: 17,
}

// 0 = Sunday. Hours are 24h; close may pass midnight-free values like 23.
export const HOURS: { day: string; open: number; close: number }[] = [
  { day: 'Sunday', open: 8, close: 21 },
  { day: 'Monday', open: 7, close: 22 },
  { day: 'Tuesday', open: 7, close: 22 },
  { day: 'Wednesday', open: 7, close: 22 },
  { day: 'Thursday', open: 7, close: 22 },
  { day: 'Friday', open: 7, close: 23 },
  { day: 'Saturday', open: 7, close: 23 },
]

export type Tag = 'veg' | 'vegan' | 'gf' | 'spicy'
export const TAG_LABELS: Record<Tag, string> = { veg: 'Vegetarian', vegan: 'Vegan', gf: 'Gluten-free', spicy: 'Spicy' }

export type Category = 'coffee' | 'brunch' | 'mains' | 'desserts' | 'drinks'
export const CATEGORIES: { id: Category; label: string; mode: Mode | 'all'; note: string }[] = [
  { id: 'coffee', label: 'Coffee', mode: 'day', note: 'Single-origin espresso, roasted in-house every Tuesday.' },
  { id: 'brunch', label: 'Brunch', mode: 'day', note: 'Served 7 am to 4 pm, all weekend long.' },
  { id: 'mains', label: 'Dinner', mode: 'night', note: 'From 5 pm. Cooked over ironbark and charcoal.' },
  { id: 'desserts', label: 'Desserts', mode: 'all', note: 'Made each morning by our pastry team.' },
  { id: 'drinks', label: 'Bar', mode: 'night', note: 'Natural wine, house ferments and smoked classics.' },
]

export type Dish = {
  id: string
  name: string
  desc: string
  price: number
  cat: Category
  img: ImageName
  tags: Tag[]
  signature?: boolean
  // Shown in the quick view.
  details: string
  allergens: string[]
  kcal: number
}

export const MENU: Dish[] = [
  // Coffee
  { id: 'flat-white', name: 'Ember Flat White', desc: 'Our house blend, silky micro-foam, a note of dark cherry.', price: 5.5, cat: 'coffee', img: 'flat-white', tags: ['veg', 'gf'], signature: true, details: 'A double ristretto of our Ember blend (Colombia + Ethiopia) under a thin, glossy layer of milk.', allergens: ['Milk'], kcal: 120 },
  { id: 'honey-latte', name: 'Burnt Honey Latte', desc: 'Espresso, torched honey, steamed oat milk, sea salt.', price: 6.5, cat: 'coffee', img: 'latte', tags: ['veg', 'gf'], signature: true, details: 'Honey from Yarra Valley hives is caramelised to order, so it tastes toasty rather than sweet.', allergens: [], kcal: 190 },
  { id: 'matcha', name: 'Stone-ground Matcha', desc: 'Ceremonial Uji matcha whisked by hand, your choice of milk.', price: 6.8, cat: 'coffee', img: 'matcha', tags: ['vegan', 'gf'], details: 'Grade-one matcha from Uji, Kyoto, whisked at 75°C so it stays sweet and grassy, never bitter.', allergens: [], kcal: 140 },
  { id: 'iced-latte', name: 'Iced Vanilla Latte', desc: 'Double shot over ice, Madagascan vanilla bean syrup.', price: 6.5, cat: 'coffee', img: 'iced-latte', tags: ['veg', 'gf'], details: 'We make the syrup from whole vanilla pods. Ask for it with oat or almond milk.', allergens: ['Milk'], kcal: 160 },
  { id: 'cold-brew', name: '18-hour Cold Brew', desc: 'Slow-steeped Brazil, chocolate and stone fruit finish.', price: 6, cat: 'coffee', img: 'cold-brew', tags: ['vegan', 'gf'], details: 'Steeped for eighteen hours at fridge temperature, served black or with a splash of cream.', allergens: [], kcal: 10 },
  { id: 'long-black', name: 'Long Black', desc: 'Rotating single origin, bright and clean.', price: 4.8, cat: 'coffee', img: 'long-black', tags: ['vegan', 'gf'], details: 'This week: Guji, Ethiopia. Bergamot, peach and black tea.', allergens: [], kcal: 5 },
  // Brunch
  { id: 'croissant', name: 'Laminated Butter Croissant', desc: 'Three-day dough, cultured butter, flaky to the core.', price: 6.5, cat: 'brunch', img: 'croissant', tags: ['veg'], details: 'Baked in small batches from 6:30 am. Add house jam for $1.5.', allergens: ['Gluten', 'Milk', 'Egg'], kcal: 340 },
  { id: 'french-toast', name: 'Brioche French Toast', desc: 'Banana, blueberries, maple butter, whipped mascarpone.', price: 22, cat: 'brunch', img: 'french-toast', tags: ['veg'], signature: true, details: 'Thick-cut brioche soaked overnight in vanilla custard, then caramelised in brown butter.', allergens: ['Gluten', 'Milk', 'Egg'], kcal: 720 },
  { id: 'pancakes', name: 'Soufflé Hotcakes', desc: 'A stack of three, honeycomb, mango, pouring cream.', price: 21, cat: 'brunch', img: 'pancakes', tags: ['veg'], details: 'Whipped egg whites make them tall and wobbly. Allow fifteen minutes; they are worth it.', allergens: ['Gluten', 'Milk', 'Egg'], kcal: 650 },
  { id: 'egg-toast', name: 'Smashed Avo & Egg', desc: 'Sourdough, jammy egg, chilli crisp, lime, feta.', price: 19, cat: 'brunch', img: 'egg-toast', tags: ['veg', 'spicy'], details: 'Our chilli crisp is made with Sichuan pepper and fried shallots. Swap feta for tofu to make it vegan.', allergens: ['Gluten', 'Milk', 'Egg'], kcal: 540 },
  { id: 'garden-bowl', name: 'Garden Bowl', desc: 'Roast pumpkin, chickpeas, avocado, tahini, seeds.', price: 20, cat: 'brunch', img: 'garden-bowl', tags: ['vegan', 'gf'], details: 'Everything is roasted the same morning. Add a poached egg or smoked salmon.', allergens: ['Sesame'], kcal: 560 },
  { id: 'toastie', name: 'Three-Cheese Toastie', desc: 'Gruyère, cheddar, mozzarella, kimchi, sourdough.', price: 17, cat: 'brunch', img: 'toastie', tags: ['veg', 'spicy'], details: 'Pressed until the edges turn to crackling cheese. Comes with a pot of tomato relish.', allergens: ['Gluten', 'Milk'], kcal: 780 },
  // Dinner
  { id: 'steak-frites', name: 'Ironbark Steak Frites', desc: '300 g sirloin over coals, triple-cooked fries, pepper jus.', price: 46, cat: 'mains', img: 'steak-frites', tags: ['gf'], signature: true, details: 'Grass-fed Gippsland sirloin, dry-aged 28 days, rested in beef fat before it reaches you.', allergens: ['Milk'], kcal: 980 },
  { id: 'rigatoni', name: 'Slow Tomato Rigatoni', desc: 'Eight-hour sugo, nduja, stracciatella, basil oil.', price: 32, cat: 'mains', img: 'rigatoni', tags: ['spicy'], details: 'Pasta is extruded in-house each afternoon. Ask for it without nduja to make it vegetarian.', allergens: ['Gluten', 'Milk'], kcal: 820 },
  { id: 'ribs', name: 'Coffee-rubbed Short Rib', desc: 'Braised twelve hours, charred tomato, smoked salt.', price: 44, cat: 'mains', img: 'ribs', tags: ['gf'], signature: true, details: 'Rubbed with our own espresso grounds, which caramelise into a deep, savoury crust.', allergens: [], kcal: 1050 },
  { id: 'pizza', name: 'Wood-fired Flatbread', desc: 'Fermented dough, pepperoni, red onion, hot honey.', price: 28, cat: 'mains', img: 'pizza', tags: ['spicy'], details: 'A 48-hour cold-fermented dough blistered at 450°C. Big enough to share.', allergens: ['Gluten', 'Milk'], kcal: 900 },
  { id: 'skewers', name: 'Charcoal Skewers', desc: 'Lamb, chicken and halloumi, toum, pickled chilli.', price: 34, cat: 'mains', img: 'skewers', tags: ['gf', 'spicy'], details: 'A sharing board for two, grilled over binchotan with flatbread on the side.', allergens: ['Milk'], kcal: 880 },
  { id: 'salmon-bowl', name: 'Miso Salmon Bowl', desc: 'Torched salmon, brown rice, edamame, pickles.', price: 30, cat: 'mains', img: 'salmon-bowl', tags: ['gf'], details: 'Tasmanian salmon brushed with white miso and torched at the pass.', allergens: ['Fish', 'Soy', 'Sesame'], kcal: 640 },
  { id: 'citrus-salad', name: 'Charred Citrus Salad', desc: 'Blood orange, fennel, rocket, candied walnuts.', price: 18, cat: 'mains', img: 'citrus-salad', tags: ['vegan', 'gf'], details: 'A bright side for anything from the grill. Dressed with our own orange vinegar.', allergens: ['Tree nuts'], kcal: 310 },
  // Desserts
  { id: 'mud-cake', name: 'Dark Mud Cake', desc: '70% chocolate, espresso ganache, salted cream.', price: 15, cat: 'desserts', img: 'mud-cake', tags: ['veg'], signature: true, details: 'A slice of our celebration cake. Order a whole one 48 hours ahead.', allergens: ['Gluten', 'Milk', 'Egg'], kcal: 610 },
  { id: 'brownie', name: 'Fudge Brownie', desc: 'Warm, with brown-butter ice cream.', price: 13, cat: 'desserts', img: 'brownie', tags: ['veg', 'gf'], details: 'Made with almond flour so it is naturally gluten-free and very fudgy.', allergens: ['Milk', 'Egg', 'Tree nuts'], kcal: 540 },
  { id: 'berry-pots', name: 'Strawberry Panna Cotta', desc: 'Vanilla set cream, macerated berries, mint.', price: 12, cat: 'desserts', img: 'berry-pots', tags: ['veg', 'gf'], details: 'Set in little jars, so it is easy to take home too.', allergens: ['Milk'], kcal: 380 },
  { id: 'sundae', name: 'Affogato Sundae', desc: 'Espresso, vanilla gelato, cookie crumb, cocoa.', price: 14, cat: 'desserts', img: 'sundae', tags: ['veg'], details: 'Pour the hot shot over yourself. Add a nip of Frangelico for $6.', allergens: ['Gluten', 'Milk'], kcal: 460 },
  // Bar
  { id: 'old-fashioned', name: 'Cold Brew Old Fashioned', desc: 'Bourbon, cold brew reduction, orange, bitters.', price: 22, cat: 'drinks', img: 'old-fashioned', tags: ['vegan', 'gf'], signature: true, details: 'Our most-ordered drink after dark: coffee and bourbon stirred down over one clear cube.', allergens: [], kcal: 190 },
  { id: 'smoked-negroni', name: 'Smoked Negroni', desc: 'Gin, Campari, vermouth, rosemary smoke.', price: 21, cat: 'drinks', img: 'smoked-negroni', tags: ['vegan', 'gf'], details: 'Smoked under a cloche at the table. A little theatre with your dinner.', allergens: [], kcal: 200 },
]

export const dishById = (id: string) => MENU.find((d) => d.id === id)

export const SIGNATURES: Record<Mode, string[]> = {
  day: ['flat-white', 'french-toast', 'honey-latte', 'pancakes', 'egg-toast', 'mud-cake'],
  night: ['steak-frites', 'ribs', 'old-fashioned', 'rigatoni', 'smoked-negroni', 'mud-cake'],
}

// Copy that changes with the mood of the site.
export const MOOD: Record<
  Mode,
  { greeting: string; title: [string, string]; lead: string; hero: ImageName; marquee: string[]; special: { dish: string; note: string } }
> = {
  day: {
    greeting: 'Good morning, Fitzroy',
    title: ['Slow mornings,', 'serious coffee.'],
    lead: 'Single-origin espresso roasted down the lane, brunch made from scratch, and a sunny window seat with your name on it.',
    hero: 'hero-day',
    marquee: ['Roasted on Tuesdays', 'Brioche French toast', 'Burnt honey lattes', 'Croissants at 6:30', 'Oat, almond, or whole'],
    special: { dish: 'honey-latte', note: 'Today at the bar' },
  },
  night: {
    greeting: 'Good evening, Fitzroy',
    title: ['Candlelight,', 'cooked over fire.'],
    lead: 'When the espresso machine cools down, the charcoal heats up: ironbark-grilled plates, natural wine and coffee cocktails until late.',
    hero: 'hero-night',
    marquee: ['Ironbark grill', 'Natural wine', 'Coffee cocktails', 'Short rib, twelve hours', 'Open till late'],
    special: { dish: 'old-fashioned', note: 'Tonight at the bar' },
  },
}

export const STATS = [
  { value: '9', label: 'years on Gertrude Street' },
  { value: '4.9', label: 'average from 2,300+ Google reviews' },
  { value: '42', label: 'kilos of coffee roasted each week' },
  { value: '6', label: 'local farms on our menu' },
]

export const REVIEWS = [
  { name: 'Hannah W.', img: 'guest-1', source: 'Google', text: 'Best flat white in Fitzroy, and I have tried them all. The French toast should be illegal.' },
  { name: 'Marcus T.', img: 'guest-2', source: 'Google', text: 'Came for brunch, came back for dinner the same day. The short rib with coffee rub is unreal.' },
  { name: 'Priya S.', img: 'guest-3', source: 'TripAdvisor', text: 'Booked a table for eight on the website in a minute. Staff remembered my oat milk on the second visit.' },
  { name: 'Daniel K.', img: 'guest-4', source: 'Google', text: 'Feels like two places in one. Bright and buzzing at 9 am, candlelit and cosy at 9 pm.' },
  { name: 'Sofia R.', img: 'guest-1', source: 'Instagram', text: 'The cold brew old fashioned is my new favourite drink. Ordered pickup on the site, ready in ten.' },
  { name: 'James L.', img: 'guest-2', source: 'Google', text: 'Lovely terrace, great dog-friendly vibe, and the hotcakes are as tall as they look in the photos.' },
] satisfies { name: string; img: ImageName; source: string; text: string }[]

export const TEAM = [
  { name: 'Lucia Moreno', role: 'Head chef', img: 'chef', note: 'Twelve years on wood-fired kitchens from Buenos Aires to Melbourne.' },
  { name: 'Tom Baird', role: 'Head roaster', img: 'pour-over', note: 'Roasts every bean we pour, on a 15 kg Giesen in the back room.' },
  { name: 'Aiko Tanaka', role: 'Pastry', img: 'croissant', note: 'In at 4 am, so the croissants are out of the oven when we open.' },
] satisfies { name: string; role: string; img: ImageName; note: string }[]

export const TIMELINE = [
  { year: '2017', title: 'A hole-in-the-wall', text: 'Ember opened as a six-seat espresso bar with one grinder and a borrowed machine.', img: 'espresso' },
  { year: '2019', title: 'Roasting in the back', text: 'We started roasting our own beans so every cup tastes exactly the way we want.', img: 'beans' },
  { year: '2021', title: 'Brunch, from scratch', text: 'A real kitchen arrived, with a pastry section that bakes everything in-house.', img: 'brunch-table' },
  { year: '2023', title: 'The fire after dark', text: 'An ironbark grill turned the café into a dinner spot and a little bar after 5 pm.', img: 'fire-kitchen' },
  { year: '2026', title: 'The greenhouse terrace', text: 'Forty more seats under glass and vines, bookable for birthdays and long lunches.', img: 'greenhouse' },
] satisfies { year: string; title: string; text: string; img: ImageName }[]

export const GALLERY: ImageName[] = ['cheers', 'coffee-bar', 'spread', 'street', 'friends', 'dining-room', 'pour-over', 'greenhouse', 'brunch-table']

export const SEATING = [
  { id: 'window', label: 'Window', note: 'Sunny, people-watching' },
  { id: 'dining', label: 'Dining room', note: 'Lively, near the grill' },
  { id: 'terrace', label: 'Greenhouse terrace', note: 'Under glass and vines' },
  { id: 'bar', label: 'Bar seats', note: 'Watch the baristas and bartenders' },
] as const
