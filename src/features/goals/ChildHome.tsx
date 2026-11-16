import { useActiveChild, useActivePersona } from '../../store'
import { HomeKid } from './HomeKid'
import { HomeTeen } from './HomeTeen'

export function ChildHome() {
  const child = useActiveChild()
  const { band } = useActivePersona()
  if (!child) return null
  return band === 'kid' ? <HomeKid child={child} /> : <HomeTeen child={child} />
}
