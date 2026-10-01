import { createContext, useContext } from 'react'

/** Page search entries open the same palette as app chrome and the keyboard shortcut. */
export const SearchContext = createContext<(() => void) | null>(null)

export function useOpenSearch() {
  return useContext(SearchContext)
}
