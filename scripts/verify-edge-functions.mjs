#!/usr/bin/env node
/**
 * Verifies hosted Supabase edge functions respond (OPTIONS + health where supported).
 * Usage: npm run verify:functions
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

function loadEnv() {
  const paths = [
    resolve(ROOT, '.env.local'),
    resolve(ROOT, '.env'),
  ]
  for (const envPath of paths) {
    try {
      const raw = readFileSync(envPath, 'utf8')
      return Object.fromEntries(
        raw
          .split('\n')
          .filter((line) => line && !line.startsWith('#'))
          .map((line) => {
            const i = line.indexOf('=')
            return [line.slice(0, i), line.slice(i + 1)]
          }),
      )
    } catch {
      continue
    }
  }
  return {}
}

const env = { ...loadEnv(), ...process.env }
const baseUrl = (
  env.NEXT_PUBLIC_SUPABASE_URL ??
  env.VITE_SUPABASE_URL ??
  ''
).replace(/\/$/, '')
const origins = ['http://localhost:5173', 'http://192.168.2.90:5173']

const AI_GENERATORS = [
  'hook-generator',
  'ad-copy-generator',
  'seo-title-generator',
]

const FUNCTIONS = [
  ...AI_GENERATORS,
  'consume-credits',
  'generate-video',
  'usage-limit',
]

if (!baseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL in .env / .env.local')
  process.exit(1)
}

if (baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
  console.error('verify:functions requires a hosted Supabase URL (not local).')
  process.exit(1)
}

console.log('Supabase:', baseUrl)
console.log('')

let failed = 0

for (const name of FUNCTIONS) {
  const url = `${baseUrl}/functions/v1/${name}`
  for (const origin of origins) {
    try {
      const res = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'POST',
        },
      })
      const acao = res.headers.get('access-control-allow-origin')
      const ok = res.status === 200 || res.status === 204
      const label = `${name} [${origin}]`
      if (ok) {
        console.log(`✅ ${label} → HTTP ${res.status}${acao ? `, ACAO=${acao}` : ''}`)
      } else {
        console.log(`❌ ${label} → HTTP ${res.status} (deploy: supabase functions deploy ${name})`)
        failed++
      }
    } catch (err) {
      console.log(`❌ ${name} [${origin}] → ${err instanceof Error ? err.message : err}`)
      failed++
    }
  }
}

console.log('')
if (failed > 0) {
  console.error(`${failed} check(s) failed.`)
  process.exit(1)
}
console.log('All edge function checks passed.')
