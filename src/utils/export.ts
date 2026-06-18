import type { TimeEntry } from '../types'
import { CATEGORY_MAP } from '../types'
import { formatDateTime } from './aggregation'

export function exportToCsv(entries: TimeEntry[], filename = '时光账本.csv') {
  const headers = ['类别', '开始时间', '结束时间', '时长(分钟)', '备注', '记录方式', '创建时间']
  const rows = entries.map((e) => [
    CATEGORY_MAP[e.category]?.label ?? e.category,
    formatDateTime(e.startTime),
    formatDateTime(e.endTime),
    String(e.durationMinutes),
    e.note ?? '',
    e.source === 'timer' ? '计时器' : '手动',
    formatDateTime(e.createdAt),
  ])
  const bom = '\uFEFF'
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
