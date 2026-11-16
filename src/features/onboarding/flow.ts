import { useSearchParams } from 'react-router-dom'
import { useStore } from '../../store'

/** First child: 5 steps. Further children skip the explainer and KYC: 3 steps. */
export function useFlow() {
  const [sp] = useSearchParams()
  const draftIdx = useStore((s) => s.children.findIndex((c) => c.id === s.draftChildId))
  const second = sp.get('second') === '1' || draftIdx > 0
  return {
    second,
    total: second ? 3 : 5,
    step: (first: number) => (second ? Math.max(first - 2, 1) : first),
  }
}

/** Steps (first-child numbering): 1 can/can't, 2 add child, 3 KYC, 4 controls, 5 pocket money. */
export const stepNo = { explainer: 1, addChild: 2, kyc: 3, controls: 4, pocket: 5 } as const
