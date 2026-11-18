import { lazy } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { ChildGate } from '../features/goals/ChildGate'
import { NotFound } from '../features/shell/NotFound'
import { AppShell } from './AppShell'
import { WireframeShell } from '../features/wireframe/WireframeShell'
import { ErrorScreen } from './ErrorScreen'
import { ParentGate } from './ParentGate'
import { RootRedirect } from './RootRedirect'

/** Code-split every screen; AppShell shows a skeleton while a chunk loads. */
const screen = <T extends Record<string, React.ComponentType<never>>>(load: () => Promise<T>, name: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[name] as React.ComponentType })))

const Notify = screen(() => import('../features/onboarding/Notify'), 'Notify')
const Login = screen(() => import('../features/onboarding/Login'), 'Login')
const ChildNotify = screen(() => import('../features/goals/ChildNotify'), 'ChildNotify')
const Upmoney = screen(() => import('../features/onboarding/Upmoney'), 'Upmoney')
const Welcome = screen(() => import('../features/onboarding/Welcome'), 'Welcome')
const CanAndCant = screen(() => import('../features/onboarding/CanAndCant'), 'CanAndCant')
const AddChild = screen(() => import('../features/onboarding/AddChild'), 'AddChild')
const Kyc = screen(() => import('../features/onboarding/Kyc'), 'Kyc')
const Controls = screen(() => import('../features/onboarding/Controls'), 'Controls')
const PocketMoney = screen(() => import('../features/onboarding/PocketMoney'), 'PocketMoney')
const Success = screen(() => import('../features/onboarding/Success'), 'Success')
const Join = screen(() => import('../features/onboarding/Join'), 'Join')
const ParentHome = screen(() => import('../features/parent/ParentHome'), 'ParentHome')
const Approvals = screen(() => import('../features/parent/Approvals'), 'Approvals')
const ChildHome = screen(() => import('../features/goals/ChildHome'), 'ChildHome')
const NewGoal = screen(() => import('../features/goals/NewGoal'), 'NewGoal')
const NextGoal = screen(() => import('../features/goals/NewGoal'), 'NextGoal')
const GoalDetail = screen(() => import('../features/goals/GoalDetail'), 'GoalDetail')
const GoalDone = screen(() => import('../features/goals/GoalDone'), 'GoalDone')
const RequestMoney = screen(() => import('../features/goals/RequestMoney'), 'RequestMoney')
const Insights = screen(() => import('../features/goals/Insights'), 'Insights')
const SimHub = screen(() => import('../features/invest/SimHub'), 'SimHub')
const FundDetail = screen(() => import('../features/invest/FundDetail'), 'FundDetail')
const Compare = screen(() => import('../features/invest/Compare'), 'Compare')
const Quiz = screen(() => import('../features/invest/Quiz'), 'Quiz')
const SipRequest = screen(() => import('../features/invest/SipRequest'), 'SipRequest')
const SipStatus = screen(() => import('../features/invest/SipStatus'), 'SipStatus')
const SipConfirmed = screen(() => import('../features/invest/SipConfirmed'), 'SipConfirmed')
const Graduation = screen(() => import('../features/invest/Graduation'), 'Graduation')

const Storyboard = screen(() => import('../features/wireframe/Storyboard'), 'Storyboard')
const Play = screen(() => import('../features/wireframe/Play'), 'Play')

const routes: RouteObject[] = [
  {
    // The design-flow page is wide and scrollable, so it lives outside the phone frame.
    element: <WireframeShell />,
    errorElement: <ErrorScreen />,
    children: [
      { path: '/c/wireframe', element: <Storyboard /> },
      { path: '/c/wireframe/play/:flow', element: <Play /> },
    ],
  },
  {
    element: <AppShell />,
    errorElement: <ErrorScreen />,
    children: [
      { path: '/', element: <RootRedirect /> },
      { path: '/join/:code', element: <Join /> },
      { path: '/p/notify', element: <Notify /> },
      { path: '/p/upmoney', element: <Upmoney /> },
      { path: '/p/welcome', element: <Welcome /> },
      { path: '/p/can-and-cant', element: <CanAndCant /> },
      { path: '/p/login', element: <Login /> },
      { path: '/c/notify', element: <ChildNotify /> },
      {
        element: <ParentGate />,
        children: [
          { path: '/p/add-child', element: <AddChild /> },
          { path: '/p/kyc', element: <Kyc /> },
          { path: '/p/controls', element: <Controls /> },
          { path: '/p/pocket-money', element: <PocketMoney /> },
          { path: '/p/success', element: <Success /> },
          { path: '/p/home', element: <ParentHome /> },
          { path: '/p/approvals', element: <Approvals /> },
        ],
      },
      {
        element: <ChildGate />,
        children: [
          { path: '/c/home', element: <ChildHome /> },
          { path: '/c/goal/new', element: <NewGoal /> },
          { path: '/c/next-goal', element: <NextGoal /> },
          { path: '/c/goal/:id', element: <GoalDetail /> },
          { path: '/c/goal/:id/done', element: <GoalDone /> },
          { path: '/c/request-money', element: <RequestMoney /> },
          { path: '/c/insights', element: <Insights /> },
          { path: '/c/invest/sim', element: <SimHub /> },
          { path: '/c/invest/fund/:id', element: <FundDetail /> },
          { path: '/c/invest/compare', element: <Compare /> },
          { path: '/c/invest/quiz', element: <Quiz /> },
          { path: '/c/invest/request', element: <SipRequest /> },
          { path: '/c/invest/status', element: <SipStatus /> },
          { path: '/c/invest/sip-confirmed', element: <SipConfirmed /> },
          { path: '/c/invest/graduation', element: <Graduation /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
