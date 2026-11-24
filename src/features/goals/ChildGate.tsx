import { useEffect } from 'react'
import { Navigate, Outlet, useBlocker, useLocation } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { hasOwnPhone, personas, type PersonaId } from '../../demo/personas'
import { useActiveChild, useActivePersona, useStore } from '../../store'
import { ChildNav } from './ChildNav'
import { showsNav } from './showsNav'

const bandOf = { kid: '8-11', teen: '12-14', pro: '15-17' } as const

/**
 * Child routes need a child. Children use a device of their own (a parent's phone, or their own), so
 * pressing back must never land on a parent screen: history moves that leave /c/* are blocked.
 * Own-phone children who have not logged in are sent to their invite message first.
 */
export function ChildGate() {
  const child = useActiveChild()
  const persona = useActivePersona()
  const children = useStore((s) => s.children)
  const setPersona = useStore((s) => s.setPersona)
  const load = useStore((s) => s.loadDemoFamily)
  const { pathname } = useLocation()

  const blocker = useBlocker(({ historyAction, nextLocation }) => Boolean(child) && historyAction === 'POP' && !nextLocation.pathname.startsWith('/c/'))
  useEffect(() => {
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  if (child && hasOwnPhone(child) && !child.loggedIn) return <Navigate to="/c/notify" replace />
  if (child) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex-1"><Outlet /></div>
        {showsNav(pathname) && <ChildNav child={child} pathname={pathname} />}
      </div>
    )
  }

  const switchable = (Object.keys(personas) as PersonaId[]).filter(
    (id) => personas[id].view === 'child' && children.some((c) => c.ageBand === bandOf[personas[id].band]),
  )
  return (
    <main className="flex flex-col items-center gap-4 p-8 text-center">
      <h1 className="t-display">{persona.view === 'parent' ? `You're viewing as ${persona.name}` : `No account for ${persona.name} yet`}</h1>
      {switchable.length > 0 ? (
        <>
          <p className="t-body text-ink-soft">This is a child screen. Switch to a child to see it.</p>
          {switchable.map((id) => (
            <Button key={id} onClick={() => setPersona(id)} className="w-full">
              View as {personas[id].name}
            </Button>
          ))}
        </>
      ) : (
        <>
          <p className="t-body text-ink-soft">Set up a family first, or load the demo family to skip ahead.</p>
          <Button onClick={load} className="w-full">Load demo family</Button>
        </>
      )}
    </main>
  )
}
