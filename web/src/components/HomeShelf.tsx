import { ReactNode, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from './icons/SidebarIcons'

interface IHomeShelfProps {
  title: string
  viewAllLink?: string
  kind: 'topics' | 'books' | 'authors'
  children: ReactNode
}

export function HomeShelf({ title, viewAllLink, kind, children }: IHomeShelfProps) {
  const id = useId()
  const ref = useRef<HTMLUListElement>(null)
  const [position, setPosition] = useState({ overflowing: false, start: true, end: false })
  useEffect(() => {
    const shelf = ref.current!
    const update = () => setPosition({
      overflowing: shelf.scrollWidth > shelf.clientWidth + 1,
      start: shelf.scrollLeft <= 1,
      end: shelf.scrollLeft + shelf.clientWidth >= shelf.scrollWidth - 1,
    })
    const observer = new ResizeObserver(update)
    observer.observe(shelf)
    for (const child of shelf.children) observer.observe(child)
    shelf.addEventListener('scroll', update, { passive: true })
    update()
    return () => { observer.disconnect(); shelf.removeEventListener('scroll', update) }
  }, [])

  const scroll = (direction: number) => {
    const shelf = ref.current!
    if (direction < 0 ? position.start : position.end) return
    shelf.scrollTo({
      left: Math.max(0, Math.min(shelf.scrollWidth - shelf.clientWidth, shelf.scrollLeft + direction * shelf.clientWidth)),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  return (
    <section className={`home-shelf home-shelf-${kind}`} aria-labelledby={`${id}-heading`}>
      <div className="home-section-heading">
        <h2 id={`${id}-heading`} className="text-xl/7 font-semibold">{title}</h2>
        <div className="home-shelf-actions">
          {viewAllLink && <Link href={viewAllLink} className="home-view-all utility-target" aria-label={`View all ${title.toLowerCase()}`}>
            <span>View all</span><ArrowRightIcon size={16} aria-hidden="true" />
          </Link>}
          {position.overflowing && <div className="home-shelf-arrows">
            <button className="home-icon-button utility-target" aria-label={`Previous ${title.toLowerCase()}`} aria-controls={id} aria-disabled={position.start} onClick={() => scroll(-1)}><ArrowLeftIcon aria-hidden="true" /></button>
            <button className="home-icon-button utility-target" aria-label={`Next ${title.toLowerCase()}`} aria-controls={id} aria-disabled={position.end} onClick={() => scroll(1)}><ArrowRightIcon aria-hidden="true" /></button>
          </div>}
        </div>
      </div>
      <ul id={id} ref={ref} className="home-shelf-list" onFocusCapture={(event) => {
        const shelf = ref.current!
        const item = (event.target as HTMLElement).closest('li')
        if (!item) return
        const bounds = shelf.getBoundingClientRect()
        const rect = item.getBoundingClientRect()
        if (rect.left < bounds.left + 4) shelf.scrollLeft += rect.left - bounds.left - 4
        else if (rect.right > bounds.right - 4) shelf.scrollLeft += rect.right - bounds.right + 4
      }}>{children}</ul>
    </section>
  )
}
