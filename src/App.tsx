import { useMemo, useState } from 'react'
import type { CategoryId, Period } from './types'
import { useTimeStore, useTimer } from './hooks/useTimeStore'
import {
  aggregateByCategory,
  filterByCategory,
  filterByPeriod,
  getLast7DaysTrend,
} from './utils/aggregation'
import { exportToCsv } from './utils/export'
import { DonutChart } from './components/DonutChart'
import { TrendChart } from './components/TrendChart'
import { DetailList } from './components/DetailList'
import { RecordForm } from './components/RecordForm'
import { QuickTimer } from './components/QuickTimer'
import { EmptyState } from './components/EmptyState'

function App() {
  const { entries, addEntry, deleteEntry } = useTimeStore()
  const { active, elapsed, startTimer, stopTimer, cancelTimer } = useTimer()
  const [period, setPeriod] = useState<Period>('today')
  const [drillCategory, setDrillCategory] = useState<CategoryId | null>(null)

  const periodEntries = useMemo(
    () => filterByPeriod(entries, period),
    [entries, period]
  )

  const summary = useMemo(
    () => aggregateByCategory(periodEntries),
    [periodEntries]
  )

  const totalMinutes = useMemo(
    () => summary.reduce((s, c) => s + c.minutes, 0),
    [summary]
  )

  const trend = useMemo(() => getLast7DaysTrend(entries), [entries])

  const handleStopTimer = () => {
    const result = stopTimer()
    if (result) addEntry(result)
  }

  const handleExportAll = () => {
    const data = drillCategory
      ? filterByCategory(periodEntries, drillCategory)
      : periodEntries
    const suffix = period === 'today' ? '今日' : '本周'
    exportToCsv(data, `时光账本_${suffix}.csv`)
  }

  if (drillCategory) {
    const detailEntries = filterByCategory(periodEntries, drillCategory)
    return (
      <div className="app">
        <header className="header">
          <div className="header__brand">
            <span className="header__logo">⏱</span>
            <div>
              <h1>时光账本</h1>
              <p>知道时间花在了哪里</p>
            </div>
          </div>
        </header>
        <main className="main">
          <DetailList
            entries={detailEntries}
            category={drillCategory}
            onBack={() => setDrillCategory(null)}
            onDelete={deleteEntry}
            onExport={handleExportAll}
          />
        </main>
      </div>
    )
  }

  const isEmpty = entries.length === 0

  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <span className="header__logo">⏱</span>
          <div>
            <h1>时光账本</h1>
            <p>知道时间花在了哪里</p>
          </div>
        </div>
        {!isEmpty && (
          <button className="btn-secondary" onClick={handleExportAll}>
            导出 CSV
          </button>
        )}
      </header>

      <main className="main">
        <section className="panel panel--record">
          <QuickTimer
            active={active}
            elapsed={elapsed}
            onStart={startTimer}
            onStop={handleStopTimer}
            onCancel={cancelTimer}
          />
          <RecordForm
            onSubmit={(data) => addEntry({ ...data, source: 'manual' })}
          />
        </section>

        {isEmpty ? (
          <EmptyState
            title="还没有任何记录"
            description="使用上方的快捷计时器或手动记录，开始追踪你的时间去向。记录越多，洞察越清晰。"
            icon="📒"
            actions={
              <div className="empty-tips">
                <div className="empty-tip">
                  <strong>快捷计时</strong>
                  <span>点击类别按钮，一键开始计时</span>
                </div>
                <div className="empty-tip">
                  <strong>手动补录</strong>
                  <span>填写起止时间，补录过往活动</span>
                </div>
              </div>
            }
          />
        ) : (
          <>
            <section className="panel panel--charts">
              <div className="panel__toolbar">
                <h2>时间分布</h2>
                <div className="segmented">
                  <button
                    className={period === 'today' ? 'active' : ''}
                    onClick={() => setPeriod('today')}
                  >
                    今日
                  </button>
                  <button
                    className={period === 'week' ? 'active' : ''}
                    onClick={() => setPeriod('week')}
                  >
                    本周
                  </button>
                </div>
              </div>

              {summary.length === 0 ? (
                <EmptyState
                  title={period === 'today' ? '今日暂无记录' : '本周暂无记录'}
                  description="切换时间段或添加新记录，环形图将展示各类活动的占比分布。"
                  icon="🍩"
                />
              ) : (
                <>
                  <DonutChart
                    data={summary}
                    totalMinutes={totalMinutes}
                    onCategoryClick={(cat) => setDrillCategory(cat as CategoryId)}
                  />
                  <div className="legend-hint">点击扇区查看该类别的明细记录</div>
                  <div className="summary-cards">
                    {summary.map((s) => (
                      <button
                        key={s.category}
                        className="summary-card"
                        onClick={() => setDrillCategory(s.category)}
                      >
                        <span className="category-dot" style={{ background: s.color }} />
                        <span className="summary-card__label">{s.label}</span>
                        <span className="summary-card__pct">{s.percentage}%</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section className="panel panel--trend">
              <h2>近七天趋势</h2>
              <TrendChart data={trend} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
