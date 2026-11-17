import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { OnboardingLayout } from './OnboardingLayout'
import { useStore } from '../../store'
import { can, cant } from './copy'
import { stepNo, useFlow } from './flow'

export function CanAndCant() {
  const navigate = useNavigate()
  const { step, total } = useFlow()
  const loggedIn = useStore((s) => s.account.loggedIn)
  return (
    <OnboardingLayout
      step={step(stepNo.explainer)}
      total={total}
      footer={<Button onClick={() => navigate(loggedIn ? '/p/add-child' : '/p/login')} className="w-full">Got it, continue</Button>}
    >
      <h1 className="t-display">What your child can, and can never, do</h1>
      <section aria-labelledby="can" className="sticker p-4">
        <h2 id="can" className="t-title text-leaf-ink">✓ They can</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {can.map((t) => (
            <li key={t} className="t-body">{t}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="cant" className="sticker p-4">
        <h2 id="cant" className="t-title text-tomato-ink">✕ They can never</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {cant.map((t) => (
            <li key={t} className="t-body">{t}</li>
          ))}
        </ul>
      </section>
      <DisclosureBanner />
    </OnboardingLayout>
  )
}
