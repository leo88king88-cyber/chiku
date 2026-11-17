import type { PersonaId } from './personas'
import { hasOwnPhone, personas } from './personas'
import { useStore } from '../store'

/** Where a persona should land when switched to mid-flow, so the demo follows the open request. */
export function smartHome(id: PersonaId): string {
  const s = useStore.getState()
  if (id === 'priya') {
    if (!s.account.loggedIn && s.children.length === 0) return '/p/notify'
    return s.requests.some((r) => r.status === 'pending') ? '/p/approvals' : personas.priya.home
  }
  if (id === 'rohan') {
    const child = s.children.find((c) => c.name.toLowerCase() === 'rohan') ?? s.children.find((c) => c.ageBand === '15-17')
    if (child && hasOwnPhone(child) && !child.loggedIn) return '/c/notify'
    const sip = s.requests.filter((r) => r.kind === 'sip' && r.childId === child?.id).at(-1)
    if (sip && (sip.status !== 'approved' || (sip.kind === 'sip' && !sip.seen))) return '/c/invest/status'
  }
  const p = personas[id]
  if (p.view === 'child') {
    const child = s.children.find((c) => c.name.toLowerCase() === p.name.toLowerCase())
    const goal = s.goals.find((g) => g.childId === child?.id && (g.status === 'complete' || g.status === 'awaitingApproval' || (g.status === 'purchased' && !g.seen)))
    if (goal) return `/c/goal/${goal.id}/done`
  }
  return p.home
}
