import { SparklesIcon } from '@/components/ui/icons'

const PLACEHOLDER =
  'Friseursalon in München, Fokus auf Balayage und Haarverlängerungen'

const DEMO_SCRIPT = `Hook: Du suchst den besten Salon in München? Dann hör jetzt genau hin.

Problem: 90 % der Salons machen Balayage — aber nur wenige beherrschen es wirklich perfekt.

Lösung: Bei uns bekommst du Handwerkskunst + Beratung in einem. Balayage, Extensions, alles aus einer Hand.

CTA: Link in Bio — sichere dir deinen Termin, bevor die Woche voll ist.`

function MacTrafficLights() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <span className="size-3 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.5)]" />
      <span className="size-3 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
      <span className="size-3 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
    </div>
  )
}

export function LandingShowcase() {
  return (
    <section
      aria-labelledby="showcase-heading"
      className="relative px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(100%,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl">
        <p
          id="showcase-heading"
          className="animate-fade-in mb-8 text-center text-sm font-medium text-zinc-500 sm:text-base"
        >
          So sieht NexTrends in Aktion aus — in unter 2 Minuten zum viralen Skript
        </p>

        <article className="animate-fade-in animation-delay-100 overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950/90 shadow-[0_0_60px_-12px_rgba(168,85,247,0.35),0_25px_50px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/5 transition-all duration-500 hover:border-violet-500/30 hover:shadow-[0_0_80px_-8px_rgba(217,70,239,0.4),0_25px_50px_-12px_rgba(0,0,0,0.9)]">
          <header className="flex items-center gap-4 border-b border-zinc-800/80 bg-zinc-900/80 px-4 py-3.5 sm:px-5">
            <MacTrafficLights />
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-start">
              <SparklesIcon className="size-4 shrink-0 text-violet-400" aria-hidden />
              <span className="truncate text-sm font-medium text-zinc-300">
                AI Ad Copy Generator
              </span>
            </div>
            <span className="hidden rounded-md border border-zinc-800 bg-black/40 px-2 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
              NexTrends.app
            </span>
          </header>

          <div className="space-y-5 bg-gradient-to-b from-zinc-950 to-black p-4 sm:p-6">
            <div>
              <label
                htmlFor="showcase-input"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
              >
                Briefing
              </label>
              <textarea
                id="showcase-input"
                readOnly
                rows={3}
                defaultValue={PLACEHOLDER}
                className="nex-form-control w-full resize-none rounded-lg border border-zinc-800 bg-black/50 px-4 py-3.5 text-base leading-relaxed text-zinc-300 placeholder:text-zinc-600 transition-all duration-300 focus:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/15 sm:text-sm"
              />
            </div>

            <button
              type="button"
              className="nex-btn nex-btn--primary w-full min-h-[2.625rem] rounded-[10px] px-5 py-2.5 text-sm font-semibold sm:w-auto"
            >
              <SparklesIcon className="size-4" aria-hidden />
              Generieren
            </button>

            <div className="pt-1">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <span className="size-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
                Ergebnis · TikTok-Skript
              </p>
              <div className="relative overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:p-5">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent"
                  aria-hidden
                />
                <pre className="relative whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-200">
                  {DEMO_SCRIPT}
                </pre>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
