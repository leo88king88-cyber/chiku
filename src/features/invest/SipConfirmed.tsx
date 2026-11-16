import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { Confetti } from '../../components/ui/Confetti'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { RiskBadge } from '../../components/ui/RiskBadge'
import { formatINR } from '../../lib/money'
import { nextOccurrence, ordinal } from '../../lib/dates'
import { useActiveChild, useStore } from '../../store'
import { fundById } from './funds'

export function SipConfirmed() {
  const navigate = useNavigate()
  const child = useActiveChild()
  const req = useStore((s) => s.requests.filter((r) => r.kind === 'sip' && r.childId === child?.id && r.status === 'approved').at(-1))
  const markSeen = useStore((s) => s.markSipSeen)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  if (!child || !req || req.kind !== 'sip') return <Navigate to="/c/invest/sim" replace />
  const fund = fundById(req.fundId)!
  const done = (to: string) => {
    markSeen(req.id)
    navigate(to)
  }
  return (
    <div className="relative flex min-h-full flex-col">
      <Confetti count={36} />
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-10 text-center">
        <Chiku size={90} cheer />
        <h1 className="t-display">Your first real SIP is on!</h1>
        <p className="t-body">{parent} approved it. You're now investing for real, a little every month.</p>
        <dl className="sticker w-full divide-y divide-ink/10 px-4 text-left">
          {[
            ['Fund', fund.name],
            ['Amount', `${formatINR(req.amount)} every month`],
            ['Debit date', `${ordinal(req.dayOfMonth)} of each month`],
            ['First debit', nextOccurrence(req.dayOfMonth)],
            ['Paid via', 'UPI AutoPay from your parent'],
          ].map(([k, v]) => (
            <div key={k} className="flex min-h-12 items-center justify-between gap-3 py-2"><dt className="text-ink-soft">{k}</dt><dd className="text-right font-bold">{v}</dd></div>
          ))}
          <div className="flex min-h-12 items-center justify-between py-2"><dt className="text-ink-soft">Risk</dt><dd><RiskBadge risk={fund.risk} /></dd></div>
        </dl>
        <DisclosureBanner invest />
      </main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-4">
        <Button className="w-full !min-h-14" onClick={() => done('/c/invest/graduation')}>What happens when I turn 18?</Button>
        <Button variant="ghost" onClick={() => done('/c/home')}>Back home</Button>
      </footer>
    </div>
  )
}
