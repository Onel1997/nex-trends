/** Voiceover (OpenAI TTS) + background music selection for generated videos. */

const MUSIC_TRACKS = [
  {
    id: "pulse-drive",
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749bf8e.mp3",
    mood: "upbeat electronic pulse",
  },
  {
    id: "lofi-study",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_9940e1d8b6.mp3",
    mood: "lo-fi chill groove",
  },
  {
    id: "cinematic-rise",
    url: "https://cdn.pixabay.com/audio/2021/08/04/audio_062e843bbe.mp3",
    mood: "dramatic cinematic swell",
  },
  {
    id: "energy-beat",
    url: "https://cdn.pixabay.com/audio/2022/10/25/audio_2f5e82f21a.mp3",
    mood: "trending phonk bass",
  },
  {
    id: "warm-acoustic",
    url: "https://cdn.pixabay.com/audio/2022/03/24/audio_c8c1a2c7e2.mp3",
    mood: "acoustic feel-good",
  },
] as const;

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function pickBackgroundMusic(visualMood: string, seed: string): string {
  const h = hashSeed(`${seed}:${visualMood}`);
  const idx = h % MUSIC_TRACKS.length;
  return MUSIC_TRACKS[idx].url;
}

export async function synthesizeVoiceover(
  hookText: string,
  voiceSeed: string,
): Promise<Uint8Array | null> {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!apiKey || !hookText.trim()) return null;

  const voices = ["nova", "shimmer", "echo", "onyx"] as const;
  const voice = voices[hashSeed(voiceSeed) % voices.length];

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice,
        input: hookText.slice(0, 400),
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[video-audio][audio_generation] OpenAI TTS failed", {
        voice,
        status: response.status,
        detail: errText.slice(0, 500),
      });
      return null;
    }

    const buf = await response.arrayBuffer();
    console.log("[video-audio][audio_generation] OpenAI TTS ok", {
      bytes: buf.byteLength,
      voice,
    });
    return new Uint8Array(buf);
  } catch (err) {
    console.error("[video-audio][audio_generation] OpenAI TTS failed", {
      voice,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
