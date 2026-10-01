import { ICalendarMonth, ILunarWindow } from '../models/Calendar'
import { ChevronDownIcon, ChevronUpIcon } from './icons/SidebarIcons'

interface IMonthContextProps {
  window: ILunarWindow
  month: ICalendarMonth
}

export function MonthContext({ window, month }: IMonthContextProps) {
  const name = window.adhika ? 'Puruṣottama' : window.lunarMonth
  return <section className="home-month-context" aria-label="Season context">
    <p className="home-eyebrow">This season</p>
    <div className="home-month-names">
      <h2>{name}</h2>
      {!window.adhika && window.gaudiyaMonth !== name && <span>{window.gaudiyaMonth}</span>}
      {window.adhika && <span>adhika-māsa</span>}
      <span>{month.songs.length} {month.songs.length === 1 ? 'song' : 'songs'}</span>
    </div>
    {month.observances.length > 0 && <details className="home-observances">
      <summary className="utility-target">
        <span>{month.observances.length} observances</span>
        <span className="home-disclosure" aria-hidden="true">
          <ChevronDownIcon size={12} className="home-disclosure-down" />
          <ChevronUpIcon size={12} className="home-disclosure-up" />
        </span>
      </summary>
      <p>{month.observances.join(' · ')}</p>
    </details>}
  </section>
}
