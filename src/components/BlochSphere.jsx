import { useEffect, useRef } from 'react'

export default function BlochSphere({ bloch, fidelity }) {
  const canvasRef = useRef(null)
  const phiRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 200, H = 200
    const cx = 100, cy = 100, R = 72

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    // Colors
    const fg = isDark ? 'rgba(203,213,225,0.35)' : 'rgba(51,65,85,0.3)'
    const fgLine = isDark ? 'rgba(203,213,225,0.55)' : 'rgba(51,65,85,0.5)'
    const stateColor = fidelity > 0.95 ? '#16a34a' : fidelity > 0.85 ? '#d97706' : '#dc2626'
    const trailColor = fidelity > 0.95
      ? 'rgba(22,163,74,0.12)'
      : fidelity > 0.85 ? 'rgba(217,119,6,0.12)' : 'rgba(220,38,38,0.12)'

    function draw() {
      ctx.clearRect(0, 0, W, H)
      phiRef.current += 0.008

      const theta = bloch.theta
      const phi = phiRef.current
      const r = bloch.r * R

      // Sphere outline
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = fg
      ctx.lineWidth = 0.75
      ctx.stroke()

      // Equator (ellipse approximation)
      ctx.beginPath()
      ctx.ellipse(cx, cy, R, R * 0.22, 0, 0, Math.PI * 2)
      ctx.strokeStyle = fg
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Dashed meridian
      ctx.save()
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      ctx.ellipse(cx, cy, R * 0.22, R, 0, 0, Math.PI * 2)
      ctx.strokeStyle = fg
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.restore()

      // Axes
      const axes = [
        { dx: 0, dy: -(R + 14), label: '|0⟩', anchor: 'center' },
        { dx: 0, dy: (R + 14), label: '|1⟩', anchor: 'center' },
        { dx: (R + 14), dy: 0, label: '|+⟩', anchor: 'start' },
      ]
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.fillStyle = fgLine
      axes.forEach(({ dx, dy, label, anchor }) => {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + dx * 0.78, cy + dy * 0.78)
        ctx.strokeStyle = fg
        ctx.lineWidth = 0.75
        ctx.setLineDash([2, 3])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.textAlign = anchor
        ctx.fillText(label, cx + dx, cy + dy + 3)
      })

      // Decoherence halo — shows purity (r ≤ 1)
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2)
      ctx.strokeStyle = trailColor
      ctx.lineWidth = 14
      ctx.stroke()

      // State vector
      const sx = cx + r * Math.sin(theta) * Math.cos(phi)
      const sy = cy - r * Math.cos(theta)

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(sx, sy)
      ctx.strokeStyle = stateColor
      ctx.lineWidth = 1.75
      ctx.setLineDash([])
      ctx.stroke()

      // Arrowhead
      const angle = Math.atan2(sy - cy, sx - cx)
      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(-6, -3)
      ctx.lineTo(0, 0)
      ctx.lineTo(-6, 3)
      ctx.strokeStyle = stateColor
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()

      // State dot
      ctx.beginPath()
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = stateColor
      ctx.fill()

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = fg
      ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [bloch, fidelity])

  const thetaDeg = Math.round((bloch.theta * 180) / Math.PI)
  const purity = (bloch.r * 100).toFixed(0)

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        style={{ display: 'block', margin: '0 auto' }}
        aria-label="Animated Bloch sphere showing qubit state vector"
      />
      <div style={{ marginTop: 8, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: 'var(--c-muted)' }}>
        <div>|ψ⟩ = α|0⟩ + e<sup>iφ</sup>β|1⟩</div>
        <div style={{ marginTop: 3 }}>
          θ={thetaDeg}° &nbsp;·&nbsp; purity={purity}%
        </div>
      </div>
    </div>
  )
}
