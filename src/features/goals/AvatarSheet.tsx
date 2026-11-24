import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { avatars } from '../../lib/avatars'
import { useStore } from '../../store'
import type { Child } from '../../store/types'

/** Pick or change an avatar. Opens from the avatar on the child's home screen. */
export function AvatarSheet({ child, open, onClose }: { child: Child; open: boolean; onClose: () => void }) {
  const updateChild = useStore((s) => s.updateChild)
  return (
    <Sheet open={open} onClose={onClose} title="Pick your avatar">
      <h2 className="t-title">Pick your avatar</h2>
      <p className="t-body mt-1 text-ink-soft">This is how you show up in the app. You can change it any time.</p>
      <div role="radiogroup" aria-label="Avatar" className="my-4 grid grid-cols-4 gap-3">
        {avatars.map((a) => (
          <button
            key={a}
            role="radio"
            aria-checked={child.avatar === a}
            aria-label={`Avatar ${a}`}
            onClick={() => { updateChild(child.id, { avatar: a }); onClose() }}
            className={`sticker grid h-16 place-items-center text-3xl ${child.avatar === a ? '!bg-saffron/40 ring-4 ring-saffron' : ''}`}
          >
            <span aria-hidden>{a}</span>
          </button>
        ))}
      </div>
      <Button variant="ghost" className="w-full" onClick={onClose}>Close</Button>
    </Sheet>
  )
}
