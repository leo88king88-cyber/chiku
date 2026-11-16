import { Outlet } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { personas, type PersonaId } from '../../demo/personas'
import { useActiveChild, useActivePersona, useStore } from '../../store'

const bandOf = { kid: '8-11', teen: '12-14', pro: '15-17' } as const

/** Child routes need a child. If there isn't one, explain and offer the quick way in. */
export function ChildGate() {
  const child = useActiveChild()
  const persona = useActivePersona()
  const children = useStore((s) => s.children)
  const setPersona = useStore((s) => s.setPersona)
  const load = useStore((s) => s.loadDemoFamily)
  if (child) return <Outlet />

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
