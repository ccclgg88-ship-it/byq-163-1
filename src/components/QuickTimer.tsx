import type { CSSProperties } from 'react'
import type { CategoryId } from '../types'
import { CATEGORIES } from '../types'

interface Props {
  active: { category: CategoryId; startedAt: string } | null
  elapsed: number
  onStart: (category: CategoryId, note?: string) => void
  onStop: () => void
  onCancel: () => void
}

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function QuickTimer({ active, elapsed, onStart, onStop, onCancel }: Props) {
  if (active) {
    const cat = CATEGORIES.find((c) => c.id === active.category)!
    return (
      <div className="quick-timer quick-timer--active">
        <div className="quick-timer__status">
          <span className="category-dot" style={{ background: cat.color }} />
          <span>正在计时 · {cat.label}</span>
        </div>
        <div className="quick-timer__clock">{formatElapsed(elapsed)}</div>
        <div className="quick-timer__actions">
          <button className="btn-primary" onClick={onStop}>
            停止并保存
          </button>
          <button className="btn-ghost" onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quick-timer">
      <h3>快捷计时器</h3>
      <p className="quick-timer__hint">点击类别开始计时，结束后自动保存</p>
      <div className="quick-timer__grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className="timer-chip"
            style={{ '--chip-color': cat.color } as CSSProperties}
            onClick={() => onStart(cat.id)}
          >
            <span className="timer-chip__dot" />
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
