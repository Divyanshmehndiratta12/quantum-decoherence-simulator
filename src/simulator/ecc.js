/**
 * ecc.js
 *
 * Quantum Error Correction code models.
 * Implements threshold theorem analysis, syndrome decoding,
 * and logical fidelity estimation for Steane, Surface, and Shor codes.
 *
 * References:
 *   - Steane, "Error Correcting Codes in Quantum Theory" PRL 77, 793 (1996)
 *   - Fowler et al., "Surface codes: Towards practical large-scale QC" PRA 86, 032324 (2012)
 *   - Shor, "Scheme for reducing decoherence in quantum memory" PRA 52, R2493 (1995)
 *   - Knill et al., threshold theorem: PRA 57, 127 (1998)
 */

export const ECC_CODES = {
  steane: {
    id: 'steane',
    name: 'Steane [[7,1,3]]',
    fullName: 'Steane 7-qubit CSS code',
    physicalQubits: 7,
    logicalQubits: 1,
    distance: 3,
    threshold: 0.011,   // ~1.1% per-gate error threshold
    syndromeRounds: 3,
    stabilizers: {
      X: ['X⊗X⊗I⊗X⊗X⊗I⊗I', 'I⊗X⊗X⊗I⊗X⊗X⊗I', 'I⊗I⊗X⊗X⊗I⊗X⊗X'],
      Z: ['Z⊗Z⊗I⊗Z⊗Z⊗I⊗I', 'I⊗Z⊗Z⊗I⊗Z⊗Z⊗I', 'I⊗I⊗Z⊗Z⊗I⊗Z⊗Z'],
    },
    description:
      'First practical quantum error-correcting code (Steane 1996). Encodes 1 logical qubit into 7 physical qubits. Corrects any single-qubit X, Z, or Y error. Built from classical Hamming [7,4,3] codes — elegant CSS construction. Used in trapped-ion systems.',
    overhead_note: '7× qubit overhead. 6 syndrome measurements per round.',
  },
  surface: {
    id: 'surface',
    name: 'Surface d=3',
    fullName: 'Surface code (distance 3)',
    physicalQubits: 9,
    logicalQubits: 1,
    distance: 3,
    threshold: 0.01,    // ~1% threshold — highest known for 2D local codes
    syndromeRounds: 8,
    stabilizers: {
      X: ['X-plaquettes (4)', 'boundary X-plaquettes (2)'],
      Z: ['Z-stars (4)', 'boundary Z-stars (2)'],
    },
    description:
      "Leading candidate for fault-tolerant QC. 3×3 data qubit grid with ancilla qubits between them. Local stabilizer measurements only — compatible with 2D chip architectures. IBM's quantum roadmap targets d=7 surface codes by 2029. Google's 2024 Willow chip demonstrated sub-threshold operation.",
    overhead_note: '9× for d=3. Scales as d² — d=7 needs 49 physical qubits per logical.',
  },
  shor: {
    id: 'shor',
    name: 'Shor [[9,1,3]]',
    fullName: "Shor 9-qubit code",
    physicalQubits: 9,
    logicalQubits: 1,
    distance: 3,
    threshold: 0.008,   // lower than Steane/Surface due to concatenation structure
    syndromeRounds: 6,
    stabilizers: {
      X: ['X⊗X⊗I on each pair', 'X⊗X⊗X⊗X⊗X⊗X (inter-block)'],
      Z: ['Z⊗Z (intra-block, 6 total)'],
    },
    description:
      "The first quantum error-correcting code (Shor 1995). Corrects arbitrary single-qubit errors via concatenation: 3-qubit phase-flip code nested inside 3-qubit bit-flip code. Historically crucial — proved QEC was possible. Not optimal for hardware but foundational for understanding concatenated codes.",
    overhead_note: '9× qubit overhead. Conceptually clearest for learning concatenation.',
  },
  none: {
    id: 'none',
    name: 'No ECC',
    fullName: 'Unprotected physical qubit',
    physicalQubits: 1,
    logicalQubits: 1,
    distance: 1,
    threshold: 0,
    syndromeRounds: 0,
    stabilizers: { X: [], Z: [] },
    description:
      'Raw physical qubit with no error correction. Fidelity decays directly under T₁/T₂ decoherence. This is the baseline NISQ regime — useful for quantum algorithms that fit within the coherence window but cannot reach fault-tolerant operation.',
    overhead_note: '1× overhead. No syndrome measurements.',
  },
}

