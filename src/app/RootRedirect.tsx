import { Navigate } from 'react-router-dom'
import { personas } from '../demo/personas'
import { useStore } from '../store'

export function RootRedirect() {
  const id = useStore((s) => s.activePersona)
  return <Navigate to={personas[id].home} replace />
}
