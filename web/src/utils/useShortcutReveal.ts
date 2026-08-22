import { useEffect, useState } from 'react'
import {
  HIDDEN_SHORTCUT_REVEAL,
  shortcutModifierForKey,
  shortcutRevealState,
  type IShortcutRevealState,
  type ShortcutModifier,
} from './keyboardShortcuts'

/**
 * Tracks a physically-held Command or Control key so controls can reveal their keyboard hints.
 * Nothing is prevented here: the modifier on its own keeps all of its normal browser/OS behavior.
 */
export const useShortcutReveal = (): IShortcutRevealState => {
  const [state, setState] = useState<IShortcutRevealState>(HIDDEN_SHORTCUT_REVEAL)

  useEffect(() => {
    const pressed = new Set<ShortcutModifier>()

    const publish = () => setState(shortcutRevealState(pressed))
    const clear = () => {
      if (!pressed.size) return
      pressed.clear()
      setState(HIDDEN_SHORTCUT_REVEAL)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = shortcutModifierForKey(event.key)
      if (!modifier || pressed.has(modifier)) return
      pressed.add(modifier)
      publish()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const modifier = shortcutModifierForKey(event.key)
      if (!modifier || !pressed.delete(modifier)) return
      publish()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') clear()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', clear)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', clear)
    }
  }, [])

  return state
}
