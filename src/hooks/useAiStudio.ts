import { useCallback, useState } from 'react'
import {
  buildStudioTrend,
  DEFAULT_STUDIO_FORM,
  type AiStudioFormValues,
} from '@/lib/ai-studio'
import { useMyAiVideos } from '@/hooks/useMyAiVideos'
import { useVideoGeneration } from '@/hooks/useVideoGeneration'

export function useAiStudio() {
  const [form, setForm] = useState<AiStudioFormValues>(DEFAULT_STUDIO_FORM)
  const videoGen = useVideoGeneration()
  const library = useMyAiVideos()

  const generate = useCallback(async () => {
    const topic = form.topic.trim()
    if (topic.length < 3) return

    const trend = buildStudioTrend(form)
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
    }
  }, [form, videoGen, library])

  return {
    form,
    setForm,
    generate,
    videoGen,
    library,
  }
}
