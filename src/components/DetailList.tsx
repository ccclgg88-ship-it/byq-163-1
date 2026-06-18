import type { CategoryId, TimeEntry } from '../types'
import { CATEGORY_MAP } from '../types'
import { formatDateTime, formatDuration } from '../utils/aggregation'

interface Props {
  entries: TimeEntry[]
  category: CategoryId
  onBack: () => void
  onDelete: (id: string) => void
  onExport: () => void
}

export function DetailList({ entries, category, onBack, onDelete, onExport }: Props) {
  const cat = CATEGORY_MAP[category]
  const sorted = [...entries].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )
  const total = sorted.reduce((s, e) => s + e.durationMinutes, 0)

  return (
    <div className="detail-panel">
      <div className="detail-panel__header">
        <button className="btn-ghost" onClick={onBack}>
          ← 返回
        </button>
        <div className="detail-panel__title">
          <span className="category-dot" style={{ background: cat.color }} />
          <h2>{cat.label}</h2>
          <span className="detail-panel__total">{formatDuration(total)}</span>
        </div>
        <button className="btn-secondary btn-sm" onClick={onExport}>
          导出 CSV
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="detail-panel__empty">
          <p>该类别暂无记录</p>
          <button className="btn-ghost" onClick={onBack}>
            返回总览
          </button>
        </div>
      ) : (
        <ul className="detail-list">
          {sorted.map((e) => (
            <li key={e.id} className="detail-list__item">
              <div className="detail-list__main">
                <span className="detail-list__duration">{formatDuration(e.durationMinutes)}</span>
                <span className="detail-list__time">
                  {formatDateTime(e.startTime)} — {formatDateTime(e.endTime)}
                </span>
                {e.note && <span className="detail-list__note">{e.note}</span>}
              </div>
              <div className="detail-list__meta">
                <span className={`badge badge--${e.source}`}>
                  {e.source === 'timer' ? '计时' : '手动'}
                </span>
                <button
                  className="btn-icon"
                  title="删除"
                  onClick={() => onDelete(e.id)}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
