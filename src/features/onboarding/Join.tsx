import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import type { PersonaId } from '../../demo/personas'
import { useStore } from '../../store'
import { ageBandToBand } from '../../theme/bands'

const avatars = ['🦊', '🐯', '🦄', '🐼', '🚀', '⚽']
const personaFor: Record<string, PersonaId> = { '8-11': 'aarav', '12-14': 'ananya', '15-17': 'rohan' }

/** Child side of the invite: pick an avatar and step into the app. */
export function Join() {
  const { code } = useParams()
  const navigate = useNavigate()
  const child = useStore((s) => s.children.find((c) => c.inviteCode === code))
  const updateChild = useStore((s) => s.updateChild)
  const setPersona = useStore((s) => s.setPersona)
  const [avatar, setAvatar] = useState(avatars[0])

  if (!child) {
    return (
      <main className="flex flex-col items-center gap-4 p-8 text-center">
        <h1 className="t-display">Invite not found</h1>
        <p className="t-body text-ink-soft">Ask your parent to send the invite again.</p>
      </main>
    )
  }

  return (
    <div data-band={ageBandToBand[child.ageBand]} className="flex min-h-full flex-col">
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-10 text-center">
        <Chiku size={120} cheer />
        <h1 className="t-display">Hi {child.name}! I'm Chiku.</h1>
        <p className="t-body">Pick your buddy. You can change it later.</p>
        <div role="radiogroup" aria-label="Avatar" className="grid w-full grid-cols-3 gap-3">
          {avatars.map((a) => (
            <button
              key={a}
              role="radio"
              aria-checked={avatar === a}
              aria-label={`Avatar ${a}`}
              onClick={() => setAvatar(a)}
              className={`sticker grid h-20 place-items-center text-4xl ${avatar === a ? '!bg-saffron/40 ring-4 ring-saffron' : ''}`}
            >
              {a}
            </button>
          ))}
        </div>
      </main>
      <footer className="px-5 pb-6 pt-4">
        <Button
          className="w-full"
          onClick={() => {
            updateChild(child.id, { avatar, inviteStatus: 'accepted' })
            setPersona(personaFor[child.ageBand])
            navigate('/c/home')
          }}
        >
          Let's go!
        </Button>
      </footer>
    </div>
  )
}
