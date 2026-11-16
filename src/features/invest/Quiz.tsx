import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { useActiveChild, useStore } from '../../store'
import { InvestHeader } from './InvestHeader'
import { gate, profileFor, profileInfo, questions } from './quizData'

/** Three questions, one risk fact check, then a profile. Tap-to-answer, no typing. */
export function Quiz() {
  const navigate = useNavigate()
  const child = useActiveChild()
  const setQuiz = useStore((s) => s.setQuiz)
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState(false)
  if (!child) return null

  const total = questions.length + 1
  const finished = step > questions.length
  const profile = profileFor(score)

  const answer = (s: number) => {
    setScore((n) => n + s)
    setTimeout(() => setStep((n) => n + 1), 200)
  }

  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title="Quick risk check" back="/c/invest/sim" />
      <main className="flex flex-1 flex-col gap-[var(--gap)] px-5 pb-6 pt-3">
        {!finished && (
          <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1} aria-label={`Question ${step + 1} of ${total}`}>
            {Array.from({ length: total }, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-ink' : 'bg-ink/15'}`} />)}
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="flex flex-col gap-[var(--gap)]">
            {step < questions.length && (
              <>
                <h2 className="t-display">{questions[step].q}</h2>
                <ul className="flex flex-col gap-3">
                  {questions[step].options.map((o) => (
                    <li key={o.label}><button onClick={() => answer(o.score)} className="sticker min-h-16 w-full px-4 text-left font-bold">{o.label}</button></li>
                  ))}
                </ul>
              </>
            )}
            {step === questions.length && (
              <>
                <h2 className="t-display">{gate.q}</h2>
                <ul className="flex flex-col gap-3">
                  {['True', 'False'].map((o) => (
                    <li key={o}>
                      <button
                        onClick={() => (o === gate.correct ? (setWrong(false), setStep((n) => n + 1)) : setWrong(true))}
                        className="sticker min-h-16 w-full px-4 text-left font-bold"
                      >
                        {o}
                      </button>
                    </li>
                  ))}
                </ul>
                {wrong && <p role="alert" className="t-body rounded-xl bg-tomato/15 p-3">Not quite. It can be worth less, which is exactly why a parent has to approve your SIP.</p>}
              </>
            )}
            {finished && (
              <>
                <span className="text-6xl" aria-hidden>{profileInfo[profile].emoji}</span>
                <h2 className="t-display">You're a {profileInfo[profile].label.toLowerCase()}</h2>
                <p className="t-body">{profileInfo[profile].text}</p>
                <p className="t-caption text-ink-soft">This isn't a test you can fail. It just helps match funds to how you feel about risk. We'll share it with your parent.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mt-auto flex flex-col gap-3">
          {finished && (
            <Button className="w-full" onClick={() => { setQuiz(child.id, { profile, score }); navigate('/c/invest/request') }}>Continue</Button>
          )}
          <DisclosureBanner />
        </div>
      </main>
    </div>
  )
}
