// App-wide icon set — standardized on Lucide (https://lucide.dev), the cross-platform pack we use
// on all three platforms (web: lucide-react; Android: the same glyphs as vector drawables; iOS:
// the same SVGs / SF-Symbols-equivalent). These named wrappers keep call sites stable while the
// underlying pack is Lucide, so every surface shares one consistent, modern icon language.
import React from 'react'
import {
  Home,
  Music,
  User,
  Hash,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  AudioLines,
  Type,
  Volume2,
  Settings,
  Info,
  Mail,
  type LucideProps,
} from 'lucide-react'

const make =
  (Icon: React.ComponentType<LucideProps>) =>
  ({ className = '', size = 18, ...rest }: LucideProps) =>
    <Icon className={className} size={size} strokeWidth={2} {...rest} />

export const HomeIcon = make(Home)
export const SongsIcon = make(Music)
export const AuthorsIcon = make(User)
export const TopicsIcon = make(Hash)
export const BooksIcon = make(BookOpen)
export const ChevronRightIcon = make(ChevronRight)
export const ChevronDownIcon = make(ChevronDown)
export const PlusIcon = make(Plus)
export const MetronomeIcon = make(AudioLines)
export const TextIcon = make(Type)
export const SpeakerIcon = make(Volume2)
export const SettingsIcon = make(Settings)
export const InfoIcon = make(Info)
export const MailIcon = make(Mail)
