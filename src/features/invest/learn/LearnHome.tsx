import { Link } from 'react-router-dom'
import { DisclosureBanner } from '../../../components/ui/DisclosureBanner'
import { EMPTY_LEARNED, useActiveChild, useStore } from '../../../store'
import { InvestHeader } from '../InvestHeader'
import { LearnTabs } from './LearnTabs'
import { lessons } from './lessons'

export function LearnHome() {
  const child = useActiveChild()
  const done = useStore((s) => (child ? s.learned[child.id] : undefined)) ?? EMPTY_LEARNED
  if (!child) return null
  const next = lessons.find((l) => !done.includes(l.id))
  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title="Investing" tag="Virtual money" />
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-8 pt-3">
        <LearnTabs value="learn" />
        <section aria-label="Your progress" className="sticker p-4">
          <h1 className="t-title">Learn the basics</h1>
          <p className="t-body mt-1 text-ink-soft">Short lessons on how mutual funds work, in plain words. A good place to start before a real SIP.</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={lessons.length} aria-valuenow={done.length} aria-label="Lessons finished">
              <span className="block h-full rounded-full bg-leaf transition-[width]" style={{ width: `${(done.length / lessons.length) * 100}%` }} />
            </span>
            <b className="t-money">{done.length} of {lessons.length}</b>
          </div>
        </section>
        <ol className="flex flex-col gap-3" aria-label="Lessons">
          {lessons.map((l, i) => {
            const isDone = done.includes(l.id)
            const isNext = next?.id === l.id
            return (
              <li key={l.id}>
                <Link to={`/c/invest/learn/${l.id}`} className={`sticker flex min-h-20 items-center gap-3 p-3 no-underline ${isNext ? '!bg-saffron/25' : ''}`}>
                  <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl bg-paper-deep text-2xl">{l.emoji}</span>
                  <span className="flex-1">
                    <span className="t-caption block text-ink-soft">Lesson {i + 1} · {l.minutes} min</span>
                    <span className="block font-bold">{l.title}</span>
                    <span className="t-caption block text-ink-soft">{l.blurb}</span>
                  </span>
                  <span className={`t-caption shrink-0 rounded-full px-3 py-1 font-bold ${isDone ? 'bg-leaf/20 text-leaf-ink' : isNext ? 'bg-ink text-paper' : 'bg-paper-deep'}`}>
                    {isDone ? 'Done ✓' : isNext ? 'Up next' : 'Start'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
        <DisclosureBanner invest />
      </main>
    </div>
  )
}
