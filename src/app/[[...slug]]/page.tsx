import ProductionHome from '@/components/app/ProductionHome'

/**
 * Production-safe entry: server-rendered static homepage.
 * No providers, auth, or client JS required for first paint.
 *
 * To re-enable the full SPA: set NEXT_PUBLIC_FULL_APP=true and use FullAppShell.
 */
export default function AppPage() {
  return <ProductionHome />
}
