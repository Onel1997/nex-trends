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

const env = loadEnv()
const baseUrl = (env.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(
  /\/$/,
  '',
)
const origins = ['http://localhost:5173', 'http://192.168.2.90:5173']

const FUNCTIONS = [
  'hook-generator',
  'consume-credits',
  'generate-video',
  'usage-limit',
]

if (!baseUrl || baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
  console.error(
    '❌ VITE_SUPABASE_URL must point to hosted Supabase (https://<ref>.supabase.co), not local.',
  )
  console.error('   Current:', baseUrl || '(missing)')
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
