import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { PARENT_APP } from '../../lib/brand'
import { useStore } from '../../store'
import { OnboardingLayout } from './OnboardingLayout'
import { stepNo, useFlow } from './flow'

const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/

/** New-user KYC: PAN plus DigiLocker consent. Only a masked PAN is kept. */
export function KycForm({ onBack }: { onBack: () => void }) {
  const submitKyc = useStore((s) => s.submitKyc)
  const { step, total } = useFlow()
  const [pan, setPan] = useState('')
  const [consent, setConsent] = useState(false)
  const valid = PAN.test(pan) && consent
  return (
    <OnboardingLayout
      step={step(stepNo.kyc)}
      total={total}
      onBack={onBack}
      footer={<Button disabled={!valid} className="w-full" onClick={() => submitKyc(pan)}>Verify my identity</Button>}
    >
      <h1 className="t-display">Quick KYC</h1>
      <p className="t-body text-ink-soft">Because you hold the account for your child, we need to verify you once. The same KYC works in {PARENT_APP}.</p>
      <label className="flex flex-col gap-2">
        <span className="font-bold">PAN</span>
        <input
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
          autoComplete="off"
          placeholder="ABCDE1234F"
          aria-describedby="pan-hint"
          className="sticker min-h-14 px-4 text-[18px] tracking-widest outline-none focus-visible:ring-4 focus-visible:ring-sky"
        />
        <span id="pan-hint" className="t-caption text-ink-soft">{pan.length === 10 && !PAN.test(pan) ? 'That does not look like a PAN. Format: 5 letters, 4 digits, 1 letter.' : 'Demo: any value in the PAN format works (for example ABCDE1234F).'}</span>
      </label>
      <label className="sticker flex min-h-14 cursor-pointer items-start gap-3 p-3">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-6 accent-saffron" />
        <span className="t-body">Fetch my name, date of birth and address from DigiLocker with my consent.</span>
      </label>
      <p className="t-caption text-ink-soft">We keep only the last letter and first three of your PAN, masked.</p>
    </OnboardingLayout>
  )
}
