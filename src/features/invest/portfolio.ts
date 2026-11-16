import { SIM_CASH } from '../../store'
import type { Sim, SimSnapshot, SimTrade } from '../../store/types'
import { INDEX_ID, fundById, navAt } from './funds'

interface Replay {
  cash: number
  units: Record<string, number>
  holdings: number
  value: number
  /** Net money put to work (buys minus sells). */
  net: number
}

/** Replay trades up to `week`. With `asIndex`, every trade goes into the index fund instead. */
export function replay(trades: SimTrade[], week: number, asIndex = false): Replay {
  let cash = SIM_CASH
  const units: Record<string, number> = {}
  for (const t of trades) {
    if (t.week > week) continue
    const id = asIndex ? INDEX_ID : t.fundId
    const nav = navAt(id, t.week)
    if (t.side === 'buy') {
      units[id] = (units[id] ?? 0) + t.amount / nav
      cash -= t.amount
    } else {
      const u = Math.min(units[id] ?? 0, t.amount / nav)
      units[id] = (units[id] ?? 0) - u
      cash += u * nav
    }
  }
  const holdings = Object.entries(units).reduce((n, [id, u]) => n + u * navAt(id, week), 0)
  return { cash, units, holdings, value: cash + holdings, net: SIM_CASH - cash }
}

const pct = (a: number, b: number) => (b > 0 ? (a / b - 1) * 100 : 0)

export function simStats(sim: Sim) {
  const mine = replay(sim.trades, sim.week)
  const idx = replay(sim.trades, sim.week, true)
  return {
    value: mine.value,
    cash: mine.cash,
    invested: mine.net,
    gain: mine.holdings - mine.net,
    returnPct: pct(mine.holdings, mine.net),
    indexValue: idx.value,
    indexGain: idx.holdings - idx.net,
    indexReturnPct: pct(idx.holdings, idx.net),
  }
}

export function simHistory(sim: Sim) {
  const portfolio: number[] = []
  const index: number[] = []
  for (let w = 0; w <= sim.week; w++) {
    portfolio.push(replay(sim.trades, w).value)
    index.push(replay(sim.trades, w, true).value)
  }
  return { portfolio, index }
}

export function simHoldings(sim: Sim) {
  const r = replay(sim.trades, sim.week)
  return Object.entries(r.units)
    .filter(([, u]) => u > 0.0001)
    .map(([id, u]) => {
      const fund = fundById(id)!
      const value = u * navAt(id, sim.week)
      const invested = sim.trades.filter((t) => t.fundId === id).reduce((n, t) => n + (t.side === 'buy' ? t.amount : -t.amount), 0)
      return { fund, value, invested, gainPct: pct(value, invested) }
    })
}

/** Last week's move, for the weekly recap card. */
export function weeklyRecap(sim: Sim) {
  const w = sim.week
  if (w < 1) return null
  const prev = replay(sim.trades, w - 1)
  const now = replay(sim.trades, w)
  const prevIdx = replay(sim.trades, w - 1, true)
  const nowIdx = replay(sim.trades, w, true)
  const moves = simHoldings(sim).map((h) => ({ fund: h.fund, pct: pct(navAt(h.fund.id, w), navAt(h.fund.id, w - 1)) }))
  moves.sort((a, b) => b.pct - a.pct)
  return {
    week: w,
    portfolioPct: pct(now.value, prev.value),
    indexPct: pct(nowIdx.value, prevIdx.value),
    best: moves[0],
    worst: moves.length > 1 ? moves[moves.length - 1] : undefined,
    invested: now.net > 0,
  }
}

/** Freeze the simulator at this moment, to attach to a real SIP request. */
export function snapshot(sim: Sim): SimSnapshot {
  const s = simStats(sim)
  const h = simHistory(sim)
  return {
    weeks: sim.week,
    invested: Math.round(s.invested),
    gain: Math.round(s.gain),
    returnPct: Number(s.returnPct.toFixed(2)),
    indexReturnPct: Number(s.indexReturnPct.toFixed(2)),
    portfolio: h.portfolio.map(Math.round),
    index: h.index.map(Math.round),
  }
}
