import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { formatINR } from '../../lib/money'
import { useStore } from '../../store'
import { useToast } from '../../store/toast'
import type { Chore } from '../../store/types'

const suggestions = ['Make the bed', 'Water the plants', 'Tidy my room', 'Help with dinner', 'Finish homework on time', 'Wash the car']
const OTHER = 'Something else'

/** Priya adds tasks, and checks and pays the ones a child says are done. */
export function ParentTasks() {
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const children = useStore((s) => s.children)
  const chores = useStore((s) => s.chores)
  const addChore = useStore((s) => s.addChore)
  const approve = useStore((s) => s.approveChore)
  const sendBack = useStore((s) => s.sendBackChore)
  const remove = useStore((s) => s.removeChore)
  const toast = useToast((s) => s.show)
  const [childId, setChildId] = useState(sp.get('child') ?? children[0]?.id ?? '')
  const [pick, setPick] = useState(suggestions[0])
  const [custom, setCustom] = useState('')
  const [reward, setReward] = useState(50)

  const title = pick === OTHER ? custom.trim() : pick
  const child = children.find((c) => c.id === childId)
  const name = (id: string) => children.find((c) => c.id === id)?.name ?? ''
  const review = chores.filter((k) => k.status === 'review')

  const add = () => {
    if (!title || !child) return
    addChore(child.id, title, reward)
    toast(`Added for ${child.name}: ${title}`)
    setCustom('')
  }

  const item = (k: Chore, actions: React.ReactNode) => (
    <li key={k.id} className="flex flex-col gap-2 rounded-xl bg-paper-deep p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold">{k.title}</span>
        <span className="t-money font-bold">{formatINR(k.reward)}</span>
      </div>
      {actions}
    </li>
  )

  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header className="flex items-center gap-2">
        <button aria-label="Back" onClick={() => navigate('/p/home')} className="grid size-11 place-items-center rounded-full text-2xl">←</button>
        <h1 className="t-display">Tasks</h1>
      </header>
      <p className="t-body text-ink-soft">Set a task and a reward. When your child says it's done, you check it and the reward goes into their Can spend.</p>

      {review.length > 0 && (
        <section aria-label="Waiting for you" className="sticker !bg-saffron/25 flex flex-col gap-3 p-4">
          <h2 className="t-title">Waiting for you</h2>
          <ul className="flex flex-col gap-3">
            {review.map((k) =>
              item(
                k,
                <>
                  <p className="t-caption text-ink-soft">{name(k.childId)} says this is done.</p>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => { approve(k.id); toast(`Paid ${formatINR(k.reward)} to ${name(k.childId)}`) }}>Approve and pay</Button>
                    <Button variant="secondary" className="flex-1" onClick={() => { sendBack(k.id); toast('Sent back to do again') }}>Not yet</Button>
                  </div>
                </>,
              ),
            )}
          </ul>
        </section>
      )}

      <section aria-label="Add a task" className="sticker flex flex-col gap-4 p-4">
        <h2 className="t-title">Add a task</h2>
        <div className="flex flex-col gap-2">
          <p className="font-bold">For</p>
          <ChoiceChips label="Child" value={childId} options={children.map((c) => ({ value: c.id, label: c.name }))} onChange={setChildId} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-bold">Task</p>
          <ChoiceChips label="Task" value={pick} options={[...suggestions, OTHER].map((v) => ({ value: v, label: v }))} onChange={setPick} />
          {pick === OTHER && (
            <input value={custom} onChange={(e) => setCustom(e.target.value)} autoComplete="off" aria-label="Task name" placeholder="e.g. Feed the dog" className="sticker min-h-12 px-4 outline-none focus-visible:ring-4 focus-visible:ring-sky" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-bold">Reward</p>
          <ChoiceChips label="Reward" value={reward} options={[20, 50, 100, 200].map((v) => ({ value: v, label: formatINR(v) }))} onChange={setReward} />
        </div>
        <Button disabled={!title || !child} onClick={add} className="w-full">Add task</Button>
      </section>

      {children.map((c) => {
        const mine = chores.filter((k) => k.childId === c.id && k.status !== 'review')
        return (
          <section key={c.id} aria-label={`${c.name}'s tasks`} className="flex flex-col gap-2">
            <h2 className="t-title">{c.name}'s tasks</h2>
            {mine.length === 0 ? (
              <p className="t-caption text-ink-soft">No open tasks.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {mine.map((k) =>
                  item(
                    k,
                    k.status === 'paid' ? (
                      <p className="t-caption font-bold text-leaf-ink">✓ Paid</p>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <p className="t-caption text-ink-soft">To do</p>
                        <Button variant="ghost" className="!min-h-11 !px-2 !text-sm" onClick={() => remove(k.id)}>Remove</Button>
                      </div>
                    ),
                  ),
                )}
              </ul>
            )}
          </section>
        )
      })}
    </main>
  )
}
