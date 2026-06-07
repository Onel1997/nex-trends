import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'nextrends_onboarding_v1'

export type OnboardingStep = 'welcome' | 'credits' | 'tools' | 'cta' | 'complete'

export type OnboardingTipId = 'dashboard-credits' | 'first-generation' | 'saved-library'

type OnboardingState = {
  step: OnboardingStep
  dismissedTips: OnboardingTipId[]
  completedAt: string | null
}

const DEFAULT_STATE: OnboardingState = {
  step: 'welcome',
  dismissedTips: [],
  completedAt: null,
}

function readState(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    return {
      step: parsed.step ?? DEFAULT_STATE.step,
      dismissedTips: parsed.dismissedTips ?? [],
      completedAt: parsed.completedAt ?? null,
    }
  } catch {
    return DEFAULT_STATE
  }
}

function writeState(state: OnboardingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => readState())

  useEffect(() => {
    writeState(state)
  }, [state])

  const isComplete = state.step === 'complete' || state.completedAt !== null

  const currentStepIndex = useMemo(() => {
    const steps: OnboardingStep[] = ['welcome', 'credits', 'tools', 'cta']
    return steps.indexOf(state.step)
  }, [state.step])

  const advance = useCallback(() => {
    setState((prev) => {
      const steps: OnboardingStep[] = ['welcome', 'credits', 'tools', 'cta', 'complete']
      const idx = steps.indexOf(prev.step)
      const next = steps[Math.min(idx + 1, steps.length - 1)]
      return {
        ...prev,
        step: next,
        completedAt: next === 'complete' ? new Date().toISOString() : prev.completedAt,
      }
    })
  }, [])

  const skip = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'complete',
      completedAt: new Date().toISOString(),
    }))
  }, [])

  const dismissTip = useCallback((tipId: OnboardingTipId) => {
    setState((prev) => ({
      ...prev,
      dismissedTips: prev.dismissedTips.includes(tipId)
        ? prev.dismissedTips
        : [...prev.dismissedTips, tipId],
    }))
  }, [])

  const isTipVisible = useCallback(
    (tipId: OnboardingTipId) => isComplete && !state.dismissedTips.includes(tipId),
    [isComplete, state.dismissedTips],
  )

  const resetOnboarding = useCallback(() => {
    setState(DEFAULT_STATE)
  }, [])

  return {
    state,
    isComplete,
    currentStepIndex,
    advance,
    skip,
    dismissTip,
    isTipVisible,
    resetOnboarding,
  }
}
