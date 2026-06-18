export type CategoryId = 'work' | 'commute' | 'entertainment' | 'sleep' | 'study' | 'exercise' | 'other'

export interface Category {
  id: CategoryId
  label: string
  color: string
}

export interface TimeEntry {
  id: string
  category: CategoryId
  startTime: string
  endTime: string
  durationMinutes: number
  note?: string
  source: 'manual' | 'timer'
  createdAt: string
}

export type Period = 'today' | 'week'

export interface CategorySummary {
  category: CategoryId
  label: string
  color: string
  minutes: number
  percentage: number
}

export interface DayTrend {
  date: string
  label: string
  categories: Record<CategoryId, number>
  total: number
}

export const CATEGORIES: Category[] = [
  { id: 'work', label: '工作', color: '#4F6BED' },
  { id: 'commute', label: '通勤', color: '#7B61FF' },
  { id: 'entertainment', label: '娱乐', color: '#FF6B9D' },
  { id: 'sleep', label: '睡眠', color: '#3DDC97' },
  { id: 'study', label: '学习', color: '#FFB347' },
  { id: 'exercise', label: '运动', color: '#36CFC9' },
  { id: 'other', label: '其他', color: '#8C8C8C' },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, Category>
