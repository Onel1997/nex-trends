#!/usr/bin/env node
/**
 * Unit-style checks for edge invoke error parsing (no network).
 */
import assert from 'node:assert/strict'

function isCreditConsumeShape(payload) {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'allowed' in payload &&
    typeof payload.allowed === 'boolean'
  )
}

function isFatalEdgePayload(payload) {
  if (!payload || typeof payload !== 'object') return false
  if (isCreditConsumeShape(payload)) return false
  const record = payload
  if (record.ok === true) return false
  if (Array.isArray(record.hooks) && record.hooks.length > 0) return false
  if (record.generation && typeof record.generation === 'object') return false
  const errorText =
    typeof record.error === 'string'
      ? record.error.trim()
      : typeof record.message === 'string'
        ? record.message.trim()
        : ''
  return errorText.length > 0
}

assert.equal(isFatalEdgePayload({ ok: true, warning: 'x' }), false)
assert.equal(isFatalEdgePayload({ hooks: ['a', 'b'], error: 'storage' }), false)
assert.equal(isFatalEdgePayload({ error: 'OpenAI failed' }), true)
assert.equal(isFatalEdgePayload({ ok: true, hooks: ['hook'], generation: null }), false)

console.log('✅ edge invoke parse checks passed')
