import test from 'node:test'
import assert from 'node:assert/strict'
import { applyGatewayEvent, applyMockResult } from '../lib/payments.mjs'

test('applyGatewayEvent maps Waffo events to internal status', () => {
  assert.equal(applyGatewayEvent('pending', 'order.completed').status, 'paid')
  assert.equal(applyGatewayEvent('pending', 'subscription.activated').status, 'paid')
  assert.equal(applyGatewayEvent('pending', 'subscription.payment_succeeded').status, 'paid')
  assert.equal(applyGatewayEvent('paid', 'subscription.past_due').status, 'past_due')
  assert.equal(applyGatewayEvent('paid', 'subscription.canceled').status, 'cancelled')
  assert.equal(applyGatewayEvent('paid', 'subscription.canceling').status, 'cancelled')
  assert.equal(applyGatewayEvent('past_due', 'subscription.uncanceled').status, 'paid')
  assert.equal(applyGatewayEvent('pending', 'subscription.updated').status, 'pending')
  const r = applyGatewayEvent('paid', 'refund.succeeded')
  assert.equal(r.status, 'paid')
  assert.equal(r.meta.refunded, true)
  assert.equal(applyGatewayEvent('pending', 'unknown.event').status, 'pending')
})

test('applyMockResult maps success/fail', () => {
  assert.equal(applyMockResult('success').status, 'paid')
  assert.equal(applyMockResult('fail').status, 'failed')
})
