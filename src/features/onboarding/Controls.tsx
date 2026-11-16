import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { Switch } from '../../components/ui/Switch'
import { formatINR } from '../../lib/money'
import { useDraftChild, useStore } from '../../store'
import { ageBandInfo } from '../../store/presets'
import { useToast } from '../../store/toast'
import type { Controls as C, NotifySpends } from '../../store/types'
import { OnboardingLayout } from './OnboardingLayout'
import { stepNo, useFlow } from './flow'

const notifyLabel: Record<NotifySpends, string> = { every: 'Every spend', large: 'Large spends only', off: 'Off' }
const money = (list: number[]) => list.map((v) => ({ value: v, label: formatINR(v) }))

export function Controls() {
  const navigate = useNavigate()
  const child = useDraftChild()
  const update = useStore((s) => s.updateControls)
  const toast = useToast((s) => s.show)
  const { step, total } = useFlow()
  const [editing, setEditing] = useState(false)
  if (!child) return <Navigate to="/p/add-child" replace />

  const c = child.controls
  const set = (patch: Partial<C>) => update(child.id, { ...patch, isDefault: false })
  const go = () => navigate('/p/pocket-money')
  const confirm = () => {
    update(child.id, { isDefault: false })
    go()
  }
  const skip = () => {
    toast('Safe defaults applied. Change them anytime.')
    go()
  }

  const rows: [string, string][] = [
    ['Monthly spending limit', formatINR(c.spendLimit)],
    ['Goal purchases', c.goalPurchaseAbove === 0 ? 'You approve every one' : `You approve above ${formatINR(c.goalPurchaseAbove)}`],
    ['Extra-money requests', `You approve above ${formatINR(c.extraMoneyAbove)}`],
    ['Spend alerts', notifyLabel[c.notifySpends]],
    ['Weekly summary', c.weeklySummary ? 'On' : 'Off'],
    ['Investing', '🔒 Always needs your approval'],
  ]

  return (
    <OnboardingLayout
      step={step(stepNo.controls)}
      total={total}
      footer={
        <>
          <Button onClick={confirm} className="w-full">{editing ? 'Save and continue' : 'Looks good'}</Button>
          {!editing && <Button variant="secondary" onClick={() => setEditing(true)} className="w-full">Customise</Button>}
          <Button variant="ghost" onClick={skip} className="w-full">Skip for now, use safe defaults</Button>
        </>
      }
    >
      <h1 className="t-display">Controls for {child.name}</h1>
      <p className="t-body text-ink-soft">
        We've picked what works for ages {ageBandInfo[child.ageBand].label}. Change anything, or just continue.
      </p>

      {!editing ? (
        <dl className="sticker divide-y divide-ink/10 px-4">
          {rows.map(([k, v]) => (
            <div key={k} className="flex min-h-14 items-center justify-between gap-3 py-2">
              <dt className="text-ink-soft">{k}</dt>
              <dd className="text-right font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="flex flex-col gap-5">
          <Group title="Monthly spending limit">
            <ChoiceChips label="Spending limit" value={c.spendLimit} options={money([300, 500, 1000, 2500, 5000])} onChange={(v) => set({ spendLimit: v })} />
          </Group>
          <Group title="I approve goal purchases">
            <ChoiceChips
              label="Goal purchase approval"
              value={c.goalPurchaseAbove}
              options={[{ value: 0, label: 'Every one' }, ...[500, 1000, 2500].map((v) => ({ value: v, label: `Above ${formatINR(v)}` }))]}
              onChange={(v) => set({ goalPurchaseAbove: v })}
            />
          </Group>
          <Group title="I approve extra-money requests">
            <ChoiceChips label="Extra money approval" value={c.extraMoneyAbove} options={[100, 300, 500, 1000].map((v) => ({ value: v, label: `Above ${formatINR(v)}` }))} onChange={(v) => set({ extraMoneyAbove: v })} />
          </Group>
          <Group title="Spend alerts">
            <ChoiceChips label="Spend alerts" value={c.notifySpends} options={(['every', 'large', 'off'] as const).map((v) => ({ value: v, label: notifyLabel[v] }))} onChange={(v) => set({ notifySpends: v })} />
          </Group>
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold">Weekly summary</span>
            <Switch label="Weekly summary" checked={c.weeklySummary} onChange={(v) => set({ weeklySummary: v })} />
          </div>
          <p className="t-caption rounded-xl bg-paper-deep px-3 py-2 text-ink-soft">🔒 Investing always needs your approval. This can't be turned off.</p>
        </div>
      )}
    </OnboardingLayout>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-bold">{title}</h2>
      {children}
    </section>
  )
}
