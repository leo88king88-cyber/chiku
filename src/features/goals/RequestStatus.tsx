import { Button } from '../../components/ui/Button'
import { formatINR } from '../../lib/money'
import { useStore } from '../../store'

/** What the child sees while an extra-money request is waiting on a parent. */
export function RequestStatus({ childId, kid }: { childId: string; kid: boolean }) {
  const requests = useStore((s) => s.requests)
  const day = useStore((s) => s.demoDayOffset)
  const reask = useStore((s) => s.reask)
  const advanceDay = useStore((s) => s.advanceDay)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const open = requests.filter((r) => r.childId === childId && r.kind === 'money' && (r.status === 'pending' || r.status === 'askLater'))
  if (open.length === 0) return null
  return (
    <section aria-label="Your requests" className="flex flex-col gap-2">
      {open.map((r) => {
        if (r.kind !== 'money') return null
        const ready = r.status === 'askLater' && day >= (r.retryAfterDay ?? 0)
        return (
          <div key={r.id} className="sticker flex flex-col gap-2 p-3">
            {r.status === 'pending' ? (
              <p className="t-body">
                <span aria-hidden>⏳ </span>Waiting for {parent} to say yes to <b className="t-money">{formatINR(r.amount)}</b> ({r.reason})
              </p>
            ) : (
              <>
                <p className="t-body">
                  <span aria-hidden>{kid ? '🌙 ' : ''}</span>
                  {parent} said <b>ask again tomorrow</b> for {formatINR(r.amount)}.
                </p>
                <Button variant="secondary" disabled={!ready} onClick={() => reask(r.id)}>
                  {ready ? 'Ask again' : 'You can ask again tomorrow'}
                </Button>
                {!ready && <Button variant="ghost" className="!text-sm" onClick={() => advanceDay(1)}>Demo: skip to tomorrow</Button>}
              </>
            )}
          </div>
        )
      })}
    </section>
  )
}
