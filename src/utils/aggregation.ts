import type {
  BudgetConfig,
  BudgetProgress,
  CategoryId,
  CategorySummary,
  DayTrend,
  Period,
  TimeEntry,
  WeeklyBudgetSummary,
} from '../types'
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

function startOfLastWeek(d: Date) {
  const x = startOfWeek(d)
  x.setDate(x.getDate() - 7)
  return x
}

function endOfLastWeek(d: Date) {
  const x = startOfLastWeek(d)
  x.setDate(x.getDate() + 6)
  x.setHours(23, 59, 59, 999)
  return x
}

function filterByDateRange(entries: TimeEntry[], start: Date, end: Date) {
  return entries.filter((e) => {
    const t = new Date(e.startTime)
    return t >= start && t <= end
  })
}

export function calculateBudgetProgress(
  budget: BudgetConfig,
  entries: TimeEntry[],
  ref = new Date()
): BudgetProgress {
  const periodEntries = filterByPeriod(entries, budget.period, ref)
  const actualMinutes = periodEntries
    .filter((e) => e.category === budget.category)
    .reduce((s, e) => s + e.durationMinutes, 0)

  const cat = CATEGORY_MAP[budget.category]
  let progressPercent = 0
  let remainingMinutes = 0
  let status: BudgetProgress['status'] = 'good'

  if (budget.type === 'max') {
    progressPercent = budget.targetMinutes > 0 ? (actualMinutes / budget.targetMinutes) * 100 : 0
    remainingMinutes = budget.targetMinutes - actualMinutes
    if (progressPercent >= 110) {
      status = 'exceeded'
    } else if (progressPercent >= 90) {
      status = 'warning'
    } else {
      status = 'good'
    }
  } else if (budget.type === 'min') {
    progressPercent = budget.targetMinutes > 0 ? (actualMinutes / budget.targetMinutes) * 100 : 0
    remainingMinutes = budget.targetMinutes - actualMinutes
    if (progressPercent <= 30) {
      status = 'severe_insufficient'
    } else if (progressPercent < 80) {
      status = 'insufficient'
    } else {
      status = 'good'
    }
  } else if (budget.type === 'suggest') {
    progressPercent = budget.targetMinutes > 0 ? (actualMinutes / budget.targetMinutes) * 100 : 0
    const diff = actualMinutes - budget.targetMinutes
    remainingMinutes = diff
    const deviationPercent = Math.abs(diff) / budget.targetMinutes
    if (deviationPercent >= 0.4) {
      status = diff > 0 ? 'exceeded' : 'severe_insufficient'
    } else if (deviationPercent >= 0.15) {
      status = diff > 0 ? 'warning' : 'insufficient'
    } else {
      status = 'good'
    }
  }

  return {
    category: budget.category,
    label: cat?.label ?? budget.category,
    color: cat?.color ?? '#8C8C8C',
    period: budget.period,
    type: budget.type,
    targetMinutes: budget.targetMinutes,
    actualMinutes,
    remainingMinutes,
    progressPercent: Math.min(Math.round(progressPercent * 10) / 10, 999),
    status,
  }
}

export function calculateAllBudgetProgress(
  budgets: BudgetConfig[],
  entries: TimeEntry[],
  period: Period,
  ref = new Date()
): BudgetProgress[] {
  return budgets
    .filter((b) => b.period === period)
    .map((b) => calculateBudgetProgress(b, entries, ref))
}

export function calculateWeeklyBudgetSummary(
  budgets: BudgetConfig[],
  entries: TimeEntry[],
  ref = new Date()
): WeeklyBudgetSummary[] {
  const weekBudgets = budgets.filter((b) => b.period === 'week')
  const thisWeekEntries = filterByPeriod(entries, 'week', ref)
  const lastWeekEntries = filterByDateRange(entries, startOfLastWeek(ref), endOfLastWeek(ref))

  return weekBudgets.map((budget) => {
    const cat = CATEGORY_MAP[budget.category]
    const weekMinutes = thisWeekEntries
      .filter((e) => e.category === budget.category)
      .reduce((s, e) => s + e.durationMinutes, 0)
    const lastWeekMinutes = lastWeekEntries
      .filter((e) => e.category === budget.category)
      .reduce((s, e) => s + e.durationMinutes, 0)

    const achievementRate = budget.targetMinutes > 0 ? (weekMinutes / budget.targetMinutes) * 100 : 0
    const lastWeekAchievementRate =
      budget.targetMinutes > 0 ? (lastWeekMinutes / budget.targetMinutes) * 100 : 0

    let trend: WeeklyBudgetSummary['trend'] = 'same'
    const diff = achievementRate - lastWeekAchievementRate
    if (diff > 5) trend = 'up'
    else if (diff < -5) trend = 'down'

    return {
      category: budget.category,
      label: cat?.label ?? budget.category,
      color: cat?.color ?? '#8C8C8C',
      type: budget.type,
      targetMinutes: budget.targetMinutes,
      weekMinutes,
      lastWeekMinutes,
      achievementRate: Math.round(achievementRate * 10) / 10,
      lastWeekAchievementRate: Math.round(lastWeekAchievementRate * 10) / 10,
      trend,
    }
  })
}

export function getBudgetTypeLabel(type: BudgetProgress['type']) {
  switch (type) {
    case 'max':
      return '上限'
    case 'min':
      return '至少'
    case 'suggest':
      return '建议'
  }
}

export function getStatusLabel(status: BudgetProgress['status']) {
  switch (status) {
    case 'exceeded':
      return '已超支'
    case 'warning':
      return '接近上限'
    case 'good':
      return '正常'
    case 'insufficient':
      return '进度不足'
    case 'severe_insufficient':
      return '严重不足'
  }
}
