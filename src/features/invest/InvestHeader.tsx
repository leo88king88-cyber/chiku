import { useNavigate } from 'react-router-dom'

export function InvestHeader({ title, back = '/c/home', tag }: { title: string; back?: string; tag?: string }) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-2 px-3 pt-3">
      <button aria-label="Back" onClick={() => navigate(back)} className="grid size-11 place-items-center rounded-full text-2xl">←</button>
      <h1 className="t-title flex-1">{title}</h1>
      {tag && <span className="t-caption rounded-full bg-plum/15 px-3 py-1 font-bold">{tag}</span>}
    </header>
  )
}
