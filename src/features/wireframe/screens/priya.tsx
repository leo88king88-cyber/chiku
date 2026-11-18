import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { ChoiceChips } from '../../../components/ui/ChoiceChips'
import { DisclosureBanner } from '../../../components/ui/DisclosureBanner'
import { Sheet } from '../../../components/ui/Sheet'
import { Chiku } from '../../../components/mascot/Chiku'
import { formatINR } from '../../../lib/money'
import { ordinal } from '../../../lib/dates'
import { ageBandInfo, controlPresets, controlWhy } from '../../../store/presets'
import { can, cant } from '../../onboarding/copy'
import { OnboardingLayout } from '../../onboarding/OnboardingLayout'
import { UpiSheet } from '../../onboarding/UpiSheet'
import type { UnlockDeclineReason } from '../types'
import { go, type ScreenComponent } from './shared'

const TOTAL = 5

export const PWelcome: ScreenComponent = ({ act }) => (
  <OnboardingLayout
    onBack={() => act(go('p-welcome'))}
    footer={
      <>
        <Button className="w-full" onClick={() => act(go('p-cant'))}>Get started</Button>
        <p className="t-caption text-center text-ink-soft">Takes about 2 minutes. Your details are already filled in.</p>
      </>
    }
  >
    <div className="flex flex-col items-center pt-2"><Chiku size={132} /></div>
    <h1 className="t-display text-center">Money skills for your child. You're in charge.</h1>
    <ul className="flex flex-col gap-3">
      {[
        ['🫙', 'Pocket money that teaches', 'Save, spend and share, in jars they can see.'],
        ['🛡️', 'You stay in control', 'Limits, approvals and alerts. Set once, no nagging.'],
        ['📈', 'First real investment at 16+', 'Practise with pretend money, then a real SIP with your OK.'],
      ].map(([icon, title, body]) => (
        <li key={title} className="sticker flex items-start gap-3 p-3">
          <span aria-hidden className="text-2xl">{icon}</span>
          <div><p className="font-bold">{title}</p><p className="t-caption text-ink-soft">{body}</p></div>
        </li>
      ))}
    </ul>
  </OnboardingLayout>
)

export const PCant: ScreenComponent = ({ act }) => (
  <OnboardingLayout step={1} total={TOTAL} onBack={() => act(go('p-welcome'))} footer={<Button className="w-full" onClick={() => act(go('p-add'))}>Got it, continue</Button>}>
    <h1 className="t-display">What your child can, and can never, do</h1>
    <section className="sticker p-4"><h2 className="t-title text-leaf-ink">✓ They can</h2><ul className="mt-2 flex flex-col gap-2">{can.map((t) => <li key={t} className="t-body">{t}</li>)}</ul></section>
    <section className="sticker p-4"><h2 className="t-title text-tomato-ink">✕ They can never</h2><ul className="mt-2 flex flex-col gap-2">{cant.map((t) => <li key={t} className="t-body">{t}</li>)}</ul></section>
    <DisclosureBanner />
  </OnboardingLayout>
)

export const PAdd: ScreenComponent = ({ act, live }) => (
  <OnboardingLayout step={2} total={TOTAL} onBack={() => act(go('p-cant'))} footer={<Button className="w-full" onClick={() => act(go('p-kyc'))}>Continue</Button>}>
    <h1 className="t-display">Who are we setting this up for?</h1>
    <label className="flex flex-col gap-2">
      <span className="font-bold">Your child's first name</span>
      <input defaultValue="Ananya" readOnly={!live} className="sticker min-h-14 px-4 text-[18px] outline-none" />
    </label>
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 font-bold">Their age</legend>
      {(['8-11', '12-14', '15-17'] as const).map((b) => {
        const info = ageBandInfo[b]
        const on = b === '12-14'
        return (
          <div key={b} className={`sticker flex min-h-16 items-center gap-3 p-3 ${on ? '!bg-saffron/30 ring-4 ring-saffron' : ''}`}>
            <span aria-hidden className="text-3xl">{info.emoji}</span>
            <span className="flex-1"><span className="block font-bold">{info.label} · {info.tag}</span><span className="t-caption block text-ink-soft">{info.blurb}</span></span>
            {on && <span aria-hidden>✓</span>}
          </div>
        )
      })}
    </fieldset>
  </OnboardingLayout>
)

