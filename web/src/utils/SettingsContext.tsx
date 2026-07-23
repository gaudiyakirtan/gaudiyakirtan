import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { DEFAULT_SETTINGS, ISettings } from '../models/Settings'

// Device-local reader settings, persisted to localStorage and shared by the Settings screen and
// song-detail (docs/screens/settings.md). Single source of truth: song-detail reads these and its
// quick-toggles write them back, so the two stay in sync. Offline - no account, no network.

const STORAGE_KEY = 'gk-settings'

interface SettingsContextType {
  settings: ISettings
  updateSetting: <K extends keyof ISettings>(key: K, value: ISettings[K]) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start from spec defaults for SSR; hydrate from localStorage on the client (same pattern as
  // ThemeContext). Merge with defaults so a stored partial/older shape stays valid.
  const [settings, setSettings] = useState<ISettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ISettings>
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch {
      // Corrupt/unavailable storage - fall back to defaults silently.
    }
  }, [])

  const updateSetting = <K extends keyof ISettings>(key: K, value: ISettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Persistence best-effort; the in-memory value still updates the UI.
      }
      return next
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
