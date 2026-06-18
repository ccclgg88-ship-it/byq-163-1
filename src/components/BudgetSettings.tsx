import { useState } from 'react'
import type { BudgetConfig, BudgetType, CategoryId, Period } from '../types'
import { CATEGORIES, CATEGORY_MAP } from '../types'
import { formatDuration } from '../utils/aggregation'

interface Props {
  budgets: BudgetConfig[]
  onSetBudget: (budget: BudgetConfig) => void
  onRemoveBudget: (category: CategoryId, period: Period, type: BudgetType) => void
  onReset: () => void
  onClose: () => void
}

const TYPE_LABELS: Record<BudgetType, { label: string; desc: string; color: string }> = {
  max: { label: '上限', desc: '不超过该时长', color: '#FF6B6B' },
  min: { label: '至少', desc: '不少于该时长', color: '#3DDC97' },
  suggest: { label: '建议', desc: '建议接近该时长', color: '#4F6BED' },
}

export function BudgetSettings({ budgets, onSetBudget, onRemoveBudget, onReset, onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(CATEGORIES[0].id)
  const [newPeriod, setNewPeriod] = useState<Period>('today')
  const [newType, setNewType] = useState<BudgetType>('max')
  const [newHours, setNewHours] = useState('2')
  const [newMinutes, setNewMinutes] = useState('0')

  const filteredBudgets = budgets.filter((b) => b.category === selectedCategory)
  const selectedCat = CATEGORY_MAP[selectedCategory]

  const handleAdd = () => {
    const totalMinutes = parseInt(newHours || '0') * 60 + parseInt(newMinutes || '0')
    if (totalMinutes <= 0) return
    onSetBudget({
      category: selectedCategory,
      period: newPeriod,
      type: newType,
      targetMinutes: totalMinutes,
    })
  }

  return (
    <div className="budget-modal-overlay" onClick={onClose}>
      <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
        <div className="budget-modal__header">
          <h2>时间预算设置</h2>
          <button className="btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="budget-modal__body">
          <div className="budget-category-selector">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`budget-category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{
                  '--chip-color': cat.color,
                } as React.CSSProperties}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="category-dot" style={{ background: cat.color }} />
                {cat.label}
                {budgets.filter((b) => b.category === cat.id).length > 0 && (
                  <span className="budget-count-badge">
                    {budgets.filter((b) => b.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="budget-section">
            <h3>
              为「{selectedCat.label}」添加预算
            </h3>
            <div className="budget-form">
              <div className="budget-form__row">
                <div className="segmented">
                  <button
                    className={newPeriod === 'today' ? 'active' : ''}
                    onClick={() => setNewPeriod('today')}
                  >
                    每日
                  </button>
                  <button
                    className={newPeriod === 'week' ? 'active' : ''}
                    onClick={() => setNewPeriod('week')}
                  >
                    每周
                  </button>
                </div>
                <div className="segmented">
                  <button
                    className={newType === 'max' ? 'active' : ''}
                    onClick={() => setNewType('max')}
                  >
                    上限
                  </button>
                  <button
                    className={newType === 'min' ? 'active' : ''}
                    onClick={() => setNewType('min')}
                  >
                    至少
                  </button>
                  <button
                    className={newType === 'suggest' ? 'active' : ''}
                    onClick={() => setNewType('suggest')}
                  >
                    建议
                  </button>
                </div>
              </div>
              <div className="budget-form__row">
                <div className="budget-duration-inputs">
                  <div className="budget-input-group">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={newHours}
                      onChange={(e) => setNewHours(e.target.value)}
                    />
                    <span>小时</span>
                  </div>
                  <div className="budget-input-group">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={newMinutes}
                      onChange={(e) => setNewMinutes(e.target.value)}
                    />
                    <span>分钟</span>
                  </div>
                </div>
                <button className="btn-primary btn-sm" onClick={handleAdd}>
                  + 添加
                </button>
              </div>
              <p className="budget-type-desc" style={{ color: TYPE_LABELS[newType].color }}>
                {TYPE_LABELS[newType].desc}（{newPeriod === 'today' ? '每日' : '每周'}）
              </p>
            </div>
          </div>

          <div className="budget-section">
            <h3>已有预算</h3>
            {filteredBudgets.length === 0 ? (
              <div className="budget-empty">
                该类别暂无预算，使用上方表单添加
              </div>
            ) : (
              <div className="budget-list">
                {filteredBudgets.map((budget, idx) => {
                  const typeInfo = TYPE_LABELS[budget.type]
                  return (
                    <div key={idx} className="budget-list-item">
                      <div className="budget-list-item__main">
                        <span
                          className="budget-type-tag"
                          style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}
                        >
                          {typeInfo.label}
                        </span>
                        <span className="budget-list-item__period">
                          {budget.period === 'today' ? '每日' : '每周'}
                        </span>
                        <span className="budget-list-item__duration">
                          {formatDuration(budget.targetMinutes)}
                        </span>
                      </div>
                      <button
                        className="btn-icon"
                        onClick={() => onRemoveBudget(budget.category, budget.period, budget.type)}
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="budget-modal__footer">
          <button className="btn-ghost" onClick={onReset}>
            恢复默认
          </button>
          <button className="btn-primary" onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
