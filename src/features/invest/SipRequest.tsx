import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { ChartLegend, LineChart } from '../../components/ui/LineChart'
import { RiskBadge } from '../../components/ui/RiskBadge'
import { formatINR } from '../../lib/money'
import { nextOccurrence } from '../../lib/dates'
import { useActiveChild, useStore } from '../../store'
import { useToast } from '../../store/toast'
import { funds, INDEX_ID, fundById } from './funds'
import { InvestHeader } from './InvestHeader'
import { profileInfo } from './quizData'
import { signed, signedINR } from '../../lib/money'
import { snapshot } from './portfolio'
import { useSim } from './useSim'

const reasons = ['To learn by doing', 'Start early', 'I tried it in practice']

export function SipRequest() {
  const child = useActiveChild()
  if (!child) return null
  return <Form childId={child.id} childName={child.name} />
}

function Form({ childId, childName }: { childId: string; childName: string }) {
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const { sim, stats, history } = useSim(childId)
  const kyc = useStore((s) => s.kycStatus)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const prev = useStore((s) => s.requests.find((r) => r.id === sp.get('resubmit')))
  const submit = useStore((s) => s.submitSip)
  const toast = useToast((s) => s.show)
  const profile = sim.quiz?.profile
  const prevSip = prev?.kind === 'sip' ? prev : undefined
  const d = prevSip?.decision

  // Resubmission starts from what the parent asked for.
  const suggestedFund = d?.reasons.includes('tooRisky') ? 'hybrid' : prevSip?.fundId
  const [fundId, setFundId] = useState(suggestedFund ?? (profile === 'conservative' ? 'debt' : INDEX_ID))
  const [amount, setAmount] = useState(d?.suggestedAmount ?? prevSip?.amount ?? 500)
  const [chip, setChip] = useState(reasons[0])
  const fund = fundById(fundId)!

  if (!profile) return <Navigate to="/c/invest/quiz" replace />
  const mismatch = fund.riskLevel > profileInfo[profile].maxRisk
  const locked = kyc !== 'verified'

  const send = () => {
    submit(childId, { fundId, amount, profile, snapshot: snapshot(sim), reasonChip: chip, resubmissionOf: prevSip?.id })
    toast(`Sent to ${parent}`)
    navigate('/c/invest/status')
  }

  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title={prevSip ? 'Change and resubmit' : 'Ask for a real SIP'} back="/c/invest/sim" />
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-6 pt-3">
        {locked && (
          <p role="alert" className="t-body rounded-xl bg-saffron/30 p-3">
            🔒 Real investing is locked until {parent}'s KYC is verified. You can keep practising.
          </p>
        )}
        {d && (
          <p className="t-body rounded-xl bg-paper-deep p-3">
            <b>{parent}'s feedback:</b> {d.reasons.map((r) => ({ tooRisky: 'too risky', wait: 'wait a bit', smaller: 'smaller amount' })[r]).join(', ')}. We've adjusted your request to match.
          </p>
        )}
        <section className="flex flex-col gap-2">
          <h2 className="t-title">Pick a fund</h2>
          <ul className="flex flex-col gap-2" role="radiogroup" aria-label="Fund">
            {funds.map((f) => {
              const on = f.id === fundId
              return (
                <li key={f.id}>
                  <button role="radio" aria-checked={on} onClick={() => setFundId(f.id)} className={`sticker flex min-h-14 w-full flex-col gap-1 p-3 text-left ${on ? '!bg-saffron/30 ring-4 ring-saffron' : ''}`}>
                    <span className="flex items-center justify-between gap-2">
                      <b>{f.name}</b>
                      {f.id === INDEX_ID && <span className="t-caption rounded-full bg-leaf/20 px-2 py-0.5 font-bold">Simple and low cost</span>}
                    </span>
                    <RiskBadge risk={f.risk} />
                  </button>
                </li>
              )
            })}
          </ul>
          {mismatch && <p role="status" className="t-body rounded-xl bg-tomato/15 p-3">Your answers say <b>{profileInfo[profile].label.toLowerCase()}</b>, but this fund is {fund.risk.toLowerCase()} risk. You can still ask, but {parent} will see this.</p>}
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="t-title">Monthly amount</h2>
          <ChoiceChips label="SIP amount" value={amount} options={[100, 250, 500, 1000].map((v) => ({ value: v, label: formatINR(v) }))} onChange={setAmount} />
          <p className="t-caption text-ink-soft">Debited on the 5th of each month via UPI AutoPay. First debit {nextOccurrence(5)}. Stop anytime.</p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="t-title">Why?</h2>
          <ChoiceChips label="Reason" value={chip} options={reasons.map((r) => ({ value: r, label: r }))} onChange={setChip} />
        </section>
        <section aria-label="Attached to your request" className="sticker p-4">
          <h2 className="t-title">📎 Your practice history is attached</h2>
          <p className="t-caption text-ink-soft">{childName} practised for {sim.week} weeks with {formatINR(stats.invested)} of virtual money.</p>
          <div className="my-2">
            <LineChart height={90} label="Attached practice history" series={[{ name: 'Index fund', color: 'var(--color-sky)', points: history.index, dashed: true }, { name: 'Your picks', color: 'var(--color-plum)', points: history.portfolio }]} />
            <ChartLegend series={[{ name: 'Your picks', color: 'var(--color-plum)' }, { name: 'Index fund', color: 'var(--color-sky)', dashed: true }]} />
          </div>
          <p className="t-body">Picks {signed(stats.returnPct)} ({signedINR(stats.gain)}), index {signed(stats.indexReturnPct)}.</p>
        </section>
        <DisclosureBanner invest />
        <Button className="w-full !min-h-14" disabled={locked || sim.trades.length === 0} onClick={send}>{`Send to ${parent}`}</Button>
        {sim.trades.length === 0 && <p className="t-caption text-center text-ink-soft">Practise with at least one fund first so there's history to attach.</p>}
      </main>
    </div>
  )
}
