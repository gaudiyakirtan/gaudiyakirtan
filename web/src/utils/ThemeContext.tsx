import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// App palette selection (docs/screens/settings.md `theme`). The full two-palette Gaura/Shyam
// system is a later dedicated slice; for now the three-way preference maps onto the existing
// light/dark CSS-variable mechanism (styles/colors.css):
//   gaura -> light, shyam -> dark, system -> prefers-color-scheme.
// `theme` (effective light/dark) and `toggleTheme` are kept for the existing Sidebar toggle.

export type ThemePreference = 'gaura' | 'shyam' | 'system'
type EffectiveTheme = 'light' | 'dark'

const STORAGE_KEY = 'gk-theme'

interface ThemeContextType {
  /** The persisted user choice: gaura / shyam / system. */
  themePreference: ThemePreference
  /** The resolved theme after applying `system`. */
  theme: EffectiveTheme
  setThemePreference: (preference: ThemePreference) => void
  /** Flips gaura <-> shyam. Kept for the existing sidebar light/dark button. */
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function readStoredPreference(): ThemePreference | null {
  const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('theme')
  if (stored === 'gaura' || stored === 'light') return 'gaura'
  if (stored === 'shyam' || stored === 'dark') return 'shyam'
  if (stored === 'system') return 'system'
  return null
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system')
  const [systemDark, setSystemDark] = useState(false)

  // Load stored preference + track the OS color scheme (only affects `system`).
  useEffect(() => {
    const stored = readStoredPreference()
    if (stored) setThemePreferenceState(stored)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const theme: EffectiveTheme =
    themePreference === 'system'
      ? systemDark
        ? 'dark'
        : 'light'
      : themePreference === 'shyam'
        ? 'dark'
        : 'light'

  // Apply the resolved theme class to <html>.
  useEffect(() => {
    const el = document.documentElement
    if (theme === 'dark') {
      el.classList.add('dark-theme')
      el.classList.remove('light-theme')
    } else {
      el.classList.add('light-theme')
      el.classList.remove('dark-theme')
    }
  }, [theme])

  const setThemePreference = (preference: ThemePreference) => {
    setThemePreferenceState(preference)
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // best-effort
    }
  }

  const toggleTheme = () => setThemePreference(theme === 'dark' ? 'gaura' : 'shyam')

  return (
    <ThemeContext.Provider value={{ themePreference, theme, setThemePreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
