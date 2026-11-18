import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { DisclosureBanner } from '../../../components/ui/DisclosureBanner'
import { EMPTY_LEARNED, useActiveChild, useStore } from '../../../store'
import { InvestHeader } from '../InvestHeader'
import { lessonById, lessons } from './lessons'

export function LessonPage() {
  const { id = '' } = useParams()
  const child = useActiveChild()
  const lesson = lessonById(id)
  if (!child || !lesson) return <Navigate to="/c/invest/learn" replace />
  return <Body key={lesson.id} childId={child.id} lessonId={lesson.id} />
}

function Body({ childId, lessonId }: { childId: string; lessonId: string }) {
  const navigate = useNavigate()
  const lesson = lessonById(lessonId)!
  const done = useStore((s) => s.learned[childId]) ?? EMPTY_LEARNED
  const markLearned = useStore((s) => s.markLearned)
  const [picked, setPicked] = useState<number | null>(null)
  const index = lessons.findIndex((l) => l.id === lessonId)
  const next = lessons[index + 1]
  const isDone = done.includes(lessonId)
  const right = picked === lesson.check.answer
  const Visual = lesson.visual

  const choose = (i: number) => {
    setPicked(i)
    if (i === lesson.check.answer) markLearned(childId, lessonId)
  }

  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title={`Lesson ${index + 1} of ${lessons.length}`} back="/c/invest/learn" />
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-8 pt-3">
        <header>
          <p className="t-caption text-ink-soft">{lesson.minutes} min read</p>
          <h1 className="t-display"><span aria-hidden>{lesson.emoji} </span>{lesson.title}</h1>
        </header>
        <Visual />
        {lesson.sections.map((s) => (
          <section key={s.heading} className={s.callout ? 'sticker !bg-saffron/20 p-4' : ''}>
            <h2 className="t-title">{s.heading}</h2>
            <p className="t-body mt-1">{s.body}</p>
          </section>
        ))}
        <section aria-label="Key takeaway" className="sticker !bg-leaf/15 p-4">
          <p className="t-caption font-bold uppercase tracking-wide text-leaf-ink">Key takeaway</p>
          <p className="t-body mt-1 font-bold">{lesson.takeaway}</p>
        </section>

        <section aria-label="Check yourself" className="sticker flex flex-col gap-3 p-4">
          <h2 className="t-title">Check yourself</h2>
          <p className="t-body">{lesson.check.q}</p>
          <div role="radiogroup" aria-label="Answer" className="flex flex-col gap-2">
            {lesson.check.options.map((o, i) => {
              const state = picked === i ? (i === lesson.check.answer ? 'bg-leaf/25 ring-2 ring-leaf-ink' : 'bg-tomato/15 ring-2 ring-tomato-ink') : 'bg-white'
              return (
                <button key={o} role="radio" aria-checked={picked === i} onClick={() => choose(i)} className={`min-h-12 rounded-xl border-2 border-ink px-3 text-left font-bold ${state}`}>{o}</button>
              )
            })}
          </div>
          {picked !== null && (
            <p role="status" className="t-body rounded-xl bg-paper-deep p-3">
              <b>{right ? 'Right! ' : 'Not quite. '}</b>{lesson.check.why}
            </p>
          )}
          {isDone && <p className="t-caption font-bold text-leaf-ink">✓ Lesson complete</p>}
        </section>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" className="w-full" onClick={() => navigate(lesson.tryIt.to)}>{lesson.tryIt.label} <span aria-hidden>→</span></Button>
          {next ? (
            <Button className="w-full" onClick={() => navigate(`/c/invest/learn/${next.id}`)}>Next: {next.title}</Button>
          ) : (
            <Button className="w-full" onClick={() => navigate('/c/invest/sim')}>Back to practice</Button>
          )}
          <Link to="/c/invest/learn" className="t-caption inline-flex min-h-11 items-center justify-center font-bold underline">All lessons</Link>
        </div>
        <DisclosureBanner invest />
      </main>
    </div>
  )
}
