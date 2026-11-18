import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { Confetti } from '../../components/ui/Confetti'
import { formatINR } from '../../lib/money'
import { ordinal } from '../../lib/dates'
import { useDraftChild, useStore } from '../../store'
import { useToast } from '../../store/toast'
import { hasOwnPhone, personaIdForChild } from '../../demo/personas'
import { smartHome } from '../../demo/smartHome'

export function Success() {
  const navigate = useNavigate()
  const draft = useDraftChild()
  // Leaving this screen clears the draft; keep the child from mount so we don't redirect over our own navigation.
  const [child] = useState(draft)
  const kyc = useStore((s) => s.kycStatus)
  const setPersona = useStore((s) => s.setPersona)
  const toast = useToast((s) => s.show)
  if (!child) return <Navigate to="/p/home" replace />

  const link = `${location.origin}/join/${child.inviteCode}`
  const message = `${child.name}, join your money app! Use code ${child.inviteCode}: ${link}`
  const ownPhone = hasOwnPhone(child)
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
          <p className="t-caption mt-1 text-ink-soft">{ownPhone ? `We'll message this to ${child.name}'s own phone${child.phone ? ` (+91 ${child.phone.slice(0, 5)} ${child.phone.slice(5)})` : ''}. ${child.name} logs in there.` : `${child.name} uses your phone. Hand it over and ${child.name} picks an avatar.`}</p>
          <p className="t-money my-3 rounded-xl bg-paper-deep py-3 text-xl font-bold tracking-wider">{child.inviteCode}</p>
          {ownPhone && <Button onClick={share} className="w-full">Share on WhatsApp</Button>}
        </section>
      </main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-4">
        <Button variant="secondary" className="w-full" onClick={() => finish('/p/add-child?second=1')}>Add another child</Button>
        {ownPhone ? (
          <Button variant="ghost" className="w-full" onClick={() => { setPersona(personaIdForChild(child)); finish(smartHome(personaIdForChild(child))) }}>Open on {child.name}'s phone (demo)</Button>
        ) : (
          <Button variant="ghost" className="w-full" onClick={() => finish(`/join/${child.inviteCode}`)}>Hand the phone to {child.name}</Button>
        )}
        <Button className="w-full" onClick={() => finish('/p/home')}>Go to dashboard</Button>
      </footer>
    </div>
  )
}
