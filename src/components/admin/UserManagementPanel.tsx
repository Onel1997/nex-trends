import { memo, useMemo, useState } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { AdminPlanBadge } from '@/components/admin/AdminPlanBadge'
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminWarningBanner } from '@/components/admin/AdminWarningBanner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { InputWithIcon } from '@/components/ui/Input'
import { SearchIcon } from '@/components/ui/icons'
import { fetchAdminUsers, updateAdminUser } from '@/lib/admin-api'
import { EMPTY_ADMIN_USERS } from '@/lib/admin-defaults'
import { formatAdminWriteError, logAdminError } from '@/lib/admin-errors'
import {
  ADMIN_MANAGEABLE_PLANS,
  getAdminUserStatus,
  normalizePlanId,
  planDisplayLabel,
  resolveAdminUserPlan,
  type AdminManageablePlan,
} from '@/lib/plans'
import { useAdminPanelLoad } from '@/hooks/useAdminPanelLoad'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib'
import type { AdminUser } from '@/types/admin'

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('de-DE')
}

function StatusBadge({ user }: { user: AdminUser }) {
  const status = getAdminUserStatus(user)
  const variant =
    status === 'BANNED'
      ? 'warning'
      : status === 'CANCELED'
        ? 'muted'
        : status === 'TRIAL'
          ? 'default'
          : 'success'

  return <Badge variant={variant}>{status}</Badge>
}

type UserActionsProps = {
  user: AdminUser
  busy: boolean
  onUpdate: (userId: string, patch: Parameters<typeof updateAdminUser>[1]) => void
  layout?: 'inline' | 'stack'
}

function UserActions({ user, busy, onUpdate, layout = 'inline' }: UserActionsProps) {
  const plan = resolveAdminUserPlan(user)

  return (
    <div
      className={cn(
        'gap-2',
        layout === 'stack' ? 'flex flex-col' : 'flex flex-wrap items-center',
      )}
    >
      <label className="flex min-w-[10rem] flex-col gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
          Change Plan
        </span>
        <select
          value={plan}
          disabled={busy}
          onChange={(e) =>
            onUpdate(user.id, { plan: normalizePlanId(e.target.value) })
          }
          className="rounded-lg border border-zinc-700/60 bg-zinc-900/80 px-2 py-1.5 text-xs text-zinc-200 outline-none transition-smooth focus:border-violet-500/40"
        >
          {ADMIN_MANAGEABLE_PLANS.map((p) => (
            <option key={p} value={p}>
              {planDisplayLabel(p as AdminManageablePlan)}
            </option>
          ))}
        </select>
      </label>

      <div className={cn('flex flex-wrap gap-1.5', layout === 'stack' && 'pt-1')}>
        {([5, 50, 100] as const).map((delta) => (
          <ActionBtn
            key={`+${delta}`}
            disabled={busy}
            onClick={() => onUpdate(user.id, { credit_delta: delta })}
          >
            +{delta}
          </ActionBtn>
        ))}
        <ActionBtn disabled={busy} onClick={() => onUpdate(user.id, { credit_delta: -1 })}>
          −1
        </ActionBtn>
        <ActionBtn
          disabled={busy}
          className={user.is_banned ? '' : 'text-red-300'}
          onClick={() => onUpdate(user.id, { is_banned: !user.is_banned })}
        >
          {user.is_banned ? 'Unban' : 'Ban'}
        </ActionBtn>
      </div>
    </div>
  )
}

function mergeAdminUser(base: AdminUser, patch: Partial<AdminUser>): AdminUser {
  const plan = patch.plan ? normalizePlanId(patch.plan) : resolveAdminUserPlan(base)
  return {
    ...base,
    ...patch,
    plan,
    is_pro: patch.is_pro ?? (plan !== 'free'),
    subscription_status:
      patch.subscription_status ??
      (plan === 'free' ? 'inactive' : 'active'),
  }
}

function describeUpdate(patch: Parameters<typeof updateAdminUser>[1]): string {
  if (patch.plan) return `Plan → ${planDisplayLabel(normalizePlanId(patch.plan))}`
  if (patch.is_pro != null) return patch.is_pro ? 'Plan → PRO CREATOR' : 'Plan → FREE'
  if (patch.credit_delta != null) {
    const sign = patch.credit_delta >= 0 ? '+' : ''
    return `Credits ${sign}${patch.credit_delta}`
  }
  if (patch.set_credits != null) return `Credits auf ${patch.set_credits} gesetzt`
  if (patch.is_banned != null) return patch.is_banned ? 'Nutzer gesperrt' : 'Sperre aufgehoben'
  return 'Nutzer aktualisiert'
}

