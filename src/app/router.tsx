import { createBrowserRouter } from 'react-router-dom'
import { ChildGate } from '../features/goals/ChildGate'
import { ChildHome } from '../features/goals/ChildHome'
import { GoalDetail } from '../features/goals/GoalDetail'
import { GoalDone } from '../features/goals/GoalDone'
import { Insights } from '../features/goals/Insights'
import { NewGoal } from '../features/goals/NewGoal'
import { RequestMoney } from '../features/goals/RequestMoney'
import { Approvals } from '../features/parent/Approvals'
import { Join } from '../features/onboarding/Join'
import { AddChild } from '../features/onboarding/AddChild'
import { CanAndCant } from '../features/onboarding/CanAndCant'
import { Controls } from '../features/onboarding/Controls'
import { Kyc } from '../features/onboarding/Kyc'
import { PocketMoney } from '../features/onboarding/PocketMoney'
import { Success } from '../features/onboarding/Success'
import { Welcome } from '../features/onboarding/Welcome'
import { ParentHome } from '../features/parent/ParentHome'
import { Placeholder } from '../features/shell/Placeholder'
import { AppShell } from './AppShell'
import { RootRedirect } from './RootRedirect'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <RootRedirect /> },
      { path: '/join/:code', element: <Join /> },
      { path: '/p/welcome', element: <Welcome /> },
      { path: '/p/can-and-cant', element: <CanAndCant /> },
      { path: '/p/add-child', element: <AddChild /> },
      { path: '/p/kyc', element: <Kyc /> },
      { path: '/p/controls', element: <Controls /> },
      { path: '/p/pocket-money', element: <PocketMoney /> },
      { path: '/p/success', element: <Success /> },
      { path: '/p/home', element: <ParentHome /> },
      { path: '/p/approvals', element: <Approvals /> },
      {
        element: <ChildGate />,
        children: [
          { path: '/c/home', element: <ChildHome /> },
          { path: '/c/goal/new', element: <NewGoal /> },
          { path: '/c/next-goal', element: <NewGoal next /> },
          { path: '/c/goal/:id', element: <GoalDetail /> },
          { path: '/c/goal/:id/done', element: <GoalDone /> },
          { path: '/c/request-money', element: <RequestMoney /> },
          { path: '/c/insights', element: <Insights /> },
        ],
      },
      // Flows 2 and 3 land here in later milestones.
      { path: '*', element: <Placeholder /> },
    ],
  },
])
