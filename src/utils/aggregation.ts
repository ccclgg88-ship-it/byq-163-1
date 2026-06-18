import type { CategoryId, CategorySummary, DayTrend, Period, TimeEntry } from '../types'
import { CATEGORIES, CATEGORY_MAP } from '../types'

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfWeek(d: Date) {
  const x = startOfDay(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

function formatDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDayLabel(d: Date) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}/${d.getDate()} ${weekdays[d.getDay()]}`
}

export function filterByPeriod(entries: TimeEntry[], period: Period, ref = new Date()) {
  const start = period === 'today' ? startOfDay(ref) : startOfWeek(ref)
  const end = new Date(ref)
  end.setHours(23, 59, 59, 999)
  return entries.filter((e) => {
    const t = new Date(e.startTime)
    return t >= start && t <= end
  })
}

export function aggregateByCategory(entries: TimeEntry[]): CategorySummary[] {
  const totals: Partial<Record<CategoryId, number>> = {}
  for (const e of entries) {
    totals[e.category] = (totals[e.category] ?? 0) + e.durationMinutes
  }
  const total = Object.values(totals).reduce((s, v) => s + (v ?? 0), 0)
  return CATEGORIES.map((cat) => {
    const minutes = totals[cat.id] ?? 0
    return {
      category: cat.id,
      label: cat.label,
      color: cat.color,
      minutes,
      percentage: total > 0 ? Math.round((minutes / total) * 1000) / 10 : 0,
    }
  }).filter((s) => s.minutes > 0)
}

export function getLast7DaysTrend(entries: TimeEntry[], ref = new Date()): DayTrend[] {
  const days: DayTrend[] = []
  for (let i = 6; i >= 0; i--) {
    const d = startOfDay(ref)
    d.setDate(d.getDate() - i)
    const key = formatDateKey(d)
    const dayEntries = entries.filter((e) => formatDateKey(new Date(e.startTime)) === key)
    const categories = {} as Record<CategoryId, number>
    let total = 0
    for (const cat of CATEGORIES) categories[cat.id] = 0
    for (const e of dayEntries) {
      categories[e.category] += e.durationMinutes
      total += e.durationMinutes
    }
    days.push({ date: key, label: formatDayLabel(d), categories, total })
  }
  return days
}

export function filterByCategory(entries: TimeEntry[], category: CategoryId) {
  return entries.filter((e) => e.category === category)
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} 分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`
}

export function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getCategoryLabel(id: CategoryId) {
  return CATEGORY_MAP[id]?.label ?? id
}
