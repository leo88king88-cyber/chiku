import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { useStore } from '../../store'
import { OnboardingLayout } from './OnboardingLayout'

const points = [
  ['🫙', 'Pocket money that teaches', 'Save, spend and share, in jars they can see.'],
  ['🛡️', 'You stay in control', 'Limits, approvals and alerts. Set once, no nagging.'],
  ['📈', 'First real investment at 16+', 'Practise with pretend money, then a real SIP with your OK.'],
]

export function Welcome() {
  const navigate = useNavigate()
  return (
    <OnboardingLayout
      backTo="/p/notify"
      footer={
        <>
          <Button
            onClick={() => {
              useStore.setState({ draftChildId: null })
              navigate('/p/can-and-cant')
            }}
            className="w-full"
          >
            Get started
          </Button>
          <p className="t-caption text-center text-ink-soft">Takes about 2 minutes. Your details are already filled in.</p>
        </>
      }
    >
      <div className="flex flex-col items-center pt-2">
        <Chiku size={132} />
      </div>
      <h1 className="t-display text-center">Money skills for your child. You're in charge.</h1>
      <ul className="flex flex-col gap-3">
        {points.map(([icon, title, body]) => (
          <li key={title} className="sticker flex items-start gap-3 p-3">
            <span aria-hidden className="text-2xl">{icon}</span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="t-caption text-ink-soft">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </OnboardingLayout>
  )
}
