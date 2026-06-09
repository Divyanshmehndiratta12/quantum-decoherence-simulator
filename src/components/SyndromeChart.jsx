import { useEffect, useRef } from 'react'
import { Chart, BarController, BarElement, LinearScale, CategoryScale } from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale)

export default function SyndromeChart({ syndromes, mcResult }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const data = syndromes.length > 0 ? syndromes : []
    const labels = data.map(s => `${s.type}-${s.id}`)
    const values = data.map(s => s.outcome)
    const colors = data.map(s =>
      s.outcome === 0 ? '#16a34a' : s.corrected ? '#d97706' : '#dc2626'
    )

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
    const tickColor = isDark ? '#64748b' : '#94a3b8'

    if (chartRef.current) {
      chartRef.current.data.labels = labels
      chartRef.current.data.datasets[0].data = values
      chartRef.current.data.datasets[0].backgroundColor = colors
      chartRef.current.update('none')
      return
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'syndrome',
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: tickColor,
              font: { family: '"IBM Plex Mono", monospace', size: 9 },
            },
          },
          y: {
            min: 0,
            max: 1,
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { family: '"IBM Plex Mono", monospace', size: 9 },
              stepSize: 1,
              callback: v => v === 0 ? '0' : '1',
            },
          },
        },
      },
    })
  }, [syndromes])

  return (
    <div style={{ position: 'relative', height: 90 }}>
      {syndromes.length === 0 ? (
        <div style={{
          height: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          color: 'var(--c-muted)',
        }}>
          no ecc active — syndromes disabled
        </div>
      ) : (
        <canvas ref={canvasRef} role="img" aria-label="Syndrome measurement outcomes per stabilizer" />
      )}
    </div>
  )
}
