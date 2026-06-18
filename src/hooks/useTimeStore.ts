import { useCallback, useEffect, useState } from 'react'
import type { BudgetConfig, CategoryId, TimeEntry } from '../types'
import { CATEGORIES } from '../types'

const STORAGE_KEY = 'time-ledger-entries'
const BUDGET_STORAGE_KEY = 'time-ledger-budgets'

function loadEntries(): TimeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TimeEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveEntries(entries: TimeEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function getDefaultBudgets(): BudgetConfig[] {
  const budgets: BudgetConfig[] = []
  for (const cat of CATEGORIES) {
    if (cat.id === 'work') {
      budgets.push({ category: 'work', period: 'today', type: 'max', targetMinutes: 480 })
      budgets.push({ category: 'work', period: 'week', type: 'max', targetMinutes: 2400 })
    } else if (cat.id === 'study') {
      budgets.push({ category: 'study', period: 'today', type: 'min', targetMinutes: 120 })
      budgets.push({ category: 'study', period: 'week', type: 'min', targetMinutes: 840 })
    } else if (cat.id === 'sleep') {
      budgets.push({ category: 'sleep', period: 'today', type: 'suggest', targetMinutes: 420 })
      budgets.push({ category: 'sleep', period: 'week', type: 'suggest', targetMinutes: 2940 })
    } else if (cat.id === 'exercise') {
      budgets.push({ category: 'exercise', period: 'today', type: 'min', targetMinutes: 30 })
      budgets.push({ category: 'exercise', period: 'week', type: 'min', targetMinutes: 210 })
    } else if (cat.id === 'entertainment') {
      budgets.push({ category: 'entertainment', period: 'today', type: 'max', targetMinutes: 180 })
      budgets.push({ category: 'entertainment', period: 'week', type: 'max', targetMinutes: 900 })
    }
  }
  return budgets
}

function loadBudgets(): BudgetConfig[] {
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY)
    if (!raw) return getDefaultBudgets()
    const parsed = JSON.parse(raw) as BudgetConfig[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultBudgets()
  } catch {
    return getDefaultBudgets()
  }
}

function saveBudgets(budgets: BudgetConfig[]) {
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets))
}

export function useTimeStore() {
  const [entries, setEntries] = useState<TimeEntry[]>(loadEntries)
  const [budgets, setBudgets] = useState<BudgetConfig[]>(loadBudgets)

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  useEffect(() => {
    saveBudgets(budgets)
  }, [budgets])

  const addEntry = useCallback((entry: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setEntries((prev) => [newEntry, ...prev])
    return newEntry
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setEntries([])
  }, [])

  const setBudget = useCallback((budget: BudgetConfig) => {
    setBudgets((prev) => {
      const existing = prev.findIndex(
        (b) => b.category === budget.category && b.period === budget.period && b.type === budget.type
      )
      if (existing >= 0) {
        const next = [...prev]
        next[existing] = budget
        return next
      }
      return [...prev, budget]
    })
  }, [])

  const removeBudget = useCallback((category: CategoryId, period: 'today' | 'week', type: 'max' | 'min' | 'suggest') => {
    setBudgets((prev) =>
      prev.filter((b) => !(b.category === category && b.period === period && b.type === type))
    )
  }, [])

  const resetBudgets = useCallback(() => {
    setBudgets(getDefaultBudgets())
  }, [])

  const getBudget = useCallback(
    (category: CategoryId, period: 'today' | 'week', type: 'max' | 'min' | 'suggest') => {
      return budgets.find((b) => b.category === category && b.period === period && b.type === type)
    },
    [budgets]
  )

  const getBudgetsForCategory = useCallback(
    (category: CategoryId) => {
      return budgets.filter((b) => b.category === category)
    },
    [budgets]
  )

  return {
    entries,
    addEntry,
    deleteEntry,
    clearAll,
    budgets,
    setBudget,
    removeBudget,
    resetBudgets,
    getBudget,
    getBudgetsForCategory,
  }
}

export interface ActiveTimer {
  category: CategoryId
  startedAt: string
  note?: string
}

export function useTimer() {
  const [active, setActive] = useState<ActiveTimer | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!active) {
      setElapsed(0)
      return
    }
    const start = new Date(active.startedAt).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [active])

  const startTimer = useCallback((category: CategoryId, note?: string) => {
    setActive({ category, startedAt: new Date().toISOString(), note })
  }, [])

  const stopTimer = useCallback(() => {
    if (!active) return null
    const end = new Date()
    const start = new Date(active.startedAt)
    const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000))
    const result = {
      category: active.category,
      startTime: active.startedAt,
      endTime: end.toISOString(),
      durationMinutes,
      note: active.note,
      source: 'timer' as const,
    }
    setActive(null)
    return result
  }, [active])

  const cancelTimer = useCallback(() => setActive(null), [])

  return { active, elapsed, startTimer, stopTimer, cancelTimer }
}
