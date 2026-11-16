import type { Goal } from '../../store/types'

export function goalPath(g: Goal) {
  return g.status === 'complete' || g.status === 'awaitingApproval' ? `/c/goal/${g.id}/done` : `/c/goal/${g.id}`
}
