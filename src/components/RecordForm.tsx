import { useState } from 'react'
import type { CategoryId } from '../types'
import { CATEGORIES } from '../types'

interface Props {
  onSubmit: (data: {
    category: CategoryId
    startTime: string
    endTime: string
    durationMinutes: number
    note?: string
  }) => void
}

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function RecordForm({ onSubmit }: Props) {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const [category, setCategory] = useState<CategoryId>('work')
  const [start, setStart] = useState(toLocalInputValue(oneHourAgo))
  const [end, setEnd] = useState(toLocalInputValue(now))
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (endDate <= startDate) {
      alert('结束时间必须晚于开始时间')
      return
    }
    const durationMinutes = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
    onSubmit({
      category,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      durationMinutes,
      note: note.trim() || undefined,
    })
    setNote('')
  }

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <h3>手动记录</h3>
      <div className="record-form__grid">
        <label>
          类别
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          开始时间
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          结束时间
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <label className="record-form__full">
          备注（可选）
          <input
            type="text"
            placeholder="例如：项目会议、跑步 5km"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>
      <button type="submit" className="btn-primary">
        添加记录
      </button>
    </form>
  )
}
