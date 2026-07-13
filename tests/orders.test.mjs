import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { canTransition, createOrder, getOrder, updateOrderStatus } from '../lib/orders.mjs'

process.env.ORDERS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ord-'))

test('canTransition allows valid pending transitions and rejects terminal ones', () => {
  assert.equal(canTransition('pending', 'paid'), true)
  assert.equal(canTransition('pending', 'failed'), true)
  assert.equal(canTransition('pending', 'cancelled'), true)
  assert.equal(canTransition('paid', 'cancelled'), true)
  assert.equal(canTransition('failed', 'paid'), false)
  assert.equal(canTransition('cancelled', 'paid'), false)
  assert.equal(canTransition('pending', 'pending'), true)
})

test('createOrder starts pending; updateOrderStatus flips to paid and persists', async () => {
  const o = await createOrder({ productId: 'p1', productName: 'Pro', amount: 19, currency: 'USD', gateway: 'mock' })
  assert.equal(o.status, 'pending')
  const u = await updateOrderStatus(o.id, 'paid')
  assert.equal(u.status, 'paid')
  const fetched = await getOrder(o.id)
  assert.equal(fetched.status, 'paid')
})

test('order lifecycle failure path: pending -> failed', async () => {
  const o = await createOrder({ productId: 'p2', productName: 'X', amount: 9, currency: 'USD' })
  const u = await updateOrderStatus(o.id, 'failed')
  assert.equal(u.status, 'failed')
})

test('updateOrderStatus records forced=true when transition is illegal', async () => {
  const o = await createOrder({ productId: 'p3', productName: 'Y', amount: 5, currency: 'USD' })
  await updateOrderStatus(o.id, 'failed') // terminal
  const forced = await updateOrderStatus(o.id, 'paid') // illegal
  assert.equal(forced.status, 'paid')
  assert.equal(forced.meta.forced, true)
})
