import { useState } from 'react'
import BlochSphere from './components/BlochSphere'
import DecayChart from './components/DecayChart'
import SyndromeChart from './components/SyndromeChart'
import { useSimulator } from './hooks/useSimulator'
import { ECC_CODES } from './simulator/ecc'
import { HARDWARE_PRESETS } from './simulator/decoherence'

const NOISE_CHANNELS = [
  { id: 'depolarizing', label: 'depolarizing' },
  { id: 'amplitude',    label: 'amplitude damping' },
  { id: 'dephasing',    label: 'dephasing' },
  { id: 'thermal',      label: 'thermal' },
]

function fmt(n, decimals = 1) {
  return (n * 100).toFixed(decimals) + '%'
}

export default function App() {
  const sim = useSimulator()
  const [showPresets, setShowPresets] = useState(false)

  const fidelityColor = sim.physF > 0.99
    ? 'var(--c-ok)'
    : sim.physF > 0.95
    ? 'var(--c-warn)'
    : 'var(--c-err)'

  const logFidelityColor = sim.logF > 0.999
    ? 'var(--c-ok)'
    : sim.logF > 0.99
    ? 'var(--c-warn)'
    : 'var(--c-err)'

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--c-muted)', letterSpacing: '0.12em', marginBottom: 6 }}>
              QUANTUM HARDWARE SIMULATION / v1.0.0
            </div>
         </div> <h1
  style={{
    fontSize: 28,
    fontWeight: 500,
    color: 'var(--c-text)',
    fontFamily: 'var(--font-sans)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    marginBottom: 8
  }}
>
  Quantum Decoherence & Error Correction Simulator
</h1>

<div
  style={{
    fontSize: 12,
    color: 'var(--c-info)',
    marginBottom: 8,
    letterSpacing: '0.05em'
  }}
>
  INTERACTIVE QUANTUM HARDWARE ANALYSIS PLATFORM
</div>

<p
  style={{
    marginTop: 0,
    fontSize: 13,
    color: 'var(--c-muted)',
    fontFamily: 'var(--font-sans)',
    maxWidth: 650,
    lineHeight: 1.6
  }}
>
  Explore how decoherence impacts qubit fidelity using
  T₁/T₂ relaxation models, Lindblad noise channels,
  Monte Carlo simulations, and quantum error-correction
  techniques including Steane, Surface, and Shor codes.
</p>  
          </div>
         </header>
      <div
  style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 18px',
    marginBottom: 18
  }}
>
  <div
    style={{
      fontSize: 10,
      color: 'var(--c-info)',
      letterSpacing: '0.08em',
      marginBottom: 10
    }}
  >
    MODEL OVERVIEW
  </div>
  <div
  style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 18px',
    marginBottom: 18
  }}
>
  <div
    style={{
      fontSize: 10,
      color: 'var(--c-info)',
      letterSpacing: '0.08em',
      marginBottom: 12
    }}
  >
    SIMULATION PIPELINE
  </div>

  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      fontSize: 12,
      color: 'var(--c-text)'
    }}
  >
    <span>Hardware Parameters</span>
    <span>→</span>

    <span>Noise Model</span>
    <span>→</span>

    <span>Fidelity Calculation</span>
    <span>→</span>

    <span>ECC Encoding</span>
    <span>→</span>

    <span>Threshold Analysis</span>
  </div>
</div>

  <div
    style={{
      fontSize: 12,
      color: 'var(--c-muted)',
      lineHeight: 1.8
    }}
  >
    This simulator models quantum decoherence using T₁ relaxation and T₂
    dephasing processes. Fidelity decay is evaluated under configurable
    noise channels and compared against fault-tolerant error-correction
    schemes including Steane, Surface, and Shor codes. The simulator
    estimates logical fidelity, threshold behavior, and syndrome outcomes
    using simplified quantum hardware assumptions.
  </div>
</div>
<div
  style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 18px',
    marginBottom: 18
  }}
>
  <div
    style={{
      fontSize: 10,
      color: 'var(--c-info)',
      letterSpacing: '0.08em',
      marginBottom: 12
    }}
  >
    SIMULATION PIPELINE
  </div>

  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      fontSize: 11,
      color: 'var(--c-muted)'
    }}
  >
    <span>Hardware Parameters</span>
    <span>→</span>

    <span>Noise Model</span>
    <span>→</span>

    <span>Fidelity Calculation</span>
    <span>→</span>

    <span>ECC Encoding</span>
    <span>→</span>

    <span>Threshold Analysis</span>
  </div>
