import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { Confetti } from '../../components/ui/Confetti'
import { formatINR } from '../../lib/money'
import { ordinal } from '../../lib/dates'
import { useDraftChild, useStore } from '../../store'
import { useToast } from '../../store/toast'
import type { PersonaId } from '../../demo/personas'

const previewPersona: Record<string, PersonaId> = { '8-11': 'aarav', '12-14': 'ananya', '15-17': 'rohan' }

export function Success() {
  const navigate = useNavigate()
  const child = useDraftChild()
  const kyc = useStore((s) => s.kycStatus)
  const setPersona = useStore((s) => s.setPersona)
  const toast = useToast((s) => s.show)
  if (!child) return <Navigate to="/p/home" replace />

  const link = `${location.origin}/join/${child.inviteCode}`
  const message = `${child.name}, join your money app! Use code ${child.inviteCode}: ${link}`
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ text: message })
      else {
        await navigator.clipboard.writeText(message)
        toast('Invite copied. Paste it in WhatsApp.')
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }
  const finish = (to: string) => {
    useStore.setState({ draftChildId: null })
    navigate(to)
  }

  const notes = [
    child.pocketMoney
      ? `${formatINR(child.pocketMoney.amount)} pocket money on the ${ordinal(child.pocketMoney.dayOfMonth)} via UPI AutoPay`
      : 'Pocket money not set up yet. Add it anytime from your dashboard.',
    child.controls.isDefault ? 'Safe defaults applied. Review them anytime.' : 'Your controls are saved.',
    kyc !== 'verified' ? 'Real investing unlocks once your KYC is verified.' : null,
  ].filter(Boolean) as string[]

  return (
    <div className="relative flex min-h-full flex-col">
      <Confetti />
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-8 text-center">
        <Chiku size={110} cheer />
        <h1 className="t-display">{child.name} is all set!</h1>
        <ul className="w-full text-left">
          {notes.map((n) => (
            <li key={n} className="t-body flex gap-2 py-1"><span aria-hidden>✓</span>{n}</li>
          ))}
        </ul>
        <section className="sticker w-full p-4">
          <h2 className="t-title">Invite {child.name}</h2>
          <p className="t-caption mt-1 text-ink-soft">Send this code. {child.name} picks an avatar and is in.</p>
          <p className="t-money my-3 rounded-xl bg-paper-deep py-3 text-xl font-bold tracking-wider">{child.inviteCode}</p>
          <Button onClick={share} className="w-full">Share on WhatsApp</Button>
        </section>
      </main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-4">
        <Button variant="secondary" className="w-full" onClick={() => finish('/p/add-child?second=1')}>Add another child</Button>
        <Button variant="ghost" className="w-full" onClick={() => { setPersona(previewPersona[child.ageBand]); finish('/c/home') }}>
          See what {child.name} will see
        </Button>
        <Button className="w-full" onClick={() => finish('/p/home')}>Go to dashboard</Button>
      </footer>
    </div>
  )
}
