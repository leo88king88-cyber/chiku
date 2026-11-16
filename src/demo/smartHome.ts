import type { PersonaId } from './personas'
import { personas } from './personas'
import { useStore } from '../store'

/** Where a persona should land when switched to mid-flow, so the demo follows the open request. */
export function smartHome(id: PersonaId): string {
  const s = useStore.getState()
  if (id === 'priya') return s.requests.some((r) => r.status === 'pending') ? '/p/approvals' : personas.priya.home
  if (id === 'rohan') {
    const child = s.children.find((c) => c.name.toLowerCase() === 'rohan') ?? s.children.find((c) => c.ageBand === '15-17')
    const sip = s.requests.filter((r) => r.kind === 'sip' && r.childId === child?.id).at(-1)
    if (sip && (sip.status !== 'approved' || (sip.kind === 'sip' && !sip.seen))) return '/c/invest/status'
  }
  return personas[id].home
}
