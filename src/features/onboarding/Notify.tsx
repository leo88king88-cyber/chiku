import { useNavigate } from 'react-router-dom'
import { LockScreen } from '../../components/ui/LockScreen'
import { PARENT_APP } from '../../lib/brand'

/** First screen for a parent: a push notification from the existing app. Tapping it opens the welcome screen. */
export function Notify() {
  const navigate = useNavigate()
  return (
    <LockScreen
      app={PARENT_APP}
      icon={PARENT_APP[0]}
      title="Meet Chiku 🐦"
      body="Money skills for your child, with you in charge. Set up in 2 minutes with your existing login."
      onOpen={() => navigate('/p/welcome')}
    />
  )
}
