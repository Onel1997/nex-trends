#!/usr/bin/env node
/**
 * Health checks for AI generator edge functions (hook, ad copy, SEO title).
 *
 * Usage:
 *   npm run test:ai-generators
 *   HOOK_TEST_TOKEN=<jwt> npm run test:ai-generators -- --generate
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const ENV_PATH = resolve(ROOT, '.env')
const args = new Set(process.argv.slice(2))
const runGenerate = args.has('--generate')

const GENERATORS = [
  { name: 'hook-generator', generateBody: { action: 'generate', topic: 'Test topic', tone: 'bold', platform: 'TikTok', skipCreditCharge: true } },
  { name: 'ad-copy-generator', generateBody: { action: 'generate', briefing: 'Test product launch', tone: 'aggressive', platform: 'Meta Ads' } },
  { name: 'seo-title-generator', generateBody: { action: 'generate', briefing: 'AI marketing trends', keyword: 'AI marketing', platform: 'Google Search', searchIntent: 'informational' } },
]

function loadEnv() {
  try {
    const raw = readFileSync(ENV_PATH, 'utf8')
    return Object.fromEntries(
      raw
        .split('\n')
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => {
          const i = line.indexOf('=')
          return [line.slice(0, i), line.slice(i + 1).replace(/^["']|["']$/g, '')]
        }),
    )
  } catch {
    return {}
  }
}

const env = { ...loadEnv(), ...process.env }
const baseUrl = (
  env.NEXT_PUBLIC_SUPABASE_URL ??
  env.VITE_SUPABASE_URL ??
  ''
).replace(/\/$/, '')
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? ''
const token = env.HOOK_TEST_TOKEN ?? env.SUPABASE_ACCESS_TOKEN ?? ''

if (!baseUrl || baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL must point to hosted Supabase.')
  process.exit(1)
}

async function callFunction(name, body) {
  const url = `${baseUrl}/functions/v1/${name}`
  const headers = {
    'Content-Type': 'application/json',
    apikey: anonKey,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  let data
  try {
    data = await res.json()
  } catch {
    data = null
  }

  return { url, status: res.status, data }
}

console.log('AI generator edge function tests →', baseUrl)
console.log('')

let failed = 0

for (const { name } of GENERATORS) {
  const optionsRes = await fetch(`${baseUrl}/functions/v1/${name}`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://nextrends-ai.de',
      'Access-Control-Request-Method': 'POST',
    },
  })

  if (optionsRes.status !== 200 && optionsRes.status !== 204) {
    console.log(`❌ ${name} OPTIONS → HTTP ${optionsRes.status}`)
    failed++
    continue
  }

  console.log(`✅ ${name} OPTIONS → HTTP ${optionsRes.status}`)

  const health = await callFunction(name, { action: 'health' })

  if (!token) {
    if (health.status === 401) {
      console.log(`✅ ${name} POST health (no token) → HTTP 401 (deployed, auth required)`)
    } else if (health.status === 404) {
      console.log(`❌ ${name} POST health → HTTP 404 NOT FOUND (not deployed)`)
      failed++
    } else {
      console.log(`⚠️  ${name} POST health (no token) → HTTP ${health.status}`, health.data)
    }
    continue
  }

  if (health.status !== 200 || health.data?.ok !== true) {
    console.log(`❌ ${name} health → HTTP ${health.status}`, health.data)
    failed++
    continue
  }

  console.log(`✅ ${name} health → ok, openai=${health.data.openai}, model=${health.data.model ?? 'default'}`)

  if (runGenerate) {
    const gen = GENERATORS.find((g) => g.name === name)
    const result = await callFunction(name, gen.generateBody)
    if (result.status >= 200 && result.status < 300) {
      console.log(`✅ ${name} generate → HTTP ${result.status}`)
    } else {
      console.log(`❌ ${name} generate → HTTP ${result.status}`, result.data)
      failed++
    }
  }
}

console.log('')
if (!token) {
  console.log('Tip: set HOOK_TEST_TOKEN to a user JWT for authenticated health/generate checks.')
}

if (failed > 0) {
  console.error(`${failed} check(s) failed.`)
  process.exit(1)
}

console.log('All AI generator checks passed.')
