import { useContext } from 'react'
import { GlobalsContext, GlobalsContextValue } from '@/@core/context/globalContext'

export const useGlobals = (): GlobalsContextValue => useContext(GlobalsContext)
