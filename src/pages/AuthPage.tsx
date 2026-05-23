import { signInWithGoogle } from '@/lib/auth'

export default function AuthPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
        <h1 className="mb-2 text-2xl font-bold text-white">NexTrends</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Logge dich ein, um dein Marketing-Dashboard zu starten.
        </p>

        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full rounded-lg bg-white py-3 font-semibold text-black transition-all duration-300 hover:bg-zinc-200"
        >
          Mit Google anmelden
        </button>
      </div>
    </div>
  )
}
