import { useMemo } from 'react'
import { EMPTY_SIM, useStore } from '../../store'
import { simHistory, simHoldings, simStats, weeklyRecap } from './portfolio'

export function useSim(childId: string) {
  const sim = useStore((s) => s.sims[childId]) ?? EMPTY_SIM
  return useMemo(
    () => ({ sim, stats: simStats(sim), history: simHistory(sim), holdings: simHoldings(sim), recap: weeklyRecap(sim) }),
    [sim],
  )
}
