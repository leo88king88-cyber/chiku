import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { formatINR } from '../../lib/money'
import { useActiveChild, useStore } from '../../store'
import { useToast } from '../../store/toast'
import type { DeclineReason } from '../../store/types'
import { fundById } from './funds'
import { InvestHeader } from './InvestHeader'

const reasonText: Record<DeclineReason, string> = {
  tooRisky: 'Too risky for now',
  wait: 'Wait a little longer',
  smaller: 'Start with a smaller amount',
}
const WAIT_DAYS = 7

export function SipStatus() {
  const child = useActiveChild()
  if (!child) return null
  return <Body childId={child.id} />
}

function Body({ childId }: { childId: string }) {
  const navigate = useNavigate()
  const req = useStore((s) => s.requests.filter((r) => r.kind === 'sip' && r.childId === childId).at(-1))
  const day = useStore((s) => s.demoDayOffset)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const setPersona = useStore((s) => s.setPersona)
  const toast = useToast((s) => s.show)
  if (!req || req.kind !== 'sip') return <Navigate to="/c/invest/sim" replace />
  if (req.status === 'approved') return <Navigate to="/c/invest/sip-confirmed" replace />
  const fund = fundById(req.fundId)!
  const d = req.decision
  const waitLeft = d?.reasons.includes('wait') ? Math.max(0, d.decidedDay + WAIT_DAYS - day) : 0
  const demoLink = (
    <Button variant="ghost" onClick={() => { setPersona('priya'); setTimeout(() => navigate('/p/approvals'), 80) }} className="!text-sm">
      Demo shortcut: switch to {parent}'s view
    </Button>
  )

  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title="Your SIP request" back="/c/home" />
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pb-6 pt-4 text-center">
        <Chiku size={90} cheer={false} />
        {req.status === 'pending' ? (
          <>
            <h2 className="t-display">Waiting for {parent}</h2>
            <p className="t-body">You asked for <b className="t-money">{formatINR(req.amount)}</b> a month in <b>{fund.name}</b>. {parent} can see your practice history and risk answers.</p>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="t-caption rounded-full bg-saffron/30 px-4 py-2 font-bold">⏳ Pending approval</motion.div>
            <Button variant="secondary" onClick={() => toast(`Nudged ${parent}`)}>Nudge {parent}</Button>
            {demoLink}
          </>
        ) : (
          <>
            <h2 className="t-display">{parent} said not yet</h2>
            <section className="sticker w-full p-4 text-left" aria-label="Reasons">
              <h3 className="t-title">Why</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {d?.reasons.map((r) => (
                  <li key={r} className="t-body">• {reasonText[r]}{r === 'smaller' && d.suggestedAmount ? `: ${formatINR(d.suggestedAmount)} a month` : ''}</li>
                ))}
              </ul>
              {d?.note && <p className="t-body mt-2 text-ink-soft">“{d.note}”</p>}
            </section>
            <p className="t-body">This isn't a no forever. Your practice history is still here.</p>
            {waitLeft > 0 ? (
              <>
                <Button disabled className="w-full">You can ask again in {waitLeft} {waitLeft === 1 ? 'day' : 'days'}</Button>
                <p className="t-caption text-ink-soft">Demo: use "Skip a week" in the toolbar.</p>
              </>
            ) : (
              <Button className="w-full !min-h-14" onClick={() => navigate(`/c/invest/request?resubmit=${req.id}`)}>Change and resubmit</Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/c/invest/sim')}>Keep practising</Button>
            {demoLink}
          </>
        )}
        <DisclosureBanner invest />
      </main>
    </div>
  )
}
