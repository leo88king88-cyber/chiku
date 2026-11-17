import { createContext, useContext } from 'react'

/** True inside storyboard frames: atoms render their final state instantly, with no entrance motion. */
export const StaticModeContext = createContext(false)
export const useStaticMode = () => useContext(StaticModeContext)
