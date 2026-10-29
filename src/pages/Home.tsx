import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Customizer from '../components/Customizer'
import Hero from '../components/Hero'
import { ArrowRight, Star } from '../components/icons'
import Img from '../components/Img'
import Marquee from '../components/Marquee'
import MoodSplit from '../components/MoodSplit'
import QuickReserve from '../components/QuickReserve'
import Reviews from '../components/Reviews'
import Signatures from '../components/Signatures'
import { BRAND, GALLERY, STATS } from '../data'
import { useReveal } from '../hooks/useReveal'

export default function Home() {
  const page = useRef<HTMLDivElement>(null)
  useReveal(page)

  return (
    <div ref={page}>
      <Hero />
      <div className="relative z-10 -mt-4">
        <Marquee />
      </div>

      {/* Two moods */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p data-reveal className="eyebrow">
              One address, two moods
            </p>
            <h2 data-split className="mt-5 font-display text-5xl leading-[0.98] sm:text-7xl">
              Espresso at <span className="italic-wonk text-accent">seven,</span> embers at seven.
            </h2>
          </div>
          <p data-reveal="0.1" className="max-w-md text-lg leading-relaxed text-soft lg:justify-self-end">
            We are a neighbourhood café in the morning and a fire-cooked kitchen at night. Tap a side to switch the whole website, menu included.
          </p>
        </div>
        <div data-reveal="0.15">
          <MoodSplit />
        </div>
      </section>

      <Signatures />

      {/* Customiser */}
      <section id="build" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <Customizer />
      </section>

      {/* Story + stats */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div data-reveal-img className="aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Img name="pour-over" sizes="(min-width: 1024px) 45vw, 100vw" className="h-full w-full object-cover" />
            </div>
            <div data-speed="-0.25" className="absolute -bottom-10 -right-4 w-[46%] overflow-hidden rounded-[1.5rem] border-8 border-bg shadow-2xl sm:-right-10">
              <Img name="beans" sizes="25vw" className="aspect-square h-full w-full object-cover" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p data-reveal className="eyebrow">
              Our story
            </p>
            <h2 data-split className="mt-5 font-display text-5xl leading-[1] sm:text-6xl">
              Started with <span className="italic-wonk text-accent">six seats</span> and one very loud grinder.
            </h2>
            <p data-words className="mt-6 text-xl leading-relaxed sm:text-2xl">
              {BRAND.name} opened on Gertrude Street in 2017. Today we roast every bean in the back room, bake from 4 am, and light the grill when the sun goes down. Same people, same corner, a lot more chairs.
            </p>
            <Link data-reveal="0.2" to="/about" className="btn btn-ghost mt-8 self-start">
              Read our story <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <dl className="mt-28 grid grid-cols-2 border-t border-line lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} data-reveal={i * 0.08} className={`border-line py-8 pr-4 ${i % 2 ? 'pl-6 border-l' : ''} lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0`}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span data-count={s.value} className="font-display text-6xl sm:text-7xl">
                  {s.value}
                </span>
                <span className="text-accent">{s.value === '4.9' ? '★' : '+'}</span>
                <p className="mt-2 max-w-[14rem] text-sm text-soft">{s.label}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Reviews */}
      <section className="overflow-hidden bg-muted py-24 sm:py-28">
        <div className="mx-auto mb-12 flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p data-reveal className="eyebrow">
              Word on Gertrude Street
            </p>
            <h2 data-split className="mt-5 font-display text-5xl leading-[1] sm:text-6xl">
              2,300 reviews, <span className="italic-wonk text-accent">one</span> theme.
            </h2>
          </div>
          <div data-reveal="0.1" className="flex items-center gap-4">
            <span className="font-display text-6xl">4.9</span>
            <div>
              <div className="flex text-honey">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-soft">Google · TripAdvisor · Instagram</p>
            </div>
          </div>
        </div>
        <Reviews />
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 data-split className="font-display text-5xl leading-[1] sm:text-6xl">
            Life at <span className="italic-wonk text-accent">{BRAND.name}</span>
          </h2>
          <p data-reveal className="text-soft">
            Tag us {BRAND.instagram}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {[0, 1, 2].map((col) => (
            <div key={col} data-speed={col === 1 ? '-0.12' : '0.08'} className={`space-y-4 lg:space-y-6 ${col === 2 ? 'hidden lg:block' : ''} ${col === 1 ? 'pt-10' : ''}`}>
              {GALLERY.slice(col * 3, col * 3 + 3).map((img, i) => (
                <div key={img} data-reveal-img={i * 0.1} className={`overflow-hidden rounded-[1.5rem] ${i === 1 ? 'aspect-[3/4]' : 'aspect-square'}`}>
                  <Img name={img} sizes="(min-width: 1024px) 30vw, 50vw" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Reserve CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] text-cream">
          <Img name="friends" sizes="100vw" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0805]/90 via-[#0d0805]/70 to-[#0d0805]/40" />
          <div className="relative px-6 py-20 sm:px-12 sm:py-28 lg:px-20">
            <p data-reveal className="eyebrow !text-honey">
              Reservations
            </p>
            <h2 data-split className="mt-5 max-w-3xl font-display text-5xl leading-[1] sm:text-7xl">
              Save a seat. <span className="italic-wonk text-honey">We will light a candle.</span>
            </h2>
            <p data-reveal="0.1" className="mt-5 max-w-lg text-cream/75">
              Book brunch, dinner or the greenhouse terrace in under a minute. Groups of 10+ get a set menu.
            </p>
            <div data-reveal="0.2" className="mt-10 max-w-4xl">
              <QuickReserve />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
