import { useSearchParams } from 'react-router-dom'
import { useStore } from '../../store'

/** First child: 6 steps. Further children skip the explainer, login and KYC: 3 steps. */
export function useFlow() {
  const [sp] = useSearchParams()
  const draftIdx = useStore((s) => s.children.findIndex((c) => c.id === s.draftChildId))
  const second = sp.get('second') === '1' || draftIdx > 0
  return {
    second,
    total: second ? 3 : 6,
    step: (first: number) => (second ? ({ 3: 1, 5: 2, 6: 3 } as Record<number, number>)[first] ?? 1 : first),
  }
}

/** Steps (first-child numbering): 1 can/can't, 2 login, 3 add child, 4 KYC, 5 controls, 6 pocket money. */
export const stepNo = { explainer: 1, login: 2, addChild: 3, kyc: 4, controls: 5, pocket: 6 } as const
