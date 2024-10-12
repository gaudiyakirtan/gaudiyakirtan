import { theme } from 'app/design/tailwind/theme'

const getMediaColor = (media: string) => {
  const colors = Object.entries(theme?.extend?.colors?.media || {})
  const hash = media.length
  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex]?.[1] || ''
}

export { getMediaColor }