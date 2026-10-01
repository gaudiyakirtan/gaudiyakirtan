// App-wide icon set — standardized on Lucide (https://lucide.dev), the cross-platform pack we use
// on all three platforms (web: lucide-react; Android: the same glyphs as vector drawables; iOS:
// the same SVGs / SF-Symbols-equivalent). These named wrappers keep call sites stable while the
// underlying pack is Lucide, so every surface shares one consistent, modern icon language.
import React from 'react'
import {
  Home,
  Music,
  ListMusic,
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
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Loader2,
  Search,
  RotateCcw,
  Ellipsis,
  ChevronUp,
  Check,
  type LucideProps,
} from 'lucide-react'

const make = (Icon: React.ComponentType<LucideProps>) => {
  const IconWrapper = ({ className = '', size = 18, ...rest }: LucideProps) => (
    <Icon className={className} size={size} strokeWidth={2} {...rest} />
  )
  // Named so React DevTools (and react/display-name) don't see an anonymous component.
  IconWrapper.displayName = Icon.displayName || Icon.name || 'Icon'
  return IconWrapper
}

export const HomeIcon = make(Home)
export const SongsIcon = make(Music)
export const TracksIcon = make(ListMusic)
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
export const ArrowLeftIcon = make(ArrowLeft)
export const ArrowRightIcon = make(ArrowRight)
export const PlayIcon = make(Play)
export const PauseIcon = make(Pause)
export const LoadingIcon = make(Loader2)
export const SearchIcon = make(Search)
export const RetryIcon = make(RotateCcw)
export const PendingIcon = make(Ellipsis)
export const ChevronUpIcon = make(ChevronUp)
export const CheckIcon = make(Check)
