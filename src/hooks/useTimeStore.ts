import { useCallback, useEffect, useState } from 'react'
import type { CategoryId, TimeEntry } from './types'

const STORAGE_KEY = 'time-ledger-entries'

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

export function useTimeStore() {
  const [entries, setEntries] = useState<TimeEntry[]>(loadEntries)

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

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

  return { entries, addEntry, deleteEntry, clearAll }
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
