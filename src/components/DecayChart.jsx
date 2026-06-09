import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'
import { logicalFidelity } from '../simulator/ecc'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

export default function DecayChart({ curve, eccCode, T1 }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
    const tickColor = isDark ? '#64748b' : '#94a3b8'

    const labels = curve.map(p => p.t % 50 === 0 || curve.indexOf(p) === 0 ? `${p.t}` : '')
    const rawData = curve.map(p => parseFloat((p.fidelity * 100).toFixed(2)))
    const eccData = curve.map(p => parseFloat((logicalFidelity(p.fidelity, eccCode) * 100).toFixed(2)))

    if (chartRef.current) {
      chartRef.current.data.labels = labels
      chartRef.current.data.datasets[0].data = rawData
      chartRef.current.data.datasets[1].data = eccData
      chartRef.current.update('none')
      return
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Physical fidelity',
            data: rawData,
            borderColor: '#dc2626',
            borderWidth: 1.5,
            borderDash: [4, 3],
            pointRadius: 0,
            tension: 0.35,
            fill: false,
          },
          {
            label: 'Logical fidelity (ECC)',
            data: eccData,
            borderColor: '#16a34a',
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.35,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
            titleColor: isDark ? '#94a3b8' : '#475569',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            titleFont: { family: '"IBM Plex Mono", monospace', size: 10 },
            bodyFont: { family: '"IBM Plex Mono", monospace', size: 11 },
            callbacks: {
              title: (items) => `t = ${curve[items[0].dataIndex]?.t}μs`,
              label: (item) => `${item.dataset.label}: ${item.raw.toFixed(2)}%`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { family: '"IBM Plex Mono", monospace', size: 9 },
              maxTicksLimit: 8,
            },
            title: {
              display: true,
              text: 'time (μs)',
              color: tickColor,
              font: { family: '"IBM Plex Mono", monospace', size: 9 },
            },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { family: '"IBM Plex Mono", monospace', size: 9 },
              callback: (v) => v + '%',
            },
          },
        },
      },
    })
  }, [curve, eccCode, T1])

  return (
    <div style={{ position: 'relative', height: 130 }}>
      <canvas ref={canvasRef} role="img" aria-label="Fidelity decay curves over time" />
    </div>
  )
}
