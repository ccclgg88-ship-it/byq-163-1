import type { ReactNode } from 'react'

interface Props {
  title: string
  description: string
  icon?: ReactNode
  actions?: ReactNode
}

export function EmptyState({ title, description, icon, actions }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon ?? '⏳'}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actions && <div className="empty-state__actions">{actions}</div>}
    </div>
  )
}
