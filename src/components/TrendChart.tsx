import ReactECharts from 'echarts-for-react'
import type { DayTrend } from '../types'
import { CATEGORIES } from '../types'

interface Props {
  data: DayTrend[]
}

export function TrendChart({ data }: Props) {
  const hasData = data.some((d) => d.total > 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ seriesName: string; value: number; axisValue: string }>) => {
        const lines = params
          .filter((p) => p.value > 0)
          .map((p) => `${p.seriesName}: ${p.value} 分钟`)
        return `${params[0]?.axisValue}<br/>${lines.join('<br/>') || '暂无记录'}`
      },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#5c5c6f', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    grid: { left: 12, right: 12, top: 24, bottom: 48, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.label.split(' ')[0]),
      axisLine: { lineStyle: { color: '#e8e8ef' } },
      axisLabel: { color: '#8b8b9e', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: '#8b8b9e', fontSize: 11 },
      axisLine: { show: false },
      axisLabel: { color: '#8b8b9e', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f0f5', type: 'dashed' } },
    },
    series: CATEGORIES.map((cat) => ({
      name: cat.label,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      itemStyle: { color: cat.color },
      emphasis: { focus: 'series' },
      data: data.map((d) => d.categories[cat.id]),
    })),
  }

  if (!hasData) {
    return (
      <div className="chart-placeholder">
        <span>📈</span>
        <p>近七天暂无趋势数据，开始记录后这里会展示每日变化</p>
      </div>
    )
  }

  return <ReactECharts option={option} style={{ height: 300, width: '100%' }} notMerge />
}
