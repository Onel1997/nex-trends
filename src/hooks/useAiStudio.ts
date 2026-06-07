import { useCallback, useState } from 'react'
import {
  buildStudioTrend,
  DEFAULT_STUDIO_FORM,
  type AiStudioFormValues,
} from '@/lib/ai-studio'
import { useMyAiVideos } from '@/hooks/useMyAiVideos'
import { useVideoGeneration, VIDEO_LOADING_MESSAGE } from '@/hooks/useVideoGeneration'
import { useToast } from '@/context/ToastContext'

export function useAiStudio() {
  const [form, setForm] = useState<AiStudioFormValues>(DEFAULT_STUDIO_FORM)
  const videoGen = useVideoGeneration()
  const library = useMyAiVideos()
  const { showLoadingToast, updateToast, showToast } = useToast()

  const generate = useCallback(async () => {
    const topic = form.topic.trim()
    if (topic.length < 3 || videoGen.showStudioLoading) return

    const trend = buildStudioTrend(form)
    const toastId = showLoadingToast(
      VIDEO_LOADING_MESSAGE,
      'Creator OS — Strategist · Director · Editor aktiv.',
    )

    const result = await videoGen.generate(trend, {
      consumeCredits: true,
      studio: {
        duration: form.duration,
        style: form.style,
        enableVoiceover: form.voiceover,
        enableCaptions: form.captions,
      },
    })

    if (result?.status === 'completed') {
      await library.refresh()
      updateToast(toastId, {
        type: 'success',
        title: 'Creator Blueprint bereit',
        message: 'Viral Blueprint + Video in deiner Bibliothek.',
        persistent: false,
      })
      return
    }

    updateToast(toastId, {
      type: 'info',
      title: 'Creator Pipeline',
      message: 'Bitte versuche es gleich erneut.',
      persistent: false,
    })
  }, [form, videoGen, library, showLoadingToast, updateToast])

  const copyToast = useCallback(
    (title: string) => showToast({ type: 'success', title, durationMs: 2500 }),
    [showToast],
  )

  return {
    form,
    setForm,
    generate,
    videoGen,
    library,
    blueprint: videoGen.blueprint,
    copyToast,
  }
}
