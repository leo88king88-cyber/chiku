import { useNavigate } from 'react-router-dom'

export function ChildHeader({ title, back = '/c/home' }: { title?: string; back?: string }) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-2 px-3 pt-3">
      <button aria-label="Back" onClick={() => navigate(back)} className="grid size-11 place-items-center rounded-full text-2xl">←</button>
      {title && <h1 className="t-title">{title}</h1>}
    </header>
  )
}
