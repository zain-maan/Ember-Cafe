// Downloads the site's photos once from Unsplash as resized AVIF + WebP files into public/images,
// plus a tiny blurred preview of each (src/lqip.json) shown while the real photo loads.
// Usage: npm run images   (already-downloaded files are skipped)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const PHOTOS = {
  // Places and people
  'hero-day': '1554118811-1e0d58224f24',
  'hero-night': '1414235077428-338989a2e8c0',
  'coffee-bar': '1453614512568-c4024d13c247',
  'dining-room': '1517248135467-4c7edcad34c4',
  greenhouse: '1600093463592-8e36ae95ef56',
  street: '1559925393-8be0ec4767c8',
  'pour-over': '1442512595331-e89e73853f31',
  beans: '1447933601403-0c6688de566e',
  cheers: '1495474472287-4d71bcdd2085',
  chef: '1577219491135-ce391730fb2c',
  'fire-kitchen': '1600565193348-f74bd3c7ccdf',
  friends: '1592861956120-e524fc739696',
  'brunch-table': '1424847651672-bf20a4b0982b',
  espresso: '1511920170033-f8396924c348',
  spread: '1504674900247-0877df9cc836',
  'latte-pour': '1541167760496-1628856ab772',
  'window-seat': '1445116572660-236099ec97a0',
  'bakery-case': '1517433670267-08bbd4be890f',
  'counter-chat': '1556742049-0cfed4f6a45d',
  'brunch-spread': '1504754524776-8f4f37790ca0',
  'bright-counter': '1442975631115-c4f7b05b8a2c',
  'evening-diner': '1533777857889-4be7c70b33f7',
  'night-bar': '1514933651103-005eec06c04b',
  'night-terrace': '1579027989536-b7b1f875659b',
  'busy-cafe': '1525610553991-2bede1a236e2',
  'berry-brunch': '1495214783159-3503fd1b572d',
  'croissant-table': '1528699633788-424224dc89b5',
  'cup-steam': '1497515114629-f71d768fd07c',
  'latte-top': '1497636577773-f1231844b336',
  'cup-circle': '1498804103079-a6351b050096',
  // Menu
  'flat-white': '1572442388796-11668a67e53d',
  latte: '1509042239860-f550ce710b93',
  matcha: '1515823064-d6e0c04616a7',
  'iced-latte': '1461023058943-07fcbe16d735',
  'cold-brew': '1517701604599-bb29b565090c',
  'long-black': '1514432324607-a09d9b4aefdd',
  croissant: '1555507036-ab1f4038808a',
  'french-toast': '1484723091739-30a097e8f929',
  pancakes: '1567620905732-2d1ec7ab7445',
  'egg-toast': '1525351484163-7529414344d8',
  'garden-bowl': '1512621776951-a57141f2eefd',
  toastie: '1528735602780-2552fd46c7af',
  'salmon-bowl': '1546069901-ba9599a7e63c',
  burger: '1551782450-a2132b4ba21d',
  'steak-frites': '1600891964092-4316c288032e',
  ribs: '1544025162-d76694265947',
  rigatoni: '1621996346565-e3dbc646d9a9',
  farfalle: '1473093295043-cdd812d0e601',
  pizza: '1565299624946-b28f40a0ae38',
  skewers: '1555939594-58d7cb561ad1',
  'citrus-salad': '1540189549336-e6e99c3679fe',
  brownie: '1606313564200-e75d5e30476c',
  'mud-cake': '1578985545062-69928b1d9587',
  'berry-pots': '1488477181946-6428a0291777',
  sundae: '1563805042-7684c019e1cb',
  'old-fashioned': '1470337458703-46ad1756a187',
  'smoked-negroni': '1514362545857-3bc16c4c7d1b',
  // Guest portraits (reviews)
  'guest-1': '1494790108377-be9c29b29330',
  'guest-2': '1500648767791-00dcc994a43e',
  'guest-3': '1438761681033-6461ffad8d80',
  'guest-4': '1507003211169-0a1dd7228f2d',
}

// Keep in sync with imageWidths() in src/components/Img.tsx.
const widthsFor = (name) => (name.startsWith('hero') ? [960, 1920] : name.startsWith('guest') ? [160] : [640, 1280])

const outDir = new URL('../public/images/', import.meta.url)
mkdirSync(outDir, { recursive: true })

async function get(url, tries = 5) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(120_000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (err) {
      console.log(`  retry ${i}/${tries} ${url.slice(34, 70)}: ${err.message}`)
      await new Promise((r) => setTimeout(r, 2000 * i))
    }
  }
  throw new Error(`failed: ${url}`)
}

async function fetchPhoto(name, id) {
  const crop = name.startsWith('guest') ? '&fit=crop&h=160&crop=faces' : '&fit=crop'
  const base = `https://images.unsplash.com/photo-${id}?auto=format${crop}`
  for (const w of widthsFor(name)) {
    for (const fm of ['avif', 'webp']) {
      const file = new URL(`${name}-${w}.${fm}`, outDir)
      if (existsSync(file)) continue
      writeFileSync(file, await get(`${base}&fm=${fm}&w=${w}&q=${w > 1000 ? 62 : 70}`))
    }
  }
  const tiny = await get(`${base}&fm=webp&w=24&q=40&blur=40`)
  console.log(`saved ${name}`)
  return [name, `data:image/webp;base64,${tiny.toString('base64')}`]
}

// A few downloads at a time keeps Unsplash happy and is still quick.
const entries = Object.entries(PHOTOS)
const lqip = {}
for (let i = 0; i < entries.length; i += 6) {
  const batch = await Promise.all(entries.slice(i, i + 6).map(([n, id]) => fetchPhoto(n, id)))
  for (const [n, data] of batch) lqip[n] = data
}
writeFileSync(new URL('../src/lqip.json', import.meta.url), JSON.stringify(lqip, null, 2) + '\n')
console.log("DONE. Now run: python scripts/make-lqip.py")