</div>
<div
  style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 18px',
    marginBottom: 18
  }}
>
  <div
    style={{
      fontSize: 10,
      color: 'var(--c-info)',
      letterSpacing: '0.08em',
      marginBottom: 10
    }}
  >
    MODEL ASSUMPTIONS
  </div>

  <div
    style={{
      fontSize: 11,
      lineHeight: 1.9,
      color: 'var(--c-muted)'
    }}
  >
    • Markovian noise approximation<br />
    • Independent qubit errors<br />
    • Threshold-based fault tolerance<br />
    • Educational hardware model
  </div>
</div>

      {/* ── Metric strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'physical fidelity', value: fmt(sim.physF, 2), sub: `p_err = ${fmt(sim.physErr, 3)}`, color: fidelityColor },
          { label: 'logical fidelity (ecc)', value: fmt(sim.logF, 3), sub: sim.params.eccCode === 'none' ? 'no correction' : sim.code.name, color: logFidelityColor },
          { label: 'threshold status', value: sim.aboveThreshold ? 'above ↑' : 'below ↓', sub: `p_th = ${fmt(sim.code.threshold, 1)}`, color: sim.aboveThreshold ? 'var(--c-err)' : 'var(--c-ok)' },
        ].map(m => (
          <div key={m.label} style={{
           background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)',
border: `1px solid ${m.color}`,
borderRadius: 'var(--radius)',
padding: '14px 16px',
boxShadow: `0 0 12px ${m.color}20`,
transition: 'all 0.2s ease',
          }}>
            <div style={{ fontSize: 10, color: 'var(--c-muted)', letterSpacing: '0.08em', marginBottom: 4 }}>
              {m.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 30, fontWeight: 400, color: m.color, lineHeight: 1 }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--c-muted)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 16 }}>

        {/* Bloch sphere */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '14px 10px',
        }}>
          <div style={{ fontSize: 10, color: 'var(--c-muted)', letterSpacing: '0.08em', marginBottom: 10 }}>
            BLOCH SPHERE
          </div>
          <BlochSphere bloch={sim.bloch} fidelity={sim.physF} />
        </div>

        {/* Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--c-muted)', letterSpacing: '0.08em' }}>FIDELITY DECAY — T₁/T₂ CHANNELS</div>
              <div style={{ display: 'flex', gap: 14, fontSize: 10, color: 'var(--c-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 1.5, background: 'var(--c-err)', verticalAlign: 'middle', borderTop: '1.5px dashed var(--c-err)' }} />
                  physical
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 1.5, background: 'var(--c-ok)', verticalAlign: 'middle' }} />
                  logical (ecc)
                </span>
              </div>
            </div>
            <DecayChart curve={sim.curve} eccCode={sim.params.eccCode} T1={sim.params.T1} />
            <div
  style={{
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1px dashed var(--border)',
    fontSize: 10,
    color: 'var(--c-muted)',
    lineHeight: 1.8
  }}
>
  <div>T₁ Relaxation: F(t) = exp(-t/T₁)</div>
  <div>T₂ Dephasing: F(t) = exp(-t/T₂)</div>
  <div>Noise Model: Lindblad GKSL Approximation</div>
</div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--c-muted)', letterSpacing: '0.08em' }}>SYNDROME MEASUREMENTS</div>
              <div style={{ fontSize: 10, color: 'var(--c-muted)' }}>
                {sim.params.eccCode !== 'none' ? `${sim.code.syndromeRounds} stabilizers / round` : '—'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--c-muted)', marginBottom: 8 }}>
              <span>● <span style={{ color: 'var(--c-ok)' }}>0</span> no error</span>
              <span>● <span style={{ color: 'var(--c-warn)' }}>1</span> corrected</span>
              <span>● <span style={{ color: 'var(--c-err)' }}>1</span> uncorrected</span>
            </div>
            <SyndromeChart syndromes={sim.syndromes} mcResult={sim.mcResult} />
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Decoherence params */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--c-muted)', letterSpacing: '0.08em' }}>DECOHERENCE PARAMETERS</div>
            <button
              onClick={() => setShowPresets(p => !p)}
              style={{
                fontSize: 10,
                color: 'var(--c-muted)',
                padding: '2px 8px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: showPresets ? 'var(--bg-raised)' : 'transparent',
              }}
            >
              presets ↓
            </button>
          </div>

          {showPresets && (
            <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.values(HARDWARE_PRESETS).map(p => (
                <button
                  key={p.label}
                  onClick={() => { sim.loadPreset(p); setShowPresets(false) }}
                  style={{
                    fontSize: 10,
                    color: 'var(--c-secondary)',
                    padding: '3px 8px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-raised)',
                    textAlign: 'left',
                    lineHeight: 1.5,
                  }}
                >
                  {p.label}
                  <div style={{ color: 'var(--c-muted)', fontSize: 9 }}>{p.note}</div>
                </button>
              ))}
            </div>
          )}
          <div
  style={{
    marginBottom: 14,
    padding: '10px 12px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 11,
    lineHeight: 1.7
  }}