// ─── Logical fidelity after ECC ───────────────────────────────────────────────
// Implements the threshold theorem:
//   - Below threshold: logical error rate suppressed exponentially
//   - Above threshold: ECC overhead amplifies errors

export function logicalFidelity(physicalFidelity, eccCode) {
  if (eccCode === 'none') return physicalFidelity

  const code = ECC_CODES[eccCode]
  const p = 1 - physicalFidelity   // physical error rate
  const p_th = code.threshold

  if (p === 0) return 1.0

  if (p < p_th) {
    // Below threshold: logical error rate ~ (p/p_th)^⌊(d+1)/2⌋
    const t = Math.floor((code.distance + 1) / 2)   // t = number of correctable errors
    const p_logical = Math.pow(p / p_th, t) * p_th
    return Math.max(physicalFidelity, 1 - p_logical)
  } else {
    // Above threshold: ECC is net harmful — logical error rate > physical
    const excess = (p - p_th) / p_th
    const amplification = 1 + excess * 0.4
    return Math.max(0.5, physicalFidelity / amplification)
  }
}

// ─── Syndrome measurements simulation ────────────────────────────────────────

export function simulateSyndromes(errorRate, eccCode, shots = 1) {
  if (eccCode === 'none') return []

  const code = ECC_CODES[eccCode]
  const nSyndromes = code.syndromeRounds
  const results = []

  for (let i = 0; i < nSyndromes; i++) {
    // Syndrome fires if at least one error occurred in its support
    // Simplified: Poisson-like model for error detection probability
    const detectionProb = 1 - Math.pow(1 - errorRate, code.distance)
    const detected = Math.random() < detectionProb ? 1 : 0

    // Measurement error (readout error ~0.5% for typical hardware)
    const readoutError = Math.random() < 0.005 ? 1 : 0
    const outcome = (detected + readoutError) % 2

    results.push({
      id: `S${i + 1}`,
      type: i < nSyndromes / 2 ? 'X' : 'Z',
      outcome,
      corrected: outcome === 1 && Math.random() > errorRate / code.threshold,
    })
  }

  return results
}

// ─── Monte Carlo simulation ───────────────────────────────────────────────────

export function monteCarlo(physicalFidelity, eccCode, shots = 1024) {
  const p = 1 - physicalFidelity
  const code = ECC_CODES[eccCode]
  let raw_errors = 0
  let logical_errors = 0
  const timeline = []

  for (let i = 0; i < shots; i++) {
    const hadError = Math.random() < p
    if (hadError) raw_errors++

    let logicalError = false
    if (eccCode !== 'none' && hadError) {
      // Error is correctable if weight ≤ ⌊d/2⌋
      const errorWeight = Math.random() < 0.15 ? 2 : 1  // ~15% chance of 2-qubit error
      const correctable = errorWeight <= Math.floor(code.distance / 2)
      if (!correctable) logicalError = true
    } else if (hadError) {
      logicalError = true
    }

    if (logicalError) logical_errors++

    // Sample timeline every 64 shots for chart
    if (i % 64 === 0) {
      timeline.push({
        shot: i,
        rawFidelity: 1 - raw_errors / (i + 1),
        logicalFidelity: 1 - logical_errors / (i + 1),
      })
    }
  }

  return {
    shots,
    rawErrors: raw_errors,
    logicalErrors: logical_errors,
    rawErrorRate: raw_errors / shots,
    logicalErrorRate: logical_errors / shots,
    rawFidelity: 1 - raw_errors / shots,
    logicalFidelity: 1 - logical_errors / shots,
    timeline,
    aboveThreshold: p > code.threshold,
    threshold: code.threshold,
  }
}
