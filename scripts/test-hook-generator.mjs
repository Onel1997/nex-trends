#!/usr/bin/env node
/**
 * Direct hook-generator edge function tests (health + optional generate).
 *
 * Usage:
 *   npm run test:hook-generator
 *   HOOK_TEST_TOKEN=<jwt> npm run test:hook-generator -- --generate
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const ENV_PATH = resolve(ROOT, '.env')
const args = new Set(process.argv.slice(2))
const runGenerate = args.has('--generate')

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
const baseUrl = (env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
const anonKey = env.VITE_SUPABASE_ANON_KEY ?? ''
const token = env.HOOK_TEST_TOKEN ?? env.SUPABASE_ACCESS_TOKEN ?? ''

if (!baseUrl || baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
  console.error('❌ VITE_SUPABASE_URL must point to hosted Supabase.')
  process.exit(1)
}

const url = `${baseUrl}/functions/v1/hook-generator`

async function callHookGenerator(body) {
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

  let payload = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  return { status: res.status, payload }
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ${message}`)
    process.exit(1)
  }
}

console.log('hook-generator test →', url)
console.log('')

if (!token) {
  console.warn('⚠ No HOOK_TEST_TOKEN — only unauthenticated checks run.')
  console.warn('  Set HOOK_TEST_TOKEN to a user JWT for health/generate tests.')
  console.log('')
}

if (token) {
  const health = await callHookGenerator({ action: 'health' })
  console.log('health:', health.status, JSON.stringify(health.payload, null, 2))

  assert(health.status === 200, `health expected 200, got ${health.status}`)
  assert(health.payload?.ok === true, 'health.ok must be true')
  assert(typeof health.payload?.openai === 'boolean', 'health.openai must be boolean')

  if (!health.payload.openai) {
    console.error('❌ OPENAI_API_KEY is NOT configured on the deployed function.')
    console.error('   Dashboard → Project Settings → Edge Functions → Secrets')
    process.exit(1)
  }
  console.log('✅ health OK — OPENAI_API_KEY present')
  console.log('')

  if (runGenerate) {
    const gen = await callHookGenerator({
      action: 'generate',
      topic: 'Fitness Motivation für Anfänger',
      tone: 'aggressive',
      platform: 'TikTok',
    })
    console.log('generate:', gen.status)
    console.log(JSON.stringify(gen.payload, null, 2))

    assert(gen.status === 200, `generate expected 200, got ${gen.status}`)
    assert(Array.isArray(gen.payload?.hooks), 'response.hooks must be an array')
    assert(gen.payload.hooks.length > 0, 'response.hooks must not be empty')
    assert(
      gen.payload.hooks.every((h) => typeof h === 'string' && h.trim().length > 0),
      'each hook must be a non-empty string',
    )
    assert(gen.payload?.generation?.id, 'response.generation.id required')
    assert(
      Array.isArray(gen.payload?.generation?.generated_hooks_json),
      'generation.generated_hooks_json must be an array',
    )
    console.log(`✅ generate OK — ${gen.payload.hooks.length} hooks`)
  } else {
    console.log('Skip generate (pass --generate to run full OpenAI test).')
  }
} else {
  const unauth = await callHookGenerator({ action: 'health' })
  console.log('unauthenticated health:', unauth.status, unauth.payload?.error ?? unauth.payload)
  assert(unauth.status === 401, 'unauthenticated call should return 401')
  console.log('✅ auth gate OK')
}

console.log('')
console.log('All hook-generator checks passed.')
