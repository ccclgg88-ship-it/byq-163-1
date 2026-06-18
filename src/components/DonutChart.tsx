import ReactECharts from 'echarts-for-react'
import type { CategorySummary } from '../types'
import { formatDuration } from '../utils/aggregation'

interface Props {
  data: CategorySummary[]
  totalMinutes: number
  onCategoryClick?: (category: string) => void
}

export function DonutChart({ data, totalMinutes, onCategoryClick }: Props) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}<br/>${formatDuration(p.value)} (${p.percent}%)`,
    },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      textStyle: { color: '#5c5c6f', fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: { show: false },
        },
        data: data.map((d) => ({
          name: d.label,
          value: d.minutes,
          itemStyle: { color: d.color },
        })),
      },
    ],
    graphic: [
      {
        type: 'text',
        left: '38%',
        top: '50%',
        style: {
          text: formatDuration(totalMinutes),
          fill: '#1a1a2e',
          font: '600 17px "DM Sans", "Noto Sans SC", sans-serif',
          textAlign: 'center',
          textVerticalAlign: 'bottom',
        },
        z: 100,
      },
      {
        type: 'text',
        left: '38%',
        top: '50%',
        style: {
          text: '总时长',
          fill: '#8b8b9e',
          font: '400 12px "Noto Sans SC", sans-serif',
          textAlign: 'center',
          textVerticalAlign: 'top',
          lineHeight: 22,
        },
        z: 100,
      },
    ],
  }

  const onEvents = {
    click: (params: { name: string }) => {
      const item = data.find((d) => d.label === params.name)
      if (item && onCategoryClick) onCategoryClick(item.category)
    },
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 280, width: '100%' }}
      onEvents={onEvents}
      notMerge
    />
  )
}
