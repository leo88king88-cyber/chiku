import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { hasOwnPhone, personaIdForChild } from '../../demo/personas'
import { smartHome } from '../../demo/smartHome'
import { formatMobile } from '../../lib/brand'
import { useStore } from '../../store'
import { ageBandToBand } from '../../theme/bands'
import { MobileStep, OtpStep } from '../auth/steps'

const avatars = ['🦊', '🐯', '🦄', '🐼', '🚀', '⚽']
type Phase = 'mobile' | 'otp' | 'avatar'

/**
 * Child side of the invite. Children on a parent's phone just pick an avatar. Children with their own
 * phone (15-17) first log in with the number their parent invited, then pick an avatar.
 */
export function Join() {
  const { code } = useParams()
  const navigate = useNavigate()
  const child = useStore((s) => s.children.find((c) => c.inviteCode === code))
  const childLogin = useStore((s) => s.childLogin)
  const setPersona = useStore((s) => s.setPersona)
  const [phase, setPhase] = useState<Phase>('mobile')
  const [mobile, setMobile] = useState(child?.phone ?? '')
  const [mismatch, setMismatch] = useState(false)
  const [avatar, setAvatar] = useState(avatars[0])

  if (!child) {
    return (
      <main className="flex flex-col items-center gap-4 p-8 text-center">
        <h1 className="t-display">Invite not found</h1>
        <p className="t-body text-ink-soft">Ask your parent to send the invite again.</p>
      </main>
    )
  }
  const own = hasOwnPhone(child)
  const step: Phase = own ? phase : 'avatar'

  const finish = () => {
    childLogin(child.id, avatar)
    const id = personaIdForChild(child)
    setPersona(id)
    navigate(smartHome(id), { replace: true })
  }

  return (
    <div data-band={ageBandToBand[child.ageBand]} className="flex min-h-full flex-col">
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-10 text-center">
        <Chiku size={step === 'avatar' ? 120 : 90} cheer />
        {step === 'mobile' && (
          <div className="flex w-full flex-col gap-[var(--gap)] text-left">
            <h1 className="t-display text-center">Hi {child.name}! Log in to Sikka</h1>
            <p className="t-body text-center text-ink-soft">Use the mobile number your parent invited.</p>
            <MobileStep value={mobile} onChange={(v) => { setMobile(v); setMismatch(false) }} onSubmit={() => (mobile === child.phone ? setPhase('otp') : setMismatch(true))} />
            {mismatch && <p role="alert" className="t-body rounded-xl bg-tomato/15 p-3">This invite was sent to +91 {formatMobile(child.phone ?? '')}. Use that number.</p>}
          </div>
        )}
        {step === 'otp' && (
          <div className="flex w-full flex-col gap-[var(--gap)] text-left">
            <h1 className="t-display text-center">Enter the code</h1>
            <OtpStep mobile={mobile} onChangeNumber={() => setPhase('mobile')} onVerified={() => setPhase('avatar')} />
          </div>
        )}
        {step === 'avatar' && (
          <>
            <h1 className="t-display">Hi {child.name}! I'm Chiku.</h1>
            <p className="t-body">Pick your buddy. You can change it later.</p>
            <div role="radiogroup" aria-label="Avatar" className="grid w-full grid-cols-3 gap-3">
              {avatars.map((a) => (
                <button key={a} role="radio" aria-checked={avatar === a} aria-label={`Avatar ${a}`} onClick={() => setAvatar(a)} className={`sticker grid h-20 place-items-center text-4xl ${avatar === a ? '!bg-saffron/40 ring-4 ring-saffron' : ''}`}>
                  {a}
                </button>
              ))}
            </div>
          </>
        )}
      </main>
      {step === 'avatar' && (
        <footer className="px-5 pb-6 pt-4">
          <Button className="w-full" onClick={finish}>Let's go!</Button>
        </footer>
      )}
    </div>
  )
}
