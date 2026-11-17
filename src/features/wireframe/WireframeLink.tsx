import { Link } from 'react-router-dom'
import type { FlowKey } from './types'

/** Cross-link from the live app into a flow on the wireframe page. */
export function WireframeLink({ flow, children = 'See this flow' }: { flow: FlowKey; children?: string }) {
  return (
    <Link to={`/c/wireframe?flow=${flow}`} className="t-caption inline-flex min-h-11 items-center gap-1 font-bold underline">
      {children} <span aria-hidden>→</span>
    </Link>
  )
}
