import { createBrowserRouter, Navigate } from 'react-router-dom'
import { personas } from '../demo/personas'
import { Placeholder } from '../features/shell/Placeholder'
import { useStore } from '../store'
import { AppShell } from './AppShell'

function RootRedirect() {
  const id = useStore((s) => s.activePersona)
  return <Navigate to={personas[id].home} replace />
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <RootRedirect /> },
      // Flow screens land here in later milestones; every path renders the placeholder for now.
      { path: '*', element: <Placeholder /> },
    ],
  },
])
