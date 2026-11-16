export type Band = 'kid' | 'teen' | 'pro'
export type AgeBand = '8-11' | '12-14' | '15-17'

export const ageBandToBand: Record<AgeBand, Band> = {
  '8-11': 'kid',
  '12-14': 'teen',
  '15-17': 'pro',
}
