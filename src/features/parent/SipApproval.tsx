import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { ChartLegend, LineChart } from '../../components/ui/LineChart'
import { RiskBadge } from '../../components/ui/RiskBadge'
import { Sheet } from '../../components/ui/Sheet'
import { formatINR } from '../../lib/money'
import { fundById } from '../invest/funds'
import { profileInfo } from '../invest/quizData'
import { signed } from '../../lib/money'
import { UpiSheet } from '../onboarding/UpiSheet'
import { useStore } from '../../store'
import { useToast } from '../../store/toast'
import type { DeclineReason, Request, SipRequestBody } from '../../store/types'

type Sip = Extract<Request, { kind: 'sip' }>

const reasonOptions: { id: DeclineReason; label: string; hint: string }[] = [
  { id: 'tooRisky', label: 'Too risky', hint: 'Suggest a lower-risk fund' },
  { id: 'wait', label: 'Wait a bit', hint: 'They can ask again in a week' },
  { id: 'smaller', label: 'Smaller amount', hint: 'Start with less' },
]

/** Parent view of a real-SIP request: simulator history, quiz result, approve or decline with reasons. */
export function SipApproval({ req }: { req: Sip & SipRequestBody }) {
  const child = useStore((s) => s.children.find((c) => c.id === req.childId))
  const kyc = useStore((s) => s.kycStatus)
  const decide = useStore((s) => s.decideSip)
  const toast = useToast((s) => s.show)
  const [upi, setUpi] = useState({ open: false, key: 0 })
  const [declining, setDeclining] = useState(false)
  const [reasons, setReasons] = useState<DeclineReason[]>([])
  const [smaller, setSmaller] = useState(Math.max(100, Math.floor(req.amount / 2 / 50) * 50))
  const [note, setNote] = useState('')
  const fund = fundById(req.fundId)
  if (!child || !fund) return null
  const snap = req.snapshot
  const toggle = (r: DeclineReason) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))
  const smallerOptions = [100, 250, 500].filter((v) => v < req.amount)

  return (
    <article className="sticker flex flex-col gap-3 p-4">
      <div>
        {req.resubmissionOf && <p className="t-caption mb-1 font-bold text-plum">Resubmitted</p>}
        <h2 className="t-title">{child.name} wants to start a {formatINR(req.amount)}/month SIP</h2>
        <p className="t-body mt-1"><b>{fund.name}</b></p>
        <div className="mt-1"><RiskBadge risk={fund.risk} /></div>
      </div>

      <section aria-label="Practice history" className="rounded-xl bg-paper p-3">
        <h3 className="font-bold">📎 {child.name}'s practice history</h3>
        <p className="t-caption text-ink-soft">{snap.weeks} weeks, {formatINR(snap.invested)} of virtual money</p>
        <LineChart height={80} label="Practice history" series={[{ name: 'Index', color: 'var(--color-sky)', points: snap.index, dashed: true }, { name: 'Picks', color: 'var(--color-plum)', points: snap.portfolio }]} />
        <ChartLegend series={[{ name: `${child.name}'s picks`, color: 'var(--color-plum)' }, { name: 'Index fund', color: 'var(--color-sky)', dashed: true }]} />
        <p className="t-body mt-1">Picks {signed(snap.returnPct)}, index fund {signed(snap.indexReturnPct)}.</p>
      </section>

      <p className="t-body">
        Risk check: <b>{profileInfo[req.profile].label}</b> {profileInfo[req.profile].emoji}
        {fund.riskLevel > profileInfo[req.profile].maxRisk && <span className="block text-tomato-ink">This fund is riskier than their answers suggest.</span>}
        {req.reasonChip && <span className="block text-ink-soft">Why: {req.reasonChip}</span>}
      </p>
      <DisclosureBanner invest />

      {kyc !== 'verified' && <p role="alert" className="t-body rounded-xl bg-saffron/30 p-3">🔒 Your KYC isn't verified yet, so you can't approve real investing.</p>}
      <div className="flex flex-col gap-2">
        <Button disabled={kyc !== 'verified'} onClick={() => setUpi((u) => ({ open: true, key: u.key + 1 }))}>Approve SIP</Button>
        <Button variant="secondary" onClick={() => setDeclining(true)}>Decline…</Button>
      </div>

      <UpiSheet
        key={upi.key}
        open={upi.open}
        onClose={() => setUpi((u) => ({ ...u, open: false }))}
        amount={req.amount}
        day={req.dayOfMonth}
        childName={child.name}
        payee={`Chiku Kids · SIP in ${fund.name}`}
        note={`This SIP invests in ${fund.name} for ${child.name}.`}
        onSuccess={() => {
          decide(req.id, { approve: true })
          setUpi((u) => ({ ...u, open: false }))
          toast(`Approved. ${child.name}'s SIP is set up.`)
        }}
      />

      <Sheet open={declining} onClose={() => setDeclining(false)} title="Decline SIP request">
        <h2 className="t-title">Why not yet?</h2>
        <p className="t-body mt-1 text-ink-soft">{child.name} sees this and can adjust and ask again.</p>
        <ul className="my-3 flex flex-col gap-2">
          {reasonOptions.map((r) => {
            const on = reasons.includes(r.id)
            return (
              <li key={r.id}>
                <button role="checkbox" aria-checked={on} onClick={() => toggle(r.id)} className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-2 border-ink px-3 text-left ${on ? 'bg-saffron/40' : 'bg-white'}`}>
                  <span aria-hidden className="text-xl">{on ? '☑' : '☐'}</span>
                  <span><b>{r.label}</b><span className="t-caption block text-ink-soft">{r.hint}</span></span>
                </button>
              </li>
            )
          })}
        </ul>
        {reasons.includes('smaller') && smallerOptions.length > 0 && (
          <div className="mb-3">
            <p className="mb-2 font-bold">Suggested amount</p>
            <ChoiceChips label="Suggested amount" value={smallerOptions.includes(smaller) ? smaller : smallerOptions.at(-1)!} options={smallerOptions.map((v) => ({ value: v, label: formatINR(v) }))} onChange={setSmaller} />
          </div>
        )}
        <label className="mb-3 flex flex-col gap-1">
          <span className="font-bold">Add a note (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} autoComplete="off" placeholder="e.g. Let's try the debt fund first" className="min-h-12 rounded-xl border-2 border-ink px-3" />
        </label>
        <Button
          className="w-full"
          disabled={reasons.length === 0}
          onClick={() => {
            decide(req.id, { approve: false, reasons, note: note.trim() || undefined, suggestedAmount: reasons.includes('smaller') ? (smallerOptions.includes(smaller) ? smaller : smallerOptions.at(-1)) : undefined })
            setDeclining(false)
            toast(`${child.name} has been told`)
          }}
        >
          Send decision
        </Button>
        <Button variant="ghost" className="mt-1 w-full" onClick={() => setDeclining(false)}>Cancel</Button>
      </Sheet>
    </article>
  )
}
