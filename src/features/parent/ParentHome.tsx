import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { formatINR } from '../../lib/money'
import { nextOccurrence, ordinal } from '../../lib/dates'
import { fundById } from '../invest/funds'
import { hasOwnPhone, personaIdForChild } from '../../demo/personas'
import { smartHome } from '../../demo/smartHome'
import { useStore } from '../../store'
import { useToast } from '../../store/toast'
import { ageBandInfo } from '../../store/presets'

export function ParentHome() {
  const navigate = useNavigate()
  const { children, guardian, kycStatus, requests, pocketMoneyLate, sips } = useStore()
  const receive = useStore((s) => s.receivePocketMoney)
  const setPersona = useStore((s) => s.setPersona)
  const pending = requests.filter((r) => r.status === 'pending').length
  const toast = useToast((s) => s.show)
  if (children.length === 0) return <Navigate to="/p/add-child" replace />

  const attention: { text: string; action?: string; onAction?: () => void }[] = []
  if (kycStatus !== 'verified')
    attention.push({ text: kycStatus === 'pending' ? 'KYC under review. Real investing is locked until it clears.' : "KYC couldn't be verified. Real investing is locked.", action: 'Fix', onAction: () => navigate('/p/kyc') })
  if (pending > 0)
    attention.push({ text: `${pending} ${pending === 1 ? 'request is' : 'requests are'} waiting for you.`, action: 'Review', onAction: () => navigate('/p/approvals') })
  if (pocketMoneyLate)
    attention.push({
      text: "This month's pocket money didn't go through. Your UPI AutoPay needs a retry.",
      action: 'Retry now',
      onAction: () => children.filter((c) => c.pocketMoney?.mandate === 'active').forEach((c) => receive(c.id)),
    })
  children.forEach((c) => {
    if (c.controls.isDefault) attention.push({ text: `${c.name} is on safe defaults. Review controls.`, action: 'Review', onAction: () => { useStore.setState({ draftChildId: c.id }); navigate('/p/controls') } })
    if (!c.pocketMoney) attention.push({ text: `${c.name} has no pocket money set up.`, action: 'Set up', onAction: () => { useStore.setState({ draftChildId: c.id }); navigate('/p/pocket-money') } })
  })

  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header>
        <p className="t-caption text-ink-soft">Namaste 🙏</p>
        <h1 className="t-display">{guardian.name.split(' ')[0]}'s family</h1>
      </header>

      {attention.length > 0 && (
        <section aria-label="Needs your attention" className="flex flex-col gap-2">
          <h2 className="t-title">Needs your attention</h2>
          {attention.map((a) => (
            <div key={a.text} className="sticker flex items-center gap-3 !bg-saffron/20 p-3">
              <p className="t-body flex-1">{a.text}</p>
              {a.action && <Button variant="secondary" onClick={a.onAction} className="!px-3">{a.action}</Button>}
            </div>
          ))}
        </section>
      )}

      <section aria-label="Children" className="flex flex-col gap-3">
        {children.map((c) => (
          <article key={c.id} className="sticker flex flex-col gap-2 p-4">
            <div className="flex items-center gap-3">
              <span aria-hidden className="text-3xl">{c.avatar ?? ageBandInfo[c.ageBand].emoji}</span>
              <div className="flex-1">
                <h3 className="t-title">{c.name}</h3>
                <p className="t-caption text-ink-soft">Ages {ageBandInfo[c.ageBand].label}</p>
              </div>
              <span className={`t-caption rounded-full px-3 py-1 font-bold ${c.inviteStatus === 'accepted' ? 'bg-leaf/20 text-leaf-ink' : 'bg-saffron/30'}`}>
                {c.inviteStatus === 'accepted' ? 'Joined' : 'Invite sent'}
              </span>
            </div>
            <p className="t-body">
              {c.pocketMoney
                ? `${formatINR(c.pocketMoney.amount)} on the ${ordinal(c.pocketMoney.dayOfMonth)} · next ${nextOccurrence(c.pocketMoney.dayOfMonth)}`
                : 'No pocket money yet'}
            </p>
            {sips.filter((x) => x.childId === c.id).map((x) => (
              <p key={x.id} className="t-caption rounded-xl bg-leaf/15 px-3 py-2">SIP: {formatINR(x.amount)}/month in {fundById(x.fundId)?.name}</p>
            ))}
            {c.pocketMoney?.mandate === 'active' && (
              <Button variant="secondary" onClick={() => { receive(c.id); toast(`Sent ${formatINR(c.pocketMoney!.amount)} to ${c.name}`) }}>
                Send {formatINR(c.pocketMoney.amount)} now
              </Button>
            )}
            {c.inviteStatus === 'sent' && (
              <Button variant="secondary" onClick={() => toast(`Reminder sent to ${c.name}`)}>Resend invite</Button>
            )}
            {hasOwnPhone(c) ? (
              <>
                <p className="t-caption text-ink-soft">{c.name} uses Chiku on their own phone{c.phone ? ` (+91 ${c.phone.slice(0, 5)} ${c.phone.slice(5)})` : ''}.</p>
                <Button variant="ghost" onClick={() => { const id = personaIdForChild(c); setPersona(id); navigate(smartHome(id), { replace: true }) }}>Open on {c.name}'s phone (demo)</Button>
              </>
            ) : (
              <Button onClick={() => { const id = personaIdForChild(c); setPersona(id); navigate(smartHome(id), { replace: true }) }}>Hand the phone to {c.name}</Button>
            )}
          </article>
        ))}
      </section>

      <Button onClick={() => navigate('/p/add-child?second=1')} variant="secondary" className="w-full">+ Add another child</Button>
    </main>
  )
}
