import type { WeeklyBudgetSummary } from '../types'
import { formatDuration, getBudgetTypeLabel } from '../utils/aggregation'

interface Props {
  data: WeeklyBudgetSummary[]
}

function getTrendIcon(trend: WeeklyBudgetSummary['trend']) {
  switch (trend) {
    case 'up':
      return '↑'
    case 'down':
      return '↓'
    case 'same':
      return '→'
  }
}

function getTrendColor(trend: WeeklyBudgetSummary['trend']) {
  switch (trend) {
    case 'up':
      return '#38A169'
    case 'down':
      return '#E53E3E'
    case 'same':
      return '#8B8B9E'
  }
}

export function BudgetSummary({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="budget-summary-empty">
        <span>📊</span>
        <p>暂无周预算数据</p>
      </div>
    )
  }

  const avgRate = data.length > 0
    ? Math.round((data.reduce((s, d) => s + Math.min(d.achievementRate, 100), 0) / data.length) * 10) / 10
    : 0

  const goodCount = data.filter((d) => {
    if (d.type === 'max') return d.achievementRate <= 100
    if (d.type === 'min') return d.achievementRate >= 100
    return Math.abs(d.achievementRate - 100) <= 20
  }).length

  const improvedCount = data.filter((d) => d.trend === 'up').length

  return (
    <div className="budget-summary">
      <div className="budget-summary__overview">
        <div className="budget-summary__stat">
          <div className="budget-summary__stat-value">{avgRate}%</div>
          <div className="budget-summary__stat-label">平均达成率</div>
        </div>
        <div className="budget-summary__stat">
          <div className="budget-summary__stat-value" style={{ color: '#38A169' }}>
            {goodCount}/{data.length}
          </div>
          <div className="budget-summary__stat-label">达标项数</div>
        </div>
        <div className="budget-summary__stat">
          <div className="budget-summary__stat-value" style={{ color: '#4F6BED' }}>
            +{improvedCount}
          </div>
          <div className="budget-summary__stat-label">较上周改善</div>
        </div>
      </div>

      <div className="budget-summary__list">
        {data.map((item, index) => (
          <div key={index} className="budget-summary-item">
            <div className="budget-summary-item__header">
              <div className="budget-summary-item__title">
                <span className="category-dot" style={{ background: item.color }} />
                <span className="budget-summary-item__label">{item.label}</span>
                <span className="budget-type-tag" style={{ background: 'rgba(139,139,158,0.1)', color: '#5c5c6f' }}>
                  {getBudgetTypeLabel(item.type)}
                </span>
              </div>
              <div className="budget-summary-item__trend" style={{ color: getTrendColor(item.trend) }}>
                {getTrendIcon(item.trend)}
                <span>
                  {item.lastWeekAchievementRate}% → {item.achievementRate}%
                </span>
              </div>
            </div>

            <div className="budget-summary-item__content">
              <div className="budget-summary-item__progress">
                <div className="budget-summary-item__bar-bg">
                  <div
                    className="budget-summary-item__bar-fill"
                    style={{
                      width: `${Math.min(item.achievementRate, 100)}%`,
                      background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                    }}
                  />
                  <div
                    className="budget-summary-item__bar-target"
                    style={{ left: item.type === 'min' ? '100%' : '100%' }}
                  />
                </div>
                <span className="budget-summary-item__rate">{item.achievementRate}%</span>
              </div>

              <div className="budget-summary-item__stats">
                <div>
                  <span className="budget-summary-item__stats-label">本周</span>
                  <span className="budget-summary-item__stats-value">
                    {formatDuration(item.weekMinutes)}
                  </span>
                </div>
                <div>
                  <span className="budget-summary-item__stats-label">目标</span>
                  <span className="budget-summary-item__stats-value">
                    {formatDuration(item.targetMinutes)}
                  </span>
                </div>
                <div>
                  <span className="budget-summary-item__stats-label">上周</span>
                  <span className="budget-summary-item__stats-value" style={{ color: '#8B8B9E' }}>
                    {formatDuration(item.lastWeekMinutes)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
