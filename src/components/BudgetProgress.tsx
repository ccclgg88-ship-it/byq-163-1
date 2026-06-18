import type { BudgetProgress as BudgetProgressType } from '../types'
import { formatDuration, getBudgetTypeLabel, getStatusLabel } from '../utils/aggregation'

interface Props {
  data: BudgetProgressType[]
  onCategoryClick?: (category: string) => void
}

const STATUS_CONFIG: Record<
  BudgetProgressType['status'],
  { color: string; bgColor: string; icon: string }
> = {
  exceeded: { color: '#E53E3E', bgColor: 'rgba(229, 62, 62, 0.1)', icon: '⚠️' },
  warning: { color: '#ED8936', bgColor: 'rgba(237, 137, 54, 0.1)', icon: '⚡' },
  good: { color: '#38A169', bgColor: 'rgba(56, 161, 105, 0.1)', icon: '✓' },
  insufficient: { color: '#ED8936', bgColor: 'rgba(237, 137, 54, 0.1)', icon: '📉' },
  severe_insufficient: { color: '#E53E3E', bgColor: 'rgba(229, 62, 62, 0.1)', icon: '🚨' },
}

export function BudgetProgress({ data, onCategoryClick }: Props) {
  if (data.length === 0) {
    return (
      <div className="budget-progress-empty">
        <span>🎯</span>
        <p>暂无预算设置</p>
        <span className="budget-progress-empty__hint">点击右上角「设置预算」开始规划你的时间</span>
      </div>
    )
  }

  return (
    <div className="budget-progress-list">
      {data.map((item, index) => {
        const statusCfg = STATUS_CONFIG[item.status]
        const isAlert = item.status === 'exceeded' || item.status === 'severe_insufficient'
        const barWidth = Math.min(item.progressPercent, 100)
        const barOverflow = item.progressPercent > 100 ? item.progressPercent - 100 : 0

        return (
          <div
            key={index}
            className={`budget-progress-item ${isAlert ? 'alert' : ''}`}
            onClick={() => onCategoryClick?.(item.category)}
          >
            <div className="budget-progress-item__header">
              <div className="budget-progress-item__title">
                <span className="category-dot" style={{ background: item.color }} />
                <span className="budget-progress-item__label">{item.label}</span>
                <span className="budget-type-tag" style={{ background: statusCfg.bgColor, color: statusCfg.color }}>
                  {getBudgetTypeLabel(item.type)}
                </span>
                {isAlert && (
                  <span
                    className="budget-status-alert"
                    style={{ background: statusCfg.bgColor, color: statusCfg.color }}
                  >
                    {statusCfg.icon} {getStatusLabel(item.status)}
                  </span>
                )}
              </div>
              <div className="budget-progress-item__stats">
                <span className="budget-progress-item__actual">
                  {formatDuration(item.actualMinutes)}
                </span>
                <span className="budget-progress-item__divider">/</span>
                <span className="budget-progress-item__target">
                  {formatDuration(item.targetMinutes)}
                </span>
              </div>
            </div>

            <div className="budget-progress-bar__wrapper">
              <div className="budget-progress-bar">
                <div
                  className="budget-progress-bar__fill"
                  style={{
                    width: `${Math.min(barWidth, 100)}%`,
                    background: isAlert
                      ? `linear-gradient(90deg, ${statusCfg.color}CC, ${statusCfg.color})`
                      : `linear-gradient(90deg, ${item.color}99, ${item.color})`,
                  }}
                />
                {barOverflow > 0 && (
                  <div
                    className="budget-progress-bar__overflow"
                    style={{
                      width: `${Math.min(barOverflow / item.progressPercent * 100, 20)}%`,
                      background: `repeating-linear-gradient(
                        45deg,
                        ${statusCfg.color},
                        ${statusCfg.color} 6px,
                        ${statusCfg.color}80 6px,
                        ${statusCfg.color}80 12px
                      )`,
                    }}
                  />
                )}
              </div>
              <span
                className="budget-progress-bar__percent"
                style={{ color: isAlert ? statusCfg.color : undefined }}
              >
                {item.progressPercent}%
              </span>
            </div>

            <div className="budget-progress-item__footer">
              <span
                className="budget-progress-item__remaining"
                style={{ color: statusCfg.color }}
              >
                {item.type === 'max' && (
                  <>
                    {item.remainingMinutes > 0
                      ? `剩余 ${formatDuration(item.remainingMinutes)}`
                      : item.remainingMinutes === 0
                      ? '已达上限'
                      : `超出 ${formatDuration(Math.abs(item.remainingMinutes))}`}
                  </>
                )}
                {item.type === 'min' && (
                  <>
                    {item.remainingMinutes > 0
                      ? `还差 ${formatDuration(item.remainingMinutes)}`
                      : item.remainingMinutes === 0
                      ? '刚好达标'
                      : `已超出 ${formatDuration(Math.abs(item.remainingMinutes))}`}
                  </>
                )}
                {item.type === 'suggest' && (
                  <>
                    {item.remainingMinutes > 0
                      ? `超出建议 ${formatDuration(item.remainingMinutes)}`
                      : item.remainingMinutes === 0
                      ? '达成建议值'
                      : `距离建议还差 ${formatDuration(Math.abs(item.remainingMinutes))}`}
                  </>
                )}
              </span>
              {!isAlert && item.status !== 'good' && (
                <span
                  className="budget-status-tag"
                  style={{ background: statusCfg.bgColor, color: statusCfg.color }}
                >
                  {getStatusLabel(item.status)}
                </span>
              )}
              {item.status === 'good' && (
                <span
                  className="budget-status-tag"
                  style={{ background: statusCfg.bgColor, color: statusCfg.color }}
                >
                  ✓ 正常
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
