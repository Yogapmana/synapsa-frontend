import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg viewBox="0 0 96 96" aria-hidden="true" className="absolute size-20 opacity-15">
            <circle cx="48" cy="48" r="34" fill="currentColor" />
            <rect x="28" y="58" width="40" height="8" rx="4" fill="currentColor" />
          </svg>
          {Icon ? <Icon /> : null}
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  )
}

export default EmptyState
