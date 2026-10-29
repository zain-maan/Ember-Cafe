import { REVIEWS } from '../data'
import { Star } from './icons'
import Img from './Img'

function Row({ items, reverse }: { items: typeof REVIEWS; reverse?: boolean }) {
  const loop = [...items, ...items]
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul className={`flex w-max gap-5 pr-5 hover:[animation-play-state:paused] ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`}>
        {loop.map((r, i) => (
          <li key={i} aria-hidden={i >= items.length} className="card w-[320px] shrink-0 p-6 sm:w-[380px]">
            <div className="flex gap-0.5 text-honey" aria-label="5 out of 5 stars">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="mt-4 font-display text-lg leading-snug">“{r.text}”</p>
            <div className="mt-5 flex items-center gap-3">
              <Img name={r.img} sizes="40px" className="h-10 w-10 rounded-full object-cover" />
              <div className="text-sm">
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-soft">via {r.source}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Two belts of reviews drifting in opposite directions. Hover to pause and read.
export default function Reviews() {
  return (
    <div className="space-y-5">
      <Row items={REVIEWS.slice(0, 3)} />
      <Row items={REVIEWS.slice(3)} reverse />
    </div>
  )
}
