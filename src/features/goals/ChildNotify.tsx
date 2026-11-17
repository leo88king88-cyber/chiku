import { Navigate, useNavigate } from 'react-router-dom'
import { LockScreen } from '../../components/ui/LockScreen'
import { useActiveChild, useStore } from '../../store'

/** Own-phone children (15-17) start from a message their parent sent. Tapping it opens the invite. */
export function ChildNotify() {
  const navigate = useNavigate()
  const child = useActiveChild()
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  if (!child) return <Navigate to="/c/home" replace />
  if (child.loggedIn) return <Navigate to="/c/home" replace />
  return (
    <LockScreen
      app="Messages"
      icon="💬"
      title={parent}
      body={`${child.name}, I've set you up on Chiku. Tap to join. You can practise with pretend money first.`}
      hint="Tap the message"
      onOpen={() => navigate(`/join/${child.inviteCode}`)}
    />
  )
}
