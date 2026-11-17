import { Navigate, Outlet } from 'react-router-dom'
import { useStore } from '../store'

/** Everything after sign-in needs a logged-in guardian. Welcome, explainer and login are open. */
export function ParentGate() {
  const loggedIn = useStore((s) => s.account.loggedIn)
  return loggedIn ? <Outlet /> : <Navigate to="/p/login" replace />
}