>
  <div
    style={{
      color: 'var(--c-info)',
      fontSize: 10,
      letterSpacing: '0.08em',
      marginBottom: 6
    }}
  >
    CURRENT HARDWARE PROFILE
  </div>

  <div>
    T₁ = {sim.params.T1} μs
  </div>

  <div>
    T₂ = {sim.params.T2} μs
  </div>

  <div>
    Gate Time = {sim.params.Tg} ns
  </div>
</div>

          {[
            { id: 't1', key: 'T1', label: 'T₁  relaxation', min: 10, max: 500, step: 5, unit: 'μs' },
            { id: 't2', key: 'T2', label: 'T₂  dephasing', min: 5, max: 300, step: 5, unit: 'μs' },
            { id: 'tg', key: 'Tg', label: 'Tg  gate time', min: 1, max: 200, step: 1, unit: 'ns' },
          ].map(s => (
            <div key={s.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, color: 'var(--c-secondary)' }}>
                <span>{s.label}</span>
                <span style={{ color: 'var(--c-muted)' }}>{sim.params[s.key]}{s.unit}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={sim.params[s.key]}
                onChange={e => sim.updateParam(s.key, Number(e.target.value))}
              />
            </div>
          ))}

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--c-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>NOISE CHANNEL</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {NOISE_CHANNELS.map(n => (
                <button
                  key={n.id}
                  onClick={() => sim.updateParam('noiseChannel', n.id)}
                  style={{
                    fontSize: 10,
                    padding: '4px 10px',
                    border: `1px solid ${sim.params.noiseChannel === n.id ? 'var(--c-info)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    background: sim.params.noiseChannel === n.id ? 'var(--c-err-bg)' : 'transparent',
                    color: sim.params.noiseChannel === n.id ? 'var(--c-info)' : 'var(--c-muted)',
                  }}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ECC section */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: 'var(--c-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>
            ERROR CORRECTION CODE
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {Object.values(ECC_CODES).map(code => (
              <button
                key={code.id}
                onClick={() => sim.updateParam('eccCode', code.id)}
                style={{
                  fontSize: 10,
                  padding: '4px 10px',
                  border: `1px solid ${sim.params.eccCode === code.id ? 'var(--c-ok)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: sim.params.eccCode === code.id ? 'var(--c-ok-bg)' : 'transparent',
                  color: sim.params.eccCode === code.id ? 'var(--c-ok)' : 'var(--c-muted)',
                }}
              >
                {code.name}
              </button>
            ))}
          </div>

          <div style={{
            fontSize: 11,
            color: 'var(--c-secondary)',
            lineHeight: 1.7,
            marginBottom: 14,
            fontFamily: 'var(--font-sans)',
            borderLeft: '2px solid var(--border)',
            paddingLeft: 10,
          }}>
            {sim.code.description}
          </div>
          <div
  style={{
    marginTop: 12,
    padding: '12px',
    background: 'var(--bg-raised)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)'
  }}
>
  <div
    style={{
      fontSize: 10,
      color: 'var(--c-info)',
      letterSpacing: '0.08em',
      marginBottom: 8
    }}
  >
    CODE STRUCTURE
  </div>

  <div
    style={{
      fontSize: 11,
      lineHeight: 1.8
    }}
  >
    <div>n = {sim.code.physicalQubits} physical qubits</div>
    <div>k = {sim.code.logicalQubits} logical qubit</div>
    <div>d = {sim.code.distance} code distance</div>
    <div>
  Error Capacity: {Math.floor((sim.code.distance - 1) / 2)} Correctable Error
</div>

    <div
      style={{
        marginTop: 8,
        color: 'var(--c-muted)'
      }}
    >
      Notation: [n,k,d]
    </div>
  </div>
</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'physical qubits', value: sim.code.physicalQubits + '×' },
              { label: 'code distance', value: 'd=' + sim.code.distance },
              { label: 'p threshold', value: fmt(sim.code.threshold, 1) },
              { label: 'ecc gain', value: sim.eccGain >= 0 ? '+' + fmt(sim.eccGain, 3) : fmt(sim.eccGain, 3) },
            ].map(m => (
              <div key={m.label} style={{
                background: 'var(--bg-raised)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
              }}>
                <div style={{ fontSize: 9, color: 'var(--c-muted)', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {m.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 14, color: 'var(--c-text)' }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Monte Carlo run button ── */}
      <button
        onClick={sim.runMonteCarlo}
        disabled={sim.isRunning}
        style={{
          width: '100%',
          padding: '10px 0',
          fontSize: 12,
          letterSpacing: '0.04em',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius)',
          background: sim.isRunning ? 'var(--bg-raised)' : 'var(--bg-card)',
          color: sim.isRunning ? 'var(--c-muted)' : 'var(--c-secondary)',
          marginBottom: 12,
          transition: 'background 0.15s',
        }}
      >
        {sim.isRunning ? '⏳  simulating 1024 shots...' : '▸  run monte carlo simulation (1024 shots)'}
      </button>

      {/* MC result strip */}
      {sim.mcResult && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginBottom: 12,
          fontSize: 11,
        }}>
          {[
            { label: 'shots', value: sim.mcResult.shots },
            { label: 'physical errors', value: sim.mcResult.rawErrors },
            { label: 'logical errors', value: sim.mcResult.logicalErrors },
            { label: 'suppression', value: sim.mcResult.rawErrors > 0 ? ((1 - sim.mcResult.logicalErrors / sim.mcResult.rawErrors) * 100).toFixed(0) + '%' : 'n/a' },
          ].map(m => (
            <div key={m.label} style={{
              background: 'var(--bg-raised)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 9, color: 'var(--c-muted)', letterSpacing: '0.06em', marginBottom: 2 }}>
                {m.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 15 }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── System Events ── */}
      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 14px',
        maxHeight: 120,
        overflowY: 'auto',
        fontSize: 11,
      }}><div
  style={{
    fontSize: 10,
    color: 'var(--c-info)',
    letterSpacing: '0.08em',
    marginBottom: 10
  }}
>
  SYSTEM EVENTS
</div>
        {sim.logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, lineHeight: 1.9 }}>
            <span style={{ color: 'var(--c-muted)', minWidth: 64 }}>{log.t}</span>
            <span style={{
              color: log.type === 'ok' ? 'var(--c-ok)'
                : log.type === 'warn' ? 'var(--c-warn)'
                : log.type === 'err' ? 'var(--c-err)'
                : 'var(--c-secondary)',
            }}>
              {log.msg}
            </span>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer
      
  style={{
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)',
    fontSize: 11,
    color: 'var(--c-muted)',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8
    
  }}
>
  <div>
    Quantum Decoherence & Error Correction Simulator
    <br />
    <span style={{ fontSize: 10 }}>
      Built with React, Vite and Chart.js
    </span>
  </div>

  <div style={{ textAlign: 'right' }}>
    <div>Created by Divyansh Mehndiratta</div>
    <div>
      Quantum Computing • Error Correction • Noise Simulation
    </div>
    <div
  style={{
    marginTop: 12,
    fontSize: 10,
    color: 'var(--c-muted)',
    lineHeight: 1.8
  }}
>
  <div>References</div>
  <div>Nielsen & Chuang (2000)</div>
  <div>Steane PRL 77 (1996)</div>
  <div>Fowler PRA 86 (2012)</div>
</div>
  </div>
</footer>
    </div>
  )
}
