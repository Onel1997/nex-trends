import { memo, useState } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { AdminTableSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminWarningBanner } from '@/components/admin/AdminWarningBanner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { InputWithIcon } from '@/components/ui/Input'
import { SearchIcon } from '@/components/ui/icons'
import { fetchAdminUsers, updateAdminUser } from '@/lib/admin-api'
import { EMPTY_ADMIN_USERS } from '@/lib/admin-defaults'
import { formatAdminWriteError, logAdminError } from '@/lib/admin-errors'
import { useAdminPanelLoad } from '@/hooks/useAdminPanelLoad'
import { cn } from '@/lib'
import type { AdminUser } from '@/types/admin'

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('de-DE')
}

function UserManagementPanelInner() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [writeError, setWriteError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data, loading, warnings, authError, reload } = useAdminPanelLoad({
    scope: 'UserManagementPanel',
    reloadKey: query,
    load: () => fetchAdminUsers(query),
    empty: EMPTY_ADMIN_USERS,
  })

  const users = data.users ?? []

  async function runUpdate(userId: string, patch: Parameters<typeof updateAdminUser>[1]) {
    setBusyId(userId)
    setWriteError(null)
    try {
      await updateAdminUser(userId, patch)
      await reload()
    } catch (err) {
      logAdminError('UserManagementPanel.update', err)
      setWriteError(formatAdminWriteError(err))
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
        <p className="mt-2 text-sm text-zinc-500">Credits, Pro-Status und Sperren verwalten.</p>
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
        <UserTable users={users} query={query} busyId={busyId} onUpdate={runUpdate} />
      )}
    </div>
  )
}

const UserTable = memo(function UserTable({
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
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              <th className="px-4 py-3">E-Mail</th>
              <th className="px-4 py-3">Credits</th>
              <th className="px-4 py-3">Pro</th>
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
                  {user.is_pro ? (
                    <Badge variant="pro">Pro</Badge>
                  ) : (
                    <Badge variant="muted">Free</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-4 py-3">
                  {user.is_banned ? (
                    <Badge variant="warning">Banned</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <ActionBtn
                      disabled={busyId === user.id}
                      onClick={() => onUpdate(user.id, { credit_delta: 5 })}
                    >
                      +5
                    </ActionBtn>
                    <ActionBtn
                      disabled={busyId === user.id}
                      onClick={() => onUpdate(user.id, { credit_delta: -1 })}
                    >
                      −1
                    </ActionBtn>
                    <ActionBtn
                      disabled={busyId === user.id}
                      onClick={() => onUpdate(user.id, { is_pro: !user.is_pro })}
                    >
                      {user.is_pro ? 'Revoke Pro' : 'Grant Pro'}
                    </ActionBtn>
                    <ActionBtn
                      disabled={busyId === user.id}
                      className={user.is_banned ? '' : 'text-red-300'}
                      onClick={() => onUpdate(user.id, { is_banned: !user.is_banned })}
                    >
                      {user.is_banned ? 'Unban' : 'Ban'}
                    </ActionBtn>
                  </div>
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
