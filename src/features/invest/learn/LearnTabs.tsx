import { useNavigate } from 'react-router-dom'
import { Segmented } from '../../../components/ui/Segmented'

/** Practice and Learn sit side by side in the investing area. */
export function LearnTabs({ value }: { value: 'practice' | 'learn' }) {
  const navigate = useNavigate()
  return (
    <Segmented<'practice' | 'learn'>
      label="Investing sections"
      value={value}
      onChange={(v) => navigate(v === 'practice' ? '/c/invest/sim' : '/c/invest/learn', { replace: true })}
      options={[
        { value: 'practice', label: 'Practice', hint: 'Virtual money' },
        { value: 'learn', label: 'Learn', hint: 'The basics' },
      ]}
    />
  )
}
