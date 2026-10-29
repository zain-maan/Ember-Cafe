import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// Soft wisps of steam (by day) or smoke (by night) curling up over the hero photo.
// One full-screen WebGL quad with a noise shader: no library, ~2 kB, paused while off screen.
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `
precision mediump float;
uniform vec2 res;
uniform float t;
uniform vec2 mouse;
uniform vec3 tint;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / res;
  vec2 p = vec2(uv.x * res.x / res.y, uv.y);
  // The pointer gently pushes the steam sideways.
  float push = (mouse.x - 0.5) * 0.35 * smoothstep(0.0, 1.0, uv.y);
  vec2 q = vec2(p.x * 1.6 - push, p.y * 1.1 - t * 0.09);
  float warp = fbm(q + fbm(q * 1.7 + t * 0.05));
  float plumes = smoothstep(0.42, 0.95, fbm(vec2(q.x * 1.3 + warp * 1.4, q.y + warp)));
  // Strongest low on the frame, fading out towards the top and the far edges.
  // (smoothstep needs edge0 < edge1, so the falling edges are written as 1 - smoothstep.)
  float fade = (1.0 - smoothstep(0.15, 1.05, uv.y)) * smoothstep(0.0, 0.25, uv.x) * (1.0 - smoothstep(0.75, 1.0, uv.x));
  float a = clamp(plumes * fade * 0.4, 0.0, 1.0);
  gl_FragColor = vec4(tint * a, a);
}
`

export default function Steam({ tint }: { tint: [number, number, number] }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const tintRef = useRef(tint)
  tintRef.current = tint

  useEffect(() => {
    const el = canvas.current!
    if (prefersReducedMotion()) return
    const gl = el.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) return

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const u = { res: gl.getUniformLocation(prog, 'res'), t: gl.getUniformLocation(prog, 't'), mouse: gl.getUniformLocation(prog, 'mouse'), tint: gl.getUniformLocation(prog, 'tint') }

    // Half resolution is plenty for something this soft, and keeps phones cool.
    const scale = Math.min(window.devicePixelRatio, 1.5) * 0.5
    const resize = () => {
      el.width = Math.max(1, Math.round(el.clientWidth * scale))
      el.height = Math.max(1, Math.round(el.clientHeight * scale))
      gl.viewport(0, 0, el.width, el.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const mouse = { x: 0.5, tx: 0.5 }
    const onMove = (e: PointerEvent) => (mouse.tx = e.clientX / window.innerWidth)
    window.addEventListener('pointermove', onMove, { passive: true })

    let visible = true
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(el)

    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) return
      mouse.x += (mouse.tx - mouse.x) * 0.04
      gl.uniform2f(u.res, el.width, el.height)
      gl.uniform1f(u.t, (now - start) / 1000)
      gl.uniform2f(u.mouse, mouse.x, 0.5)
      gl.uniform3f(u.tint, ...tintRef.current)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      // No loseContext(): React StrictMode re-runs this effect on the same canvas, which would get the dead context back.
      gl.deleteProgram(prog)
    }
  }, [])

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
}
