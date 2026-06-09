/**
 * decoherence.js
 *
 * Quantum decoherence simulation using the Lindblad master equation.
 * Closed-form solutions for common noise channels derived from the
 * Gorini-Kossakowski-Sudarshan-Lindblad (GKSL) formalism.
 *
 * References:
 *   - Nielsen & Chuang, "Quantum Computation and Quantum Information" (2000)
 *   - Preskill, "Lecture Notes on Quantum Computation" Ch.3 (2018)
 *   - IBM Quantum System One hardware specs (2023)
 */

// ─── Fidelity under different noise channels ─────────────────────────────────
// All return F ∈ [0, 1] where F=1 is perfect, F=0.25 is fully depolarized

export function fidelityDepolarizing(t_us, T1, T2) {
  // p(t) = 1 - exp(-t/T2) for phase errors, combined with amplitude decay
  // F = (1/4)(1 + 3*exp(-t/T2)) — general single-qubit depolarizing
  const decay = Math.exp(-t_us / T2)
  return Math.max(0, (1 + 3 * decay) / 4)
}

export function fidelityAmplitudeDamping(t_us, T1) {
  // Amplitude damping: energy relaxation |1⟩ → |0⟩
  // Kraus operators: K0 = [[1,0],[0,√(1-γ)]], K1 = [[0,√γ],[0,0]]
  // γ = 1 - exp(-t/T1)
  // F = (1 + exp(-t/T1)) / 2
  const gamma = 1 - Math.exp(-t_us / T1)
  return Math.max(0, (1 + Math.sqrt(1 - gamma)) / 2)
}

export function fidelityDephasing(t_us, T2) {
  // Pure dephasing (phase-flip channel): no energy loss, only coherence loss
  // Kraus operators: K0 = √((1+p)/2) I, K1 = √((1-p)/2) Z
  // p = exp(-t/T_phi), T_phi ≈ T2 (pure dephasing approximation)
  // F = (1 + exp(-t/T2)) / 2
  const decay = Math.exp(-t_us / T2)
  return Math.max(0, (1 + decay) / 2)
}

export function fidelityThermal(t_us, T1, T2) {
  // Thermal noise: generalized amplitude damping at finite temperature
  // n_th = mean thermal photon number (≈ 0.05 for GHz qubits at 15mK)
  const n_th = 0.05
  const gamma = 1 - Math.exp(-t_us / T1)
  const decay2 = Math.exp(-t_us / T2)
  const p_excited = n_th * gamma
  return Math.max(0, 0.5 * (1 + decay2) - p_excited)
}

export function computeFidelity(t_us, T1, T2, noiseChannel) {
  switch (noiseChannel) {
    case 'depolarizing':     return fidelityDepolarizing(t_us, T1, T2)
    case 'amplitude':        return fidelityAmplitudeDamping(t_us, T1)
    case 'dephasing':        return fidelityDephasing(t_us, T2)
    case 'thermal':          return fidelityThermal(t_us, T1, T2)
    default:                 return fidelityDepolarizing(t_us, T1, T2)
  }
}

// ─── Bloch sphere coordinates ─────────────────────────────────────────────────

export function blochCoords(t_us, T1, T2, noiseChannel, theta0 = Math.PI / 3, phi0 = Math.PI / 6) {
  // State vector |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
  // Under T1/T2 decay:
  //   r(t) = exp(-t/T2) * r(0)    [xy-plane projection]
  //   z(t) = exp(-t/T1) * z(0) + (1-exp(-t/T1)) * z_eq
  const z_eq = noiseChannel === 'thermal' ? -0.05 : 0  // thermal has nonzero equilibrium
  const r0 = Math.sin(theta0)
  const z0 = Math.cos(theta0)

  const T2_eff = Math.min(T2, 2 * T1)  // physical constraint T2 ≤ 2*T1
  const r_t = r0 * Math.exp(-t_us / T2_eff)
  const z_t = z0 * Math.exp(-t_us / T1) + z_eq * (1 - Math.exp(-t_us / T1))

  const theta_t = Math.atan2(r_t, z_t)
  const phi_t = phi0  // phi doesn't decay under longitudinal/transverse noise

  const purity = Math.sqrt(r_t ** 2 + z_t ** 2)  // ≤ 1, =1 for pure state

  return { theta: theta_t, phi: phi_t, r: purity, x: r_t * Math.cos(phi_t), y: r_t * Math.sin(phi_t), z: z_t }
}

// ─── Error rate per gate cycle ────────────────────────────────────────────────

export function gateErrorRate(T1, T2, Tg_ns, noiseChannel) {
  const Tg_us = Tg_ns / 1000
  const F = computeFidelity(Tg_us, T1, T2, noiseChannel)
  return 1 - F
}

// ─── Decay curve data for charting ───────────────────────────────────────────

export function decayCurve(T1, T2, noiseChannel, points = 50) {
  const tMax = T1 * 2.5
  return Array.from({ length: points }, (_, i) => {
    const t = (i / (points - 1)) * tMax
    return {
      t: parseFloat(t.toFixed(2)),
      fidelity: computeFidelity(t, T1, T2, noiseChannel),
    }
  })
}

// ─── Preset hardware profiles (real-world benchmarks) ────────────────────────

export const HARDWARE_PRESETS = {
  ibm_eagle: {
    label: 'IBM Eagle r3',
    T1: 300,
    T2: 150,
    Tg: 35,
    note: '127-qubit processor, ~2023 specs',
  },
  google_sycamore: {
    label: 'Google Sycamore',
    T1: 20,
    T2: 15,
    Tg: 12,
    note: 'Original 53-qubit system',
  },
  google_willow: {
    label: 'Google Willow',
    T1: 100,
    T2: 80,
    Tg: 20,
    note: '105-qubit, sub-threshold ECC demo',
  },
  ionq_aria: {
    label: 'IonQ Aria',
    T1: 100000,
    T2: 50000,
    Tg: 1000,
    note: 'Ion trap — long coherence, slow gates',
  },
  nisq_noisy: {
    label: 'Noisy NISQ',
    T1: 15,
    T2: 8,
    Tg: 50,
    note: 'Early-gen superconducting, pre-2020',
  },
}
