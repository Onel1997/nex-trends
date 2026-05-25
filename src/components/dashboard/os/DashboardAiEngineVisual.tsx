import { PlayIcon } from '@/components/ui/icons'
import { cn } from '@/lib'

type DashboardAiEngineVisualProps = {
  variant?: 'hero' | 'studio'
  className?: string
}

/** CSS-only floating AI engine — hero sphere or studio play cube */
export function DashboardAiEngineVisual({
  variant = 'hero',
  className,
}: DashboardAiEngineVisualProps) {
  if (variant === 'studio') {
    return (
      <div
        className={cn('dashboard-os-engine dashboard-os-engine--studio', className)}
        aria-hidden
      >
        <div className="dashboard-os-engine__floor" />
        <div className="dashboard-os-engine__ring dashboard-os-engine__ring--1" />
        <div className="dashboard-os-engine__ring dashboard-os-engine__ring--2" />
        <div className="dashboard-os-engine__cube">
          <div className="dashboard-os-engine__cube-face">
            <PlayIcon className="dashboard-os-engine__play" />
          </div>
        </div>
        <div className="dashboard-os-engine__spark dashboard-os-engine__spark--1" />
      </div>
    )
  }

  return (
    <div className={cn('dashboard-os-engine dashboard-os-engine--hero', className)} aria-hidden>
      <div className="dashboard-os-engine__halo" />
      <div className="dashboard-os-engine__orbit dashboard-os-engine__orbit--1" />
      <div className="dashboard-os-engine__orbit dashboard-os-engine__orbit--2" />
      <div className="dashboard-os-engine__core">
        <div className="dashboard-os-engine__core-inner" />
      </div>
      <div className="dashboard-os-engine__spark dashboard-os-engine__spark--1" />
      <div className="dashboard-os-engine__spark dashboard-os-engine__spark--2" />
      <div className="dashboard-os-engine__spark dashboard-os-engine__spark--3" />
    </div>
  )
}