export const PKyc: ScreenComponent = ({ s, act }) => {
  const next = () => act(go('p-controls'))
  const common = { step: 3, total: TOTAL, onBack: () => act(go('p-add')) }
  if (s.kyc === 'verified') {
    return (
      <OnboardingLayout {...common} footer={<Button className="w-full" onClick={next}>Continue</Button>}>
        <div className="flex items-center gap-3"><span aria-hidden className="grid size-12 place-items-center rounded-full bg-leaf text-2xl text-white">✓</span><h1 className="t-display">You're verified</h1></div>
        <p className="t-body">We used your existing KYC, so there's nothing to upload. You're the guardian on Ananya's account.</p>
        <dl className="sticker divide-y divide-ink/10 px-4">
          {[['Name', 'Priya Menon'], ['PAN', 'ABCPM••••F'], ['Mobile', '+91 98•••• 4521'], ['Linked bank', 'HDFC Bank ••4821']].map(([k, v]) => (
            <div key={k} className="flex min-h-12 items-center justify-between gap-3"><dt className="text-ink-soft">{k}</dt><dd className="t-money font-bold">{v}</dd></div>
          ))}
        </dl>
        <p className="t-caption text-ink-soft">Verified from your existing account</p>
      </OnboardingLayout>
    )
  }
  const pending = s.kyc === 'pending'
  return (
    <OnboardingLayout {...common} footer={<><Button variant="secondary" className="w-full" onClick={() => act({ type: 'TOAST', message: pending ? "Still in review. We'll notify you." : 'Sent for manual review' })}>{pending ? 'Check status' : 'Retry verification'}</Button><Button className="w-full" onClick={next}>Continue setup anyway</Button></>}>
      <div className="flex items-center gap-3"><span aria-hidden className={`grid size-12 place-items-center rounded-full text-2xl ${pending ? 'bg-saffron text-ink' : 'bg-tomato-ink text-white'}`}>{pending ? '⏳' : '!'}</span><h1 className="t-display">{pending ? 'KYC is under review' : "We couldn't verify your KYC"}</h1></div>
      <p className="t-body">{pending ? "This usually takes 1 working day. We'll notify you as soon as it clears." : "The name on your PAN doesn't match your linked bank record. Retrying sends it for a quick manual check."}</p>
      <section className="sticker p-4"><h2 className="t-title">What this means for Ananya</h2><ul className="t-body mt-2 flex flex-col gap-2"><li>✓ Goals, jars and pocket money work now</li><li>✓ Practising with pretend money works now</li><li>🔒 Real investing unlocks once you're verified</li></ul></section>
    </OnboardingLayout>
  )
}

export const PControls: ScreenComponent = ({ s, act }) => {
  const c = controlPresets['12-14']
  const rows: [string, string][] = [
    ['Monthly spending limit', formatINR(c.spendLimit)],
    ['Goal purchases', `You approve above ${formatINR(c.goalPurchaseAbove)}`],
    ['Extra-money requests', `You approve above ${formatINR(c.extraMoneyAbove)}`],
    ['Spend alerts', 'Large spends only'],
    ['Weekly summary', 'On'],
    ['Investing', '🔒 Always needs your approval'],
  ]
  return (
    <OnboardingLayout
      step={4} total={TOTAL} onBack={() => act(go('p-kyc'))}
      footer={
        <>
          <Button className="w-full" onClick={() => act(go('p-pocket'))}>Looks good</Button>
          <Button variant="secondary" className="w-full" onClick={() => act({ type: 'TOAST', message: 'Customise opens chips in the app' })}>Customise</Button>
          <Button variant="ghost" className="w-full" onClick={() => { act({ type: 'SET', patch: { controlsSkipped: true } }); act(go('p-pocket')) }}>Skip for now, use safe defaults</Button>
        </>
      }
    >
      <h1 className="t-display">Controls for Ananya</h1>
      <p className="t-body text-ink-soft">We've picked what works for ages 12 to 14. Change anything, or just continue.</p>
      {s.controlsSkipped && <p role="status" className="t-body rounded-xl bg-saffron/30 p-3">Safe defaults applied. You can review them anytime.</p>}
      <dl className="sticker divide-y divide-ink/10 px-4">
        {rows.map(([k, v]) => (<div key={k} className="flex min-h-14 items-center justify-between gap-3 py-2"><dt className="text-ink-soft">{k}</dt><dd className="text-right font-bold">{v}</dd></div>))}
      </dl>
      <details className="sticker px-4 py-2"><summary className="flex min-h-11 cursor-pointer items-center font-bold">Why these settings?</summary><p className="t-body pb-2 text-ink-soft">{controlWhy['12-14'].limit}</p></details>
    </OnboardingLayout>
  )
}