function UserManagementPanelInner() {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [writeError, setWriteError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [userOverrides, setUserOverrides] = useState<Record<string, AdminUser>>({})

  const { data, loading, warnings, authError, reload } = useAdminPanelLoad({
    scope: 'UserManagementPanel',
    reloadKey: query,
    load: () => fetchAdminUsers(query),
    empty: EMPTY_ADMIN_USERS,
  })

  const users = useMemo(() => {
    const base = data.users ?? []
    if (Object.keys(userOverrides).length === 0) return base
    return base.map((user) => userOverrides[user.id] ?? user)
  }, [data.users, userOverrides])

  async function runUpdate(userId: string, patch: Parameters<typeof updateAdminUser>[1]) {
    const existing = users.find((user) => user.id === userId)
    setBusyId(userId)
    setWriteError(null)

    console.log('[UserManagement] update start', { userId, patch, existingPlan: existing?.plan })

    try {
      const result = await updateAdminUser(userId, patch)
      console.log('[UserManagement] update result', result)

      if (result.profile && existing) {
        setUserOverrides((prev) => ({
          ...prev,
          [userId]: mergeAdminUser(existing, result.profile),
        }))
      }

      showToast({
        type: 'success',
        title: 'Nutzer aktualisiert',
        message: describeUpdate(patch),
        durationMs: 4000,
      })

      await reload()
      setUserOverrides((prev) => {
        if (!prev[userId]) return prev
        const next = { ...prev }
        delete next[userId]
        return next
      })
    } catch (err) {
      logAdminError('UserManagementPanel.update', err)
      const message = formatAdminWriteError(err)
      console.error('[UserManagement] update failed', { userId, patch, err })
      setWriteError(message)
      showToast({
        type: 'error',
        title: 'Update fehlgeschlagen',
        message,
        durationMs: 7000,
      })
    } finally {
      setBusyId(null)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(search.trim())
  }

  if (authError) {
    return <AdminErrorState message={authError} onRetry={() => void reload()} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">User Management</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Pläne, Credits und Status verwalten — synchron mit Profil & Feature Gates.
        </p>
      </header>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <InputWithIcon
          icon={<SearchIcon className="size-4" aria-hidden />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="E-Mail suchen …"
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Suchen
        </Button>
      </form>

      <AdminWarningBanner warnings={warnings} />
      {writeError && <AdminErrorState message={writeError} />}

      {loading ? (
        <AdminTableSkeleton />
      ) : (
        <>
          <UserCardList users={users} query={query} busyId={busyId} onUpdate={runUpdate} />
          <UserTableDesktop users={users} query={query} busyId={busyId} onUpdate={runUpdate} />
        </>
      )}
    </div>
  )
}

const UserCardList = memo(function UserCardList({
  users,
  query,
  busyId,
  onUpdate,
}: {
  users: AdminUser[]
  query: string
  busyId: string | null
  onUpdate: (userId: string, patch: Parameters<typeof updateAdminUser>[1]) => void
}) {
  if (users.length === 0) {
    return (
      <p className="md:hidden px-1 py-8 text-center text-sm text-zinc-500">
        {query
          ? 'Keine Nutzer für diese Suche gefunden.'
          : 'Keine Nutzer geladen — deploy admin-api oder warte auf die erste Registrierung.'}
      </p>
    )
  }

  return (
    <div className="space-y-3 md:hidden">
      {users.map((user) => (
        <article
          key={user.id}
          className="glass-card space-y-3 rounded-2xl border border-zinc-800/50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-100">{user.email ?? '—'}</p>
              <p className="mt-1 text-xs text-zinc-500">{formatDate(user.created_at)}</p>
            </div>
            <StatusBadge user={user} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AdminPlanBadge user={user} />
            <span className="rounded-lg bg-zinc-900/70 px-2 py-1 text-xs tabular-nums text-zinc-300">
              {user.credit_balance ?? 0} Credits
            </span>
          </div>

          <UserActions
            user={user}
            busy={busyId === user.id}
            onUpdate={onUpdate}
            layout="stack"
          />
        </article>
      ))}
    </div>
  )
})

const UserTableDesktop = memo(function UserTableDesktop({
  users,
  query,
  busyId,
  onUpdate,
}: {
  users: AdminUser[]
  query: string
  busyId: string | null
  onUpdate: (userId: string, patch: Parameters<typeof updateAdminUser>[1]) => void
}) {
  return (
    <div className="glass-card hidden overflow-hidden rounded-2xl md:block">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              <th className="px-4 py-3">E-Mail</th>
              <th className="px-4 py-3">Credits</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-zinc-800/40 transition-smooth hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 font-medium text-zinc-200">{user.email ?? '—'}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-300">
                  {user.credit_balance ?? 0}
                </td>
                <td className="px-4 py-3">
                  <AdminPlanBadge user={user} />
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge user={user} />
                </td>
                <td className="px-4 py-3">
                  <UserActions
                    user={user}
                    busy={busyId === user.id}
                    onUpdate={onUpdate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          {query
            ? 'Keine Nutzer für diese Suche gefunden.'
            : 'Keine Nutzer geladen — deploy admin-api oder warte auf die erste Registrierung.'}
        </p>
      )}
    </div>
  )
})

function ActionBtn({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-2 py-1 text-[10px] font-semibold text-zinc-300 transition-smooth hover:border-violet-500/40 hover:text-white disabled:opacity-40',
        className,
      )}
    >
      {children}
    </button>
  )
}

export const UserManagementPanel = memo(UserManagementPanelInner)
