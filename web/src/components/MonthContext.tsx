import { ICalendarMonth, ILunarWindow } from '../models/Calendar'
import { RhythmArtwork } from './RhythmArtwork'

interface IMonthContextProps {
  window: ILunarWindow
  month: ICalendarMonth
}

export function MonthContext({ window, month }: IMonthContextProps) {
  const name = window.adhika ? 'Puruṣottama' : window.lunarMonth
  return (
    <section className="home-seasonal-card home-month-context" aria-labelledby="month-context-heading">
      <div className="home-month-context-inner">
        <div className="home-month-copy">
          <h2 id="month-context-heading" className="text-sm/5 font-medium text-[var(--tertiary)]">This month</h2>
          <p className="mt-2 text-2xl/8 font-semibold text-[var(--primary)]">{name}</p>
          {!window.adhika && window.gaudiyaMonth !== name && (
            <p className="text-base/6 text-[var(--secondary)]">{window.gaudiyaMonth}</p>
          )}
          {window.adhika && <p className="text-sm/5 text-[var(--tertiary)]">adhika-māsa</p>}
          {month.observances.length > 0 && (
            <p className="mt-3 text-base/6 text-[var(--secondary)]">{month.observances.join(' · ')}</p>
          )}
        </div>
        <RhythmArtwork />
      </div>
    </section>
  )
}
