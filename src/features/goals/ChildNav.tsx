import { NavLink } from 'react-router-dom'
import { useActivePersona, useStore } from '../../store'
import type { Child } from '../../store/types'

type Item = { to: string; label: string; icon: string; match: (p: string) => boolean }

const home: Item = { to: '/c/home', label: 'Home', icon: '🏠', match: (p) => p === '/c/home' }
const goal: Item = { to: '/c/goals', label: 'Goal', icon: '🎯', match: (p) => p.startsWith('/c/goal') }
const tasks: Item = { to: '/c/tasks', label: 'Tasks', icon: '✅', match: (p) => p === '/c/tasks' }
const activity: Item = { to: '/c/activity', label: 'Activity', icon: '🧾', match: (p) => p === '/c/activity' }
const invest: Item = { to: '/c/invest/sim', label: 'Invest', icon: '📈', match: (p) => p.startsWith('/c/invest') }

/** Bottom navigation for a child. Fewer tabs for younger children. */
export function ChildNav({ child, pathname }: { child: Child; pathname: string }) {
  const { band } = useActivePersona()
  const todo = useStore((s) => s.chores.filter((k) => k.childId === child.id && k.status === 'todo').length)
  const items = band === 'kid' ? [home, goal, tasks] : band === 'teen' ? [home, goal, tasks, activity] : [home, goal, tasks, invest]
  return (
    <nav aria-label="Main" className="sticky bottom-0 z-10 flex border-t-[length:var(--bw)] border-[color:var(--border-color)] bg-paper px-2 pb-2 pt-1">
      {items.map((it) => {
        const on = it.match(pathname)
        return (
          <NavLink
            key={it.to}
            to={it.to}
            replace
            aria-current={on ? 'page' : undefined}
            className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl no-underline ${on ? 'bg-saffron/30 font-bold' : ''}`}
          >
            <span aria-hidden className="text-2xl">{it.icon}</span>
            <span className="t-caption">{it.label}</span>
            {it === tasks && todo > 0 && (
              <span aria-label={`${todo} to do`} className="absolute right-3 top-0.5 grid size-6 place-items-center rounded-full bg-tomato-ink text-sm font-bold text-white">{todo}</span>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
