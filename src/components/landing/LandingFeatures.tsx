import { LANDING_FEATURES } from '@/lib/landing'

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="border-t border-zinc-900 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Vier Werkzeuge.{' '}
            <span className="text-zinc-500">Ein Workflow.</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            Von der Idee bis zur Conversion — alles, was dein Social-Marketing
            braucht, in einer eleganten Suite.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
          {LANDING_FEATURES.map(({ id, title, description, Icon }) => (
            <li key={id}>
              <article className="group h-full rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-zinc-900/50 hover:shadow-xl hover:shadow-violet-950/20 sm:p-8">
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 text-violet-400 ring-1 ring-violet-500/20 transition-all duration-300 group-hover:from-violet-600/30 group-hover:to-fuchsia-600/30 group-hover:text-violet-300">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-violet-100">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
                  {description}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
