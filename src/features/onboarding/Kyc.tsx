import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useDraftChild, useStore } from '../../store'
import { useToast } from '../../store/toast'
import { OnboardingLayout } from './OnboardingLayout'
import { stepNo, useFlow } from './flow'

export function Kyc() {
  const navigate = useNavigate()
  const child = useDraftChild()
  const kyc = useStore((s) => s.kycStatus)
  const guardian = useStore((s) => s.guardian)
  const setScenario = useStore((s) => s.setScenario)
  const toast = useToast((s) => s.show)
  const { step, total } = useFlow()
  // The "checking" spinner shows until we've waited once for the current status.
  const [checkedFor, setCheckedFor] = useState<string | null>(null)
  const checking = checkedFor !== kyc

  useEffect(() => {
    const t = setTimeout(() => setCheckedFor(kyc), 1300)
    return () => clearTimeout(t)
  }, [kyc])

  if (!child) return <Navigate to="/p/add-child" replace />
  const next = () => navigate('/p/controls')

  if (checking) {
    return (
      <OnboardingLayout step={step(stepNo.kyc)} total={total} footer={null}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="status">
          <motion.div
            className="size-14 rounded-full border-4 border-ink/15 border-t-ink"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          />
          <p className="t-title">Checking your existing account…</p>
          <p className="t-caption text-ink-soft">No forms, no documents.</p>
        </div>
      </OnboardingLayout>
    )
  }

  if (kyc === 'verified') {
    return (
      <OnboardingLayout step={step(stepNo.kyc)} total={total} footer={<Button onClick={next} className="w-full">Continue</Button>}>
        <div className="flex items-center gap-3">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-12 place-items-center rounded-full bg-leaf text-2xl text-white">✓</motion.span>
          <h1 className="t-display">You're verified</h1>
        </div>
        <p className="t-body">We used your existing KYC, so there's nothing to upload. You're the guardian on {child.name}'s account.</p>
        <dl className="sticker divide-y divide-ink/10 px-4">
          {[
            ['Name', guardian.name],
            ['PAN', guardian.panMasked],
            ['Mobile', guardian.phoneMasked],
            ['Linked bank', guardian.bankMasked],
          ].map(([k, v]) => (
            <div key={k} className="flex min-h-12 items-center justify-between gap-3">
              <dt className="text-ink-soft">{k}</dt>
              <dd className="t-money font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="t-caption text-ink-soft">Verified from your existing account</p>
      </OnboardingLayout>
    )
  }

  const isPending = kyc === 'pending'
  return (
    <OnboardingLayout
      step={step(stepNo.kyc)}
      total={total}
      footer={
        <>
          {isPending ? (
            <Button variant="secondary" className="w-full" onClick={() => toast("Still in review. We'll notify you as soon as it clears.")}>
              Check status
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setScenario({ kycStatus: 'pending' })
                toast('Sent for manual review')
              }}
            >
              Retry verification
            </Button>
          )}
          <Button onClick={next} className="w-full">Continue setup anyway</Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <span aria-hidden className={`grid size-12 place-items-center rounded-full text-2xl text-white ${isPending ? 'bg-saffron' : 'bg-tomato'}`}>{isPending ? '⏳' : '!'}</span>
        <h1 className="t-display">{isPending ? 'KYC is under review' : "We couldn't verify your KYC"}</h1>
      </div>
      <p className="t-body">
        {isPending
          ? 'This usually takes 1 working day. We\'ll notify you as soon as it clears.'
          : "The name on your PAN doesn't match your linked bank record. Retrying sends it for a quick manual check."}
      </p>
      <section className="sticker p-4">
        <h2 className="t-title">What this means for {child.name}</h2>
        <ul className="t-body mt-2 flex flex-col gap-2">
          <li>✓ Goals, jars and pocket money work now</li>
          <li>✓ Practising with pretend money works now</li>
          <li>🔒 Real investing unlocks once you're verified</li>
        </ul>
      </section>
    </OnboardingLayout>
  )
}
