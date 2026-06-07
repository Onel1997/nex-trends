import { useEffect, useState } from 'react'

export const ANALYZER_PIPELINE_STEPS = [
  'Parsing content',
  'Detecting structure',
  'Analyzing CTA',
  'Reviewing trust signals',
  'Generating CRO recommendations',
  'Finalizing audit',
] as const

const STEP_MS = 155

export function useAnalyzerLoadingPipeline(isActive: boolean) {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setStepIndex(0)
      setProgress(0)
      return
    }

    setStepIndex(0)
    setProgress(4)

    let current = 0
    const interval = window.setInterval(() => {
      current += 1
      if (current >= ANALYZER_PIPELINE_STEPS.length - 1) {
        setStepIndex(ANALYZER_PIPELINE_STEPS.length - 1)
        setProgress(92)
        clearInterval(interval)
        return
      }
      setStepIndex(current)
      setProgress(Math.round(((current + 1) / ANALYZER_PIPELINE_STEPS.length) * 88))
    }, STEP_MS)

    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (!isActive && progress > 0) {
      setProgress(100)
      const t = window.setTimeout(() => {
        setProgress(0)
        setStepIndex(0)
      }, 400)
      return () => clearTimeout(t)
    }
  }, [isActive, progress])

  return {
    stepIndex,
    stepLabel: ANALYZER_PIPELINE_STEPS[stepIndex] ?? ANALYZER_PIPELINE_STEPS[0],
    progress: isActive ? progress : 0,
    totalSteps: ANALYZER_PIPELINE_STEPS.length,
  }
}
