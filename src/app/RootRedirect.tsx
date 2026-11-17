import { Navigate } from 'react-router-dom'
import { smartHome } from '../demo/smartHome'
import { useStore } from '../store'

export function RootRedirect() {
  const id = useStore((s) => s.activePersona)
  return <Navigate to={smartHome(id)} replace />
}
