import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { formatINR } from '../../lib/money'
import { nextOccurrence, ordinal } from '../../lib/dates'
import { useDraftChild, useStore } from '../../store'
import { pocketMoneySuggestion } from '../../store/presets'
import { OnboardingLayout } from './OnboardingLayout'
import { UpiSheet } from './UpiSheet'
import { stepNo, useFlow } from './flow'

export function PocketMoney() {
  const navigate = useNavigate()
  const child = useDraftChild()
  const setPocketMoney = useStore((s) => s.setPocketMoney)
  const { step, total } = useFlow()
  const [amount, setAmount] = useState(child ? pocketMoneySuggestion[child.ageBand].amount : 500)
  const [day, setDay] = useState(1)
  const [open, setOpen] = useState(false)
  const [sheetKey, setSheetKey] = useState(0)
  if (!child) return <Navigate to="/p/add-child" replace />

  return (
    <OnboardingLayout
      step={step(stepNo.pocket)}
      total={total}
      footer={
        <>
          <Button
            onClick={() => {
              setSheetKey((k) => k + 1)
              setOpen(true)
            }}
            className="w-full"
          >
            Set up UPI AutoPay
          </Button>
          <Button variant="ghost" onClick={() => navigate('/p/success')} className="w-full">I'll do this later</Button>
        </>
      }
    >
      <h1 className="t-display">Monthly pocket money for {child.name}</h1>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">How much?</h2>
        <ChoiceChips label="Amount" value={amount} options={[250, 500, 1000, 1500, 2000, 3000].map((v) => ({ value: v, label: formatINR(v) }))} onChange={setAmount} />
        <p className="t-caption text-ink-soft">Suggested {formatINR(pocketMoneySuggestion[child.ageBand].amount)} for this age.</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-bold">Which day?</h2>
        <ChoiceChips label="Day of month" value={day} options={[1, 5, 10].map((v) => ({ value: v, label: ordinal(v) }))} onChange={setDay} />
      </section>
      <div className="sticker p-4">
        <p className="t-body">
          <b>{child.name}</b> gets <b className="t-money">{formatINR(amount)}</b> on the {ordinal(day)} of every month. First one on <b>{nextOccurrence(day)}</b>.
        </p>
        <p className="t-caption mt-1 text-ink-soft">It splits into Spend, Save and Share jars. You can pause it anytime.</p>
      </div>

      <UpiSheet
        key={sheetKey}
        open={open}
        onClose={() => setOpen(false)}
        amount={amount}
        day={day}
        childName={child.name}
        onSuccess={(upiApp, vpa) => {
          setPocketMoney(child.id, { amount, dayOfMonth: day, mandate: 'active', upiApp, vpa })
          navigate('/p/success')
        }}
      />
    </OnboardingLayout>
  )
}
