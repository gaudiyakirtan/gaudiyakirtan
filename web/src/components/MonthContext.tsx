import { ICalendarMonth, ILunarWindow } from '../models/Calendar'

interface IMonthContextProps {
  window: ILunarWindow
  month: ICalendarMonth
}

export function MonthContext({ window, month }: IMonthContextProps) {
  const name = window.adhika ? 'Puruṣottama' : window.lunarMonth
  const monthOrder = [
    'Caitra', 'Vaiśākha', 'Jyeṣṭha', 'Āṣāḍha', 'Śrāvaṇa', 'Bhādrapada',
    'Āśvina', 'Kārtika', 'Mārgaśīrṣa', 'Pauṣa', 'Māgha', 'Phālguna',
  ]
  const currentIndex = monthOrder.indexOf(window.lunarMonth)
  return (
    <article className="home-v6-card home-v6-month-card" aria-labelledby="month-context-heading">
      <div className="home-v6-month-topline">
        <span>This month</span>
        <span>{month.songs.length} seasonal {month.songs.length === 1 ? 'song' : 'songs'}</span>
      </div>
      <div className="home-v6-month-dial" aria-hidden="true">
        <svg viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="76" className="home-v6-month-track" />
          {Array.from({ length: 24 }, (_, index) => {
            const angle = index * 15
            const active = Math.floor(index / 2) === currentIndex
            return (
              <line
                key={angle}
                x1="110"
                y1="20"
                x2="110"
                y2={active ? 35 : 30}
                transform={`rotate(${angle} 110 110)`}
                className={active ? 'home-v6-month-tick-active' : 'home-v6-month-tick'}
              />
            )
          })}
        </svg>
        <div>
          <h2 id="month-context-heading">{name}</h2>
          {!window.adhika && window.gaudiyaMonth !== name && <p>{window.gaudiyaMonth}</p>}
          {window.adhika && <p>adhika-māsa</p>}
        </div>
      </div>
      {month.observances.length > 0 && (
        <p className="home-v6-month-observances">{month.observances.join(' · ')}</p>
      )}
    </article>
  )
}
