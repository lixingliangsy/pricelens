import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { createProduct, getProduct } from '../lib/products-store.mjs'
import { createOrder, getOrder, updateOrderStatus } from '../lib/orders.mjs'
import { applyMockResult, applyGatewayEvent } from '../lib/payments.mjs'

process.env.PRODUCTS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-p-'))
process.env.ORDERS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-o-'))

test('full lifecycle (mock success): product -> order(pending) -> paid', async () => {
  const p = await createProduct({ name: 'Pro', price: 19, currency: 'USD', billingPeriod: 'monthly', status: 'published' })
  const order = await createOrder({ productId: p.id, productName: p.name, amount: p.price, currency: p.currency, gateway: 'mock' })
  assert.equal(order.status, 'pending')

  const { status } = applyMockResult('success')
  const paid = await updateOrderStatus(order.id, status)
  assert.equal(paid.status, 'paid')
  assert.equal((await getOrder(order.id)).status, 'paid')
})

test('full lifecycle (mock failure): pending -> failed', async () => {
  const p = await createProduct({ name: 'X', price: 9, currency: 'USD' })
  const order = await createOrder({ productId: p.id, productName: p.name, amount: p.price, currency: p.currency, gateway: 'mock' })
  const { status } = applyMockResult('fail')
  const failed = await updateOrderStatus(order.id, status)
  assert.equal(failed.status, 'failed')
})

test('Waffo webhook event flips a pending order to paid via external id', async () => {
  const p = await createProduct({ name: 'Y', price: 29, currency: 'USD', waffoProductId: 'PROD_x' })
  const order = await createOrder({
    productId: p.id,
    productName: p.name,
    amount: p.price,
    currency: p.currency,
    gateway: 'waffo',
    externalId: 'ord_ext_1',
  })
  const { status } = applyGatewayEvent(order.status, 'subscription.activated')
  const updated = await updateOrderStatus(order.id, status, { externalId: 'ord_ext_1' })
  assert.equal(updated.status, 'paid')
  assert.equal(updated.externalId, 'ord_ext_1')
  assert.ok(getProduct(p.id))
})
