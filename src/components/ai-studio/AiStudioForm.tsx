import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { SparklesIcon } from '@/components/ui/icons'
import { formControlSelectClassName } from '@/lib/form-field-styles'
import { cn } from '@/lib'
import {
  DEFAULT_STUDIO_FORM,
  STUDIO_DURATIONS,
  STUDIO_PLATFORMS,
  STUDIO_STYLES,
  type AiStudioFormValues,
} from '@/lib/ai-studio'

type AiStudioFormProps = {
  id?: string
  values: AiStudioFormValues
  onChange: (values: AiStudioFormValues) => void
  onSubmit: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </label>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'btn-press flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-smooth',
        checked
          ? 'border-violet-500/35 bg-violet-500/10'
          : 'border-zinc-800/70 bg-zinc-950/50 hover:border-zinc-700',
      )}
    >
      <span>
        <span className="block text-sm font-medium text-zinc-200">{label}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{description}</span>
      </span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-violet-600' : 'bg-zinc-700',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}

export function AiStudioForm({
  id,
  values,
  onChange,
  onSubmit,
  loading,
  disabled,
  className,
}: AiStudioFormProps) {
  const patch = (partial: Partial<AiStudioFormValues>) =>
    onChange({ ...values, ...partial })

  const canSubmit = values.topic.trim().length >= 3 && !loading && !disabled

  return (
    <form
      id={id}
      className={cn(
        'glass-card space-y-5 border-violet-500/10 p-4 transition-smooth sm:p-6',
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault()
        if (canSubmit) onSubmit()
      }}
    >
      <div>
        <FieldLabel>Topic</FieldLabel>
        <Textarea
          value={values.topic}
          onChange={(e) => patch({ topic: e.target.value })}
          placeholder="e.g. 5 morning habits that 10x your focus"
          rows={3}
          maxLength={280}
          disabled={loading}
        />
        <p className="mt-1 text-right text-[10px] text-zinc-600">
          {values.topic.length}/280
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Platform</FieldLabel>
          <select
            value={values.platform}
            onChange={(e) =>
              patch({ platform: e.target.value as AiStudioFormValues['platform'] })
            }
            disabled={loading}
            className={cn(formControlSelectClassName, 'pr-4')}
          >
            {STUDIO_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Style</FieldLabel>
          <select
            value={values.style}
            onChange={(e) =>
              patch({ style: e.target.value as AiStudioFormValues['style'] })
            }
            disabled={loading}
            className={cn(formControlSelectClassName, 'pr-4')}
          >
            {STUDIO_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel>Duration</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {STUDIO_DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              disabled={loading}
              onClick={() => patch({ duration: d })}
              className={cn(
                'btn-press rounded-full border px-4 py-2 text-sm font-semibold transition-smooth',
                values.duration === d
                  ? 'border-violet-500/50 bg-violet-500/15 text-violet-200'
                  : 'border-zinc-800/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Toggle
          checked={values.voiceover}
          onChange={(voiceover) => patch({ voiceover })}
          label="Voiceover"
          description="AI narration synced to your hook"
        />
        <Toggle
          checked={values.captions}
          onChange={(captions) => patch({ captions })}
          label="Captions"
          description="On-screen kinetic captions for retention"
        />
      </div>

      <Button
        type="submit"
        variant="pro"
        size="lg"
        fullWidth
        loading={loading}
        disabled={!canSubmit}
        className="btn-glow-pro btn-press shadow-[0_0_36px_-8px_rgba(139,92,246,0.55)]"
      >
        <SparklesIcon className="size-4" />
        Generate AI Video
      </Button>

      <button
        type="button"
        className="w-full text-center text-xs text-zinc-600 transition hover:text-zinc-400"
        onClick={() => onChange({ ...DEFAULT_STUDIO_FORM })}
        disabled={loading}
      >
        Reset form
      </button>
    </form>
  )
}
