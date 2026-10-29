import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { answer, type Reply } from '../lib/assistant'
import { useCart } from '../lib/cart'
import { money } from '../lib/format'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { Check, MessageCircle, Plus, Send, X } from './icons'

type Msg = ({ from: 'bot' } & Reply) | { from: 'guest'; text: string }

const SUGGESTIONS = ['Table for 4 tomorrow at 7pm', 'What is gluten-free?', 'Are you open now?', 'Do you deliver?']

export default function Assistant() {
  const { add, open: cartOpen } = useCart()
  const [open, setOpen] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [added, setAdded] = useState<string[]>([])
  const [messages, setMessages] = useState<Msg[]>([{ from: 'bot', text: 'Hi, I am Mia, the host at Ember. I can book you a table, check the menu or start an order. What can I do for you?' }])
  const list = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // A small hello bubble after a while, once per visit.
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('ember-chat-teaser') === '1'
    } catch {
      /* ignore */
    }
    if (seen) return
    const id = window.setTimeout(() => {
      setTeaser(true)
      try {
        sessionStorage.setItem('ember-chat-teaser', '1')
      } catch {
        /* ignore */
      }
    }, 9000)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (!open) return
    setTeaser(false)
    inputRef.current?.focus()
    if (!prefersReducedMotion()) gsap.fromTo(panel.current, { y: 30, opacity: 0, scale: 0.96, transformOrigin: '100% 100%' }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function ask(text: string) {
    const clean = text.trim()
    if (!clean || typing) return
    setMessages((m) => [...m, { from: 'guest', text: clean }])
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', ...answer(clean) }])
      setTyping(false)
    }, 650 + Math.random() * 500)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    ask(input)
  }

  // Out of the way while the order drawer is open.
  if (cartOpen) return null

  return (
    <>
      {teaser && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[9.5rem] right-5 z-40 max-w-[16rem] animate-float rounded-2xl rounded-br-sm bg-surface p-4 text-left text-sm text-ink shadow-2xl ring-1 ring-line"
        >
          <span className="font-semibold">Hi, I am Mia.</span> Want a table tonight? I can book it in one message.
        </button>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_14px_34px_-10px_var(--accent)] transition-transform hover:scale-110"
        aria-label={open ? 'Close chat with Mia' : 'Chat with Mia, our host'}
        aria-expanded={open}
      >
        {open ? <X /> : <MessageCircle />}
        {!open && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-bg bg-[#5ccf7a]" />}
      </button>

      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label="Chat with Mia"
          data-lenis-prevent
          className="fixed inset-x-3 bottom-24 z-50 flex max-h-[72dvh] flex-col overflow-hidden rounded-[1.75rem] bg-surface text-ink shadow-2xl ring-1 ring-line sm:inset-x-auto sm:right-5 sm:w-[400px]"
        >
          <div className="flex items-center gap-3 bg-accent px-5 py-4 text-accent-ink">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface font-display text-lg text-accent">
              M
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-accent bg-[#5ccf7a]" />
            </span>
            <div>
              <p className="text-sm font-semibold">Mia · AI host</p>
              <p className="text-xs opacity-75">Bookings, menu & orders, instantly</p>
            </div>
          </div>

          <div ref={list} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'guest' ? 'justify-end' : ''}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === 'guest' ? 'rounded-br-sm bg-accent text-accent-ink' : 'rounded-bl-sm bg-muted'}`}>
                  {m.text}
                  {m.from === 'bot' && m.link && (
                    <Link to={m.link.to} onClick={() => setOpen(false)} className="mt-2 block font-semibold text-accent underline underline-offset-4">
                      {m.link.label} →
                    </Link>
                  )}
                  {m.from === 'bot' && m.dish && (
                    <button
                      type="button"
                      disabled={added.includes(`${i}`)}
                      onClick={() => {
                        add({ id: m.dish!.id, name: m.dish!.name, price: m.dish!.price, img: m.dish!.img })
                        setAdded((a) => [...a, `${i}`])
                      }}
                      className="chip mt-3 !bg-surface"
                    >
                      {added.includes(`${i}`) ? (
                        <>
                          <Check size={14} /> Added to your order
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> Add to order · {money(m.dish.price)}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex w-16 gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3" aria-label="Mia is typing">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-soft/60" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>

          {messages.length < 3 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-line px-3 py-1.5 text-xs hover:border-ink">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="flex gap-2 border-t border-line p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tables, menu, hours…"
              className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              aria-label="Your message"
            />
            <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink disabled:opacity-40" disabled={!input.trim() || typing} aria-label="Send">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
