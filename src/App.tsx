import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Assistant from './components/Assistant'
import BackToTop from './components/BackToTop'
import CartDrawer from './components/CartDrawer'
import Cursor from './components/Cursor'
import Curtain from './components/Curtain'
import Footer from './components/Footer'
import Nav from './components/Nav'
import ScrollProgress from './components/ScrollProgress'
import { useMode } from './lib/mode'
import { ScrollTrigger, scrollToTop, startSmoothScroll, startVelocitySkew } from './lib/motion'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Inner pages load on demand so the home page arrives faster.
const About = lazy(() => import('./pages/About'))
const MenuPage = lazy(() => import('./pages/Menu'))
const Order = lazy(() => import('./pages/Order'))
const Reserve = lazy(() => import('./pages/Reserve'))

export default function App() {
  const { pathname } = useLocation()
  const { mode } = useMode()

  useEffect(() => startSmoothScroll(), [])
  useEffect(() => startVelocitySkew(), [])

  useLayoutEffect(() => {
    scrollToTop()
    // Let the new page render before ScrollTrigger measures it.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  // Content swaps with the mood (dishes, copy), so pinned sections need re-measuring.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => window.clearTimeout(id)
  }, [mode])

  return (
    <>
      <a href="#main" className="btn btn-ink sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/order" element={<Order />} />
            <Route path="/reserve" element={<Reserve />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <Assistant />
      <BackToTop />
      <ScrollProgress />
      <Curtain />
      <Cursor />
    </>
  )
}
