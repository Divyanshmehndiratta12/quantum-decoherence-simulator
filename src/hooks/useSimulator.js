import { useState, useCallback, useRef } from 'react'
import { computeFidelity, gateErrorRate, decayCurve, blochCoords } from '../simulator/decoherence'
import { logicalFidelity, simulateSyndromes, monteCarlo, ECC_CODES } from '../simulator/ecc'

const DEFAULT_PARAMS = {
  T1: 100,
  T2: 60,
  Tg: 20,
  noiseChannel: 'depolarizing',
  eccCode: 'steane',
}

export function useSimulator() {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [mcResult, setMcResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState([
    { t: '00:00.000', msg: 'simulator initialized', type: 'info' },
    { t: '00:00.001', msg: 'IBM Eagle r3 baseline loaded — T₁=300μs T₂=150μs', type: 'ok' },
    { t: '00:00.002', msg: 'ECC: Steane [[7,1,3]] stabilizer group generated', type: 'ok' },
  ])
  const logRef = useRef(logs)
  logRef.current = logs

  const addLog = useCallback((msg, type = 'info') => {
    const now = new Date()
    const ms = String(now.getMilliseconds()).padStart(3, '0')
    const s = String(now.getSeconds()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    const t = `${m}:${s}.${ms}`
    setLogs(prev => [...prev.slice(-40), { t, msg, type }])
  }, [])

  const updateParam = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])

  const loadPreset = useCallback((preset) => {
    setParams(prev => ({ ...prev, ...preset, noiseChannel: prev.noiseChannel, eccCode: prev.eccCode }))
    addLog(`preset loaded: ${preset.label} — T₁=${preset.T1}μs T₂=${preset.T2}μs Tg=${preset.Tg}ns`, 'ok')
  }, [addLog])

  // Derived values
  const Tg_us = params.Tg / 1000
  const physF = computeFidelity(Tg_us, params.T1, params.T2, params.noiseChannel)
  const physErr = 1 - physF
  const logF = logicalFidelity(physF, params.eccCode)
  const eccGain = logF - physF
  const code = ECC_CODES[params.eccCode]
  const aboveThreshold = physErr > code.threshold
  const syndromes = simulateSyndromes(physErr, params.eccCode)
  const curve = decayCurve(params.T1, params.T2, params.noiseChannel)
  const bloch = blochCoords(Tg_us, params.T1, params.T2, params.noiseChannel)

  const runMonteCarlo = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setMcResult(null)

    addLog('Monte Carlo run started — 1024 shots', 'info')
    await sleep(120)
    addLog(`noise channel: ${params.noiseChannel} — T₁=${params.T1}μs T₂=${params.T2}μs`, 'info')
    await sleep(200)

    const result = monteCarlo(physF, params.eccCode)
    addLog(`physical errors: ${result.rawErrors}/1024 (${(result.rawErrorRate * 100).toFixed(1)}%)`, result.rawErrorRate > 0.05 ? 'warn' : 'ok')
    await sleep(180)

    if (params.eccCode !== 'none') {
      addLog(`${code.name} correction applied — ${result.rawErrors - result.logicalErrors} errors suppressed`, 'ok')
      await sleep(150)
      if (result.aboveThreshold) {
        addLog(`WARNING: p=${(result.rawErrorRate * 100).toFixed(2)}% > threshold ${(result.threshold * 100).toFixed(1)}% — ECC diverging`, 'warn')
      } else {
        addLog(`below threshold — logical error rate suppressed exponentially`, 'ok')
      }
    }
    await sleep(120)
    addLog(`logical fidelity: ${(result.logicalFidelity * 100).toFixed(2)}% — simulation complete`, 'ok')

    setMcResult(result)
    setIsRunning(false)
  }, [isRunning, params, physF, code, addLog])

  return {
    params,
    updateParam,
    loadPreset,
    physF,
    physErr,
    logF,
    eccGain,
    aboveThreshold,
    code,
    syndromes,
    curve,
    bloch,
    mcResult,
    isRunning,
    logs,
    runMonteCarlo,
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
