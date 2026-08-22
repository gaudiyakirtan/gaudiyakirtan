export type ShortcutModifier = 'Meta' | 'Control'

export interface IShortcutRevealState {
  active: boolean
  modifier: ShortcutModifier | null
  label: '⌘' | 'Ctrl' | ''
}

export const HIDDEN_SHORTCUT_REVEAL: IShortcutRevealState = {
  active: false,
  modifier: null,
  label: '',
}

export const shortcutModifierForKey = (key: string): ShortcutModifier | null => {
  if (key === 'Meta') return 'Meta'
  if (key === 'Control') return 'Control'
  return null
}

export const shortcutModifierLabel = (modifier: ShortcutModifier | null): IShortcutRevealState['label'] => {
  if (modifier === 'Meta') return '⌘'
  if (modifier === 'Control') return 'Ctrl'
  return ''
}

export const shortcutRevealState = (
  pressed: ReadonlySet<ShortcutModifier>,
): IShortcutRevealState => {
  // Prefer Command if both are down: it is the primary app modifier on Apple hardware and keeps
  // the displayed chord stable when Control participates in an OS-level key combination.
  const modifier = pressed.has('Meta') ? 'Meta' : pressed.has('Control') ? 'Control' : null
  return {
    active: modifier !== null,
    modifier,
    label: shortcutModifierLabel(modifier),
  }
}
