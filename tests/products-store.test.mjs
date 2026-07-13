import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  setProductStatus,
  deleteProduct,
} from '../lib/products-store.mjs'

process.env.PRODUCTS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'prod-'))

test('full CRUD + publish/unpublish lifecycle', async () => {
  const p = await createProduct({ name: 'Test', description: 'd', price: 10, currency: 'USD', billingPeriod: 'monthly' })
  assert.ok(p.id)
  assert.equal(p.status, 'draft')
  assert.equal((await getProduct(p.id)).name, 'Test')

  const pub = await setProductStatus(p.id, 'published')
  assert.equal(pub.status, 'published')

  const published = await listProducts({ status: 'published' })
  assert.ok(published.find((x) => x.id === p.id))
  const drafts = await listProducts({ status: 'draft' })
  assert.equal(drafts.find((x) => x.id === p.id), undefined)

  const upd = await updateProduct(p.id, { price: 15, name: 'Test2' })
  assert.equal(upd.price, 15)
  assert.equal(upd.name, 'Test2')

  const ok = await deleteProduct(p.id)
  assert.equal(ok, true)
  assert.equal(await getProduct(p.id), null)
})

test('createProduct normalizes billingPeriod and price', async () => {
  const p = await createProduct({ name: 'Z', price: '7', billingPeriod: 'quarterly' })
  assert.equal(p.price, 7)
  assert.equal(p.billingPeriod, 'monthly') // invalid value falls back to default
})