export const PPocket: ScreenComponent = ({ s, view, act }) => (
  <OnboardingLayout
    step={5} total={TOTAL} onBack={() => act(go('p-controls'))}
    footer={<><Button className="w-full" onClick={() => act(go('p-pocket', 'upi'))}>Set up UPI AutoPay</Button><Button variant="ghost" className="w-full" onClick={() => act(go('p-invite'))}>I'll do this later</Button></>}
  >
    <h1 className="t-display">Monthly pocket money for Ananya</h1>
    <section className="flex flex-col gap-2"><h2 className="font-bold">How much?</h2><ChoiceChips label="Amount" value={s.pocket.amount} options={[500, 1000, 1500, 2000].map((v) => ({ value: v, label: formatINR(v) }))} onChange={() => undefined} /><p className="t-caption text-ink-soft">Suggested {formatINR(1500)} for this age.</p></section>
    <section className="flex flex-col gap-2"><h2 className="font-bold">Which day?</h2><ChoiceChips label="Day" value={s.pocket.day} options={[1, 5, 10].map((v) => ({ value: v, label: ordinal(v) }))} onChange={() => undefined} /></section>
    <div className="sticker p-4"><p className="t-body"><b>Ananya</b> gets <b className="t-money">{formatINR(s.pocket.amount)}</b> on the {ordinal(s.pocket.day)} of every month.</p><p className="t-caption mt-1 text-ink-soft">It splits into Spend, Save and Share jars. You can pause it anytime.</p></div>
    <UpiSheet open={view === 'upi'} onClose={() => act(go('p-pocket'))} amount={s.pocket.amount} day={s.pocket.day} childName="Ananya" onSuccess={() => { act({ type: 'SET', patch: { pocket: { ...s.pocket, autopay: true } } }); act(go('p-invite')) }} />
  </OnboardingLayout>
)

export const PInvite: ScreenComponent = ({ s, act }) => (
  <div className="flex min-h-full flex-col">
    <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-10 text-center">
      <Chiku size={110} cheer />
      <h1 className="t-display">Ananya is all set!</h1>
      <ul className="w-full text-left">
        <li className="t-body flex gap-2 py-1"><span aria-hidden>✓</span>{s.pocket.autopay ? `${formatINR(s.pocket.amount)} pocket money on the ${ordinal(s.pocket.day)} via UPI AutoPay` : 'Pocket money not set up yet. Add it anytime from your dashboard.'}</li>
        <li className="t-body flex gap-2 py-1"><span aria-hidden>✓</span>{s.controlsSkipped ? 'Safe defaults applied. Review them anytime.' : 'Your controls are saved.'}</li>
      </ul>
      <section className="sticker w-full p-4">
        <h2 className="t-title">Invite Ananya</h2>
        <p className="t-caption mt-1 text-ink-soft">Send this code. Ananya picks an avatar and is in.</p>
        <p className="t-money my-3 rounded-xl bg-paper-deep py-3 text-xl font-bold tracking-wider">SIKKA-ANANYA-4821</p>
        <Button className="w-full" onClick={() => act({ type: 'TOAST', message: 'Invite copied. Paste it in WhatsApp.' })}>Share on WhatsApp</Button>
      </section>
    </main>
    <footer className="flex flex-col gap-2 px-5 pb-5 pt-4">
      <Button className="w-full" onClick={() => act(go('p-approvals'))}>Go to approvals</Button>
    </footer>
  </div>
)

export const PApprovals: ScreenComponent = ({ s, act }) => {
  const g = s.goal
  const pending = g?.phase === 'unlockRequested' && !s.unlock.askLater
  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header className="flex items-center gap-2">
        <button aria-label="Back" onClick={() => act(go('p-invite'))} className="grid size-11 place-items-center rounded-full text-2xl">←</button>
        <h1 className="t-display">Approvals</h1>
      </header>
      {pending && g ? (
        <article className="sticker flex flex-col gap-3 p-4">
          <div>
            <h2 className="t-title">Ananya reached the goal: {g.emoji} {g.title}</h2>
            <p className="t-body mt-1 text-ink-soft">{formatINR(g.target)} saved. Approve the purchase?</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => { act({ type: 'APPROVE' }); act(go('p-decision', 'approved')) }}>Approve purchase</Button>
            <Button variant="secondary" onClick={() => { act({ type: 'ASK_LATER' }); act(go('p-decision', 'later')) }}>Ask again tomorrow</Button>
            <Button variant="ghost" onClick={() => act(go('p-decision', 'choose'))}>Decline…</Button>
          </div>
        </article>
      ) : (
        <p className="sticker t-body p-5 text-center">All caught up 🎉<span className="t-caption block text-ink-soft">{s.unlock.askLater ? 'Ananya will ask again tomorrow.' : 'New requests from your children show up here.'}</span></p>
      )}
    </main>
  )
}

