import { GoogleSignInButton } from '@/components/landing/GoogleSignInButton'
import { EmailLoginForm } from '@/components/landing/EmailLoginForm'

export default function AuthPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
        <h1 className="mb-2 text-2xl font-bold text-white">NexTrends</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Logge dich ein, um dein Marketing-Dashboard zu starten.
        </p>

        <GoogleSignInButton
          label="Mit Google anmelden"
          variant="white"
          size="md"
          className="!w-full"
        />

        <p className="my-4 text-xs text-zinc-500">oder</p>

        <EmailLoginForm
          wrapperClassName="max-w-none"
          inputClassName="rounded-lg bg-zinc-950"
          buttonClassName="rounded-lg border border-zinc-700 bg-zinc-950 font-semibold hover:border-violet-500/50 hover:bg-zinc-800"
        />
      </div>
    </div>
  )
}
