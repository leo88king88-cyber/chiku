import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { DEMO_MOBILE, PARENT_APP } from '../../lib/brand'
import { useStore } from '../../store'
import { MobileStep, OtpStep } from '../auth/steps'
import { OnboardingLayout } from './OnboardingLayout'
import { stepNo, useFlow } from './flow'

type Phase = 'mobile' | 'otp' | 'name'

/**
 * One login for both apps. A number that already has a parent-app account signs straight in and reuses
 * its KYC. A new number creates an account and completes KYC later in the flow.
 */
export function Login() {
  const navigate = useNavigate()
  const loggedIn = useStore((s) => s.account.loggedIn)
  const hasChildren = useStore((s) => s.children.length > 0)
  const login = useStore((s) => s.login)
  const completeSignup = useStore((s) => s.completeSignup)
  const { step, total } = useFlow()
  const [phase, setPhase] = useState<Phase>('mobile')
  const [mobile, setMobile] = useState(DEMO_MOBILE)
  const [name, setName] = useState('')

  if (loggedIn && phase !== 'name') return <Navigate to={hasChildren ? '/p/home' : '/p/add-child'} replace />

  const existing = mobile === DEMO_MOBILE
  const back = () => (phase === 'otp' ? setPhase('mobile') : navigate('/p/can-and-cant'))

  return (
    <OnboardingLayout step={step(stepNo.login)} total={total} onBack={back} footer={null}>
      {phase === 'mobile' && (
        <>
          <h1 className="t-display">Use your {PARENT_APP} login</h1>
          <p className="t-body text-ink-soft">Sikka is a separate app with the same login and KYC as {PARENT_APP}. New to {PARENT_APP}? We'll set you up.</p>
          <MobileStep value={mobile} onChange={setMobile} onSubmit={() => setPhase('otp')}>
            <p role="note" className="t-caption rounded-xl bg-paper-deep px-3 py-2 text-ink-soft">
              {existing ? `Demo: this number already has an account with ${PARENT_APP}, so your KYC is reused.` : `Demo: a new number. You'll create an account and complete KYC.`}
            </p>
          </MobileStep>
        </>
      )}
      {phase === 'otp' && (
        <>
          <h1 className="t-display">Enter the code</h1>
          <OtpStep
            mobile={mobile}
            onChangeNumber={() => setPhase('mobile')}
            onVerified={() => {
              login(mobile)
              if (existing) navigate('/p/add-child', { replace: true })
              else setPhase('name')
            }}
          />
        </>
      )}
      {phase === 'name' && (
        <>
          <h1 className="t-display">What should we call you?</h1>
          <p className="t-body text-ink-soft">Welcome to {PARENT_APP}. This is the name your child will see.</p>
          <label className="flex flex-col gap-2">
            <span className="font-bold">Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus placeholder="e.g. Meera Nair" className="sticker min-h-14 px-4 text-[18px] outline-none focus-visible:ring-4 focus-visible:ring-sky" />
          </label>
          <Button disabled={name.trim().length < 2} className="w-full" onClick={() => { completeSignup(name); navigate('/p/add-child', { replace: true }) }}>
            Create account
          </Button>
        </>
      )}
    </OnboardingLayout>
  )
}
