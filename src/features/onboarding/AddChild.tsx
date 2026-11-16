import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useDraftChild, useStore } from '../../store'
import { controlPresets, ageBandInfo } from '../../store/presets'
import type { AgeBand } from '../../theme/bands'
import { OnboardingLayout } from './OnboardingLayout'
import { stepNo, useFlow } from './flow'

const bands: AgeBand[] = ['8-11', '12-14', '15-17']

export function AddChild() {
  const navigate = useNavigate()
  const { second, step, total } = useFlow()
  const store = useStore()
  const draft = useDraftChild()
  // Success -> "Add another child" clears the draft, so a draft here means we came back to edit it.
  const editing = draft
  const [name, setName] = useState(editing?.name ?? '')
  const [band, setBand] = useState<AgeBand | null>(editing?.ageBand ?? null)

  const valid = name.trim().length >= 2 && band !== null
  const next = () => {
    if (!valid || !band) return
    if (editing) {
      store.updateChild(editing.id, {
        name: name.trim(),
        ageBand: band,
        ...(band !== editing.ageBand ? { controls: { ...controlPresets[band], isDefault: true } } : {}),
      })
    } else {
      store.addChild(name, band)
    }
    // Further children share your existing verification, so skip KYC.
    navigate(second ? '/p/controls?second=1' : '/p/kyc')
  }

  return (
    <OnboardingLayout
      step={step(stepNo.addChild)}
      total={total}
      footer={<Button disabled={!valid} onClick={next} className="w-full">Continue</Button>}
    >
      <h1 className="t-display">{second ? "Who's joining next?" : 'Who are we setting this up for?'}</h1>
      <label className="flex flex-col gap-2">
        <span className="font-bold">Your child's first name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          autoComplete="off"
          placeholder="e.g. Aarav"
          className="sticker min-h-14 px-4 text-[18px] outline-none focus-visible:ring-4 focus-visible:ring-sky"
        />
      </label>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-bold">Their age</legend>
        {bands.map((b) => {
          const info = ageBandInfo[b]
          const on = band === b
          return (
            <label
              key={b}
              className={`sticker flex min-h-16 cursor-pointer items-center gap-3 p-3 ${on ? '!bg-saffron/30 ring-4 ring-saffron' : ''}`}
            >
              <input type="radio" name="age" checked={on} onChange={() => setBand(b)} className="sr-only" />
              <span aria-hidden className="text-3xl">{info.emoji}</span>
              <span className="flex-1">
                <span className="block font-bold">{info.label} · {info.tag}</span>
                <span className="t-caption block text-ink-soft">{info.blurb}</span>
              </span>
              {on && <span aria-hidden className="text-xl">✓</span>}
            </label>
          )
        })}
      </fieldset>
    </OnboardingLayout>
  )
}
