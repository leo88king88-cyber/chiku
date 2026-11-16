import { createBrowserRouter, Navigate } from 'react-router-dom'
import { personas } from '../demo/personas'
import { AddChild } from '../features/onboarding/AddChild'
import { CanAndCant } from '../features/onboarding/CanAndCant'
import { Controls } from '../features/onboarding/Controls'
import { Kyc } from '../features/onboarding/Kyc'
import { PocketMoney } from '../features/onboarding/PocketMoney'
import { Success } from '../features/onboarding/Success'
import { Welcome } from '../features/onboarding/Welcome'
import { ParentHome } from '../features/parent/ParentHome'
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
      { path: '/p/welcome', element: <Welcome /> },
      { path: '/p/can-and-cant', element: <CanAndCant /> },
      { path: '/p/add-child', element: <AddChild /> },
      { path: '/p/kyc', element: <Kyc /> },
      { path: '/p/controls', element: <Controls /> },
      { path: '/p/pocket-money', element: <PocketMoney /> },
      { path: '/p/success', element: <Success /> },
      { path: '/p/home', element: <ParentHome /> },
      // Flows 2 and 3 land here in later milestones.
      { path: '*', element: <Placeholder /> },
    ],
  },
])
