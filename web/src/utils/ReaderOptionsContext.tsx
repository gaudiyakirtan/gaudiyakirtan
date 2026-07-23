import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Lets the **song screen** publish "a song is open, and here is what it actually has" so the
 * **mobile top bar** — which lives in `Layout`, a parent, and therefore cannot see the song — can
 * render the Display control beside the search icon.
 *
 * Same shape as the player's `arm(song)` / `arm(null)`: the screen registers on mount and clears on
 * leave, so the control appears only where it means something. The toggles themselves are not here;
 * they live in `SettingsContext` and are app-wide, so `ReaderOptions` reads them directly wherever
 * it is rendered. All that is song-specific is whether a toggle has anything to show.
 */
export interface IReaderCapabilities {
  hasWordToWord: boolean
  hasTranslation: boolean
}

interface IReaderOptionsContext {
  /** Non-null exactly while a song screen is mounted. */
  capabilities: IReaderCapabilities | null
  setCapabilities: (capabilities: IReaderCapabilities | null) => void
}

const ReaderOptionsContext = createContext<IReaderOptionsContext>({
  capabilities: null,
  setCapabilities: () => {},
})

export const ReaderOptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capabilities, setCapabilitiesState] = useState<IReaderCapabilities | null>(null)
  const setCapabilities = useCallback(
    (next: IReaderCapabilities | null) => setCapabilitiesState(next),
    []
  )
  const value = useMemo(() => ({ capabilities, setCapabilities }), [capabilities, setCapabilities])
  return <ReaderOptionsContext.Provider value={value}>{children}</ReaderOptionsContext.Provider>
}

export const useReaderOptions = () => useContext(ReaderOptionsContext)

/**
 * Registers a song's reader capabilities for as long as the calling screen is mounted.
 * Primitive args (not an object) so a caller doesn't have to memoize to avoid a re-register loop.
 */
export function useRegisterReaderOptions(hasWordToWord: boolean, hasTranslation: boolean): void {
  const { setCapabilities } = useReaderOptions()
  React.useEffect(() => {
    setCapabilities({ hasWordToWord, hasTranslation })
    return () => setCapabilities(null)
  }, [hasWordToWord, hasTranslation, setCapabilities])
}

export default ReaderOptionsContext
