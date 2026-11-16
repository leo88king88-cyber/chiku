/** Curated, fictional funds with deterministic mock NAV series (weekly, 104 weeks). */
export type RiskLabel = 'Low to Moderate' | 'High' | 'Very High'

export interface Fund {
  id: string
  name: string
  category: string
  risk: RiskLabel
  /** 1 (lowest) to 5 (highest), used to match the quiz profile. */
  riskLevel: 2 | 4 | 5
  expense: number
  blurb: string
  beta: number
  drift: number
  idio: number
  seed: number
}

export const funds: Fund[] = [
  { id: 'index', name: 'Sagar Nifty 50 Index Fund', category: 'Index fund', risk: 'Very High', riskLevel: 5, expense: 0.2, blurb: 'Copies the 50 biggest listed companies. Low cost, no fund manager guesswork.', beta: 1, drift: 0, idio: 0, seed: 1 },
  { id: 'flexi', name: 'Tara Flexi Cap Fund', category: 'Flexi cap', risk: 'Very High', riskLevel: 5, expense: 1.0, blurb: 'A fund manager picks companies of any size. Can beat the market, or trail it.', beta: 1.05, drift: -0.0002, idio: 0.01, seed: 3 },
  { id: 'mid', name: 'Vega Midcap Fund', category: 'Mid cap', risk: 'Very High', riskLevel: 5, expense: 1.1, blurb: 'Mid-sized companies. Bigger swings in both directions.', beta: 1.3, drift: -0.0001, idio: 0.014, seed: 3 },
  { id: 'hybrid', name: 'Kaveri Balanced Advantage Fund', category: 'Hybrid', risk: 'High', riskLevel: 4, expense: 0.8, blurb: 'Mixes shares and bonds, and shifts between them. Smoother ride.', beta: 0.5, drift: 0.0004, idio: 0.004, seed: 4 },
  { id: 'debt', name: 'Nila Short Duration Debt Fund', category: 'Debt fund', risk: 'Low to Moderate', riskLevel: 2, expense: 0.5, blurb: 'Lends to governments and companies. Slow and steady, still not guaranteed.', beta: 0.05, drift: 0.0009, idio: 0.001, seed: 5 },
]

export const fundById = (id: string) => funds.find((f) => f.id === id)
export const INDEX_ID = 'index'
export const MAX_WEEK = 104

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
/** Roughly normal: sum of three uniforms, centred and scaled. */
const gauss = (r: () => number) => (r() + r() + r() - 1.5) * 2

const MARKET_SEED = 9
const market = (() => {
  const r = rng(MARKET_SEED)
  return Array.from({ length: MAX_WEEK }, () => 0.0018 + gauss(r) * 0.011)
})()

const series: Record<string, number[]> = Object.fromEntries(
  funds.map((f) => {
    const r = rng(f.seed * 997)
    const out = [100]
    for (let w = 0; w < MAX_WEEK; w++) {
      const ret = f.beta * market[w] + f.drift + gauss(r) * f.idio
      out.push(out[w] * (1 + ret))
    }
    return [f.id, out]
  }),
)

export const navAt = (fundId: string, week: number) => series[fundId][Math.min(MAX_WEEK, Math.max(0, week))]
export const navSeries = (fundId: string, upTo: number) => series[fundId].slice(0, Math.min(MAX_WEEK, upTo) + 1)
