import { describe, expect, it } from 'vitest'
import {
  shortcutModifierForKey,
  shortcutModifierLabel,
  shortcutRevealState,
  type ShortcutModifier,
} from './keyboardShortcuts'

describe('keyboard shortcut reveal', () => {
  it('recognizes only the two reveal modifiers', () => {
    expect(shortcutModifierForKey('Meta')).toBe('Meta')
    expect(shortcutModifierForKey('Control')).toBe('Control')
    expect(shortcutModifierForKey('Alt')).toBeNull()
    expect(shortcutModifierForKey('k')).toBeNull()
  })

  it('labels the modifier that is physically held', () => {
    expect(shortcutModifierLabel('Meta')).toBe('⌘')
    expect(shortcutModifierLabel('Control')).toBe('Ctrl')
    expect(shortcutModifierLabel(null)).toBe('')
  })

  it('prefers Command while both modifiers are down and returns to Control after release', () => {
    const pressed = new Set<ShortcutModifier>(['Control', 'Meta'])
    expect(shortcutRevealState(pressed)).toEqual({ active: true, modifier: 'Meta', label: '⌘' })

    pressed.delete('Meta')
    expect(shortcutRevealState(pressed)).toEqual({ active: true, modifier: 'Control', label: 'Ctrl' })

    pressed.clear()
    expect(shortcutRevealState(pressed)).toEqual({ active: false, modifier: null, label: '' })
  })
})