const reasonLabels: Record<UnlockDeclineReason, { label: string; hint: string }> = {
  tooExpensive: { label: 'Too expensive for now', hint: 'Suggest a smaller goal' },
  notNow: { label: 'Not right now', hint: 'Ask again later' },
  differentGoal: { label: 'Pick a different goal', hint: 'Something else first' },
}

export const PDecision: ScreenComponent = ({ s, view, act }) => {
  const [reason, setReason] = useState<UnlockDeclineReason>('notNow')
  if (view === 'choose' || !view) {
    return (
      <div className="relative min-h-full">
        {PApprovals({ s, act, live: true })}
        <Sheet open title="Decline request" onClose={() => act(go('p-approvals'))}>
          <h2 className="t-title">Why not yet?</h2>
          <p className="t-body mt-1 text-ink-soft">Ananya sees this and can choose what to do next.</p>
          <ul className="my-3 flex flex-col gap-2" role="radiogroup" aria-label="Reason">
            {(Object.keys(reasonLabels) as UnlockDeclineReason[]).map((r) => (
              <li key={r}>
                <button role="radio" aria-checked={reason === r} onClick={() => setReason(r)} className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-2 border-ink px-3 text-left ${reason === r ? 'bg-saffron/40' : 'bg-white'}`}>
                  <span aria-hidden className="text-xl">{reason === r ? '◉' : '○'}</span>
                  <span><b>{reasonLabels[r].label}</b><span className="t-caption block text-ink-soft">{reasonLabels[r].hint}</span></span>
                </button>
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={() => { act({ type: 'DECLINE', reason }); act(go('p-decision', 'declined')) }}>Send decision</Button>
          <Button variant="ghost" className="mt-1 w-full" onClick={() => act(go('p-approvals'))}>Cancel</Button>
        </Sheet>
      </div>
    )
  }
  const result = {
    approved: { icon: '✅', title: 'Approved', body: `Ananya has been told. Her purchase of the ${s.goal?.title.toLowerCase() ?? 'goal item'} is approved.` },
    later: { icon: '🌙', title: 'Asked to try tomorrow', body: 'Ananya will see “ask again tomorrow”. Her savings stay safe.' },
    declined: { icon: '✉️', title: 'Decision sent', body: `Ananya was told: ${s.unlock.decline ? reasonLabels[s.unlock.decline.reason].label.toLowerCase() : 'not right now'}.` },
  }[view as 'approved' | 'later' | 'declined']
  return (
    <main className="flex min-h-full flex-col items-center gap-[var(--gap)] p-8 pt-20 text-center">
      <span aria-hidden className="text-7xl">{result.icon}</span>
      <h1 className="t-display">{result.title}</h1>
      <p className="t-body text-ink-soft">{result.body}</p>
      <Button className="w-full" onClick={() => act(go('p-approvals'))}>Back to approvals</Button>
      <Button variant="secondary" className="w-full" onClick={() => act({ type: 'PERSONA', to: 'ananya' })}>See what Ananya sees</Button>
    </main>
  )
}
