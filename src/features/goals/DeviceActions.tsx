import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Keypad } from '../../components/ui/Keypad'
import { Sheet } from '../../components/ui/Sheet'
import { smartHome } from '../../demo/smartHome'
import { hasOwnPhone } from '../../demo/personas'
import { useStore } from '../../store'
import type { Child } from '../../store/types'

/**
 * The way out of a child's session. On a parent's phone it is "hand back" behind the parent's PIN, so a
 * child cannot wander into the parent's screens. On their own phone it is a plain log out.
 */
export function DeviceActions({ child }: { child: Child }) {
  const navigate = useNavigate()
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const setPersona = useStore((s) => s.setPersona)
  const logout = useStore((s) => s.childLogout)
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (pin.length !== 4) return
    const t = setTimeout(() => {
      setPersona('priya')
      navigate(smartHome('priya'), { replace: true })
    }, 400)
    return () => clearTimeout(t)
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

  if (hasOwnPhone(child)) {
    return (
      <Button variant="ghost" className="w-full" onClick={() => { logout(child.id); navigate('/c/notify', { replace: true }) }}>
        Log out
      </Button>
    )
  }
  return (
    <>
      <p className="t-caption text-center text-ink-soft">You're using {parent}'s phone</p>
      <Button variant="ghost" className="w-full" onClick={() => { setPin(''); setOpen(true) }}>🔒 Hand back to {parent}</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Hand back">
        <h2 className="t-title text-center">{parent}, enter your PIN</h2>
        <p className="t-caption mb-3 text-center text-ink-soft">Demo: any 4 digits</p>
        <div className="mb-4 flex justify-center gap-3" aria-label={`${pin.length} of 4 digits entered`}>
          {Array.from({ length: 4 }, (_, i) => <span key={i} className={`size-4 rounded-full border-2 border-ink ${i < pin.length ? 'bg-ink' : ''}`} />)}
        </div>
        <Keypad onDigit={(d) => setPin((p) => (p.length < 4 ? p + d : p))} onBackspace={() => setPin((p) => p.slice(0, -1))} />
        <Button variant="ghost" className="mt-2 w-full" onClick={() => setOpen(false)}>Cancel</Button>
      </Sheet>
    </>
  )
}
