// lib/products-store.mjs
// Product catalog with full CRUD + publish/unpublish, persisted as JSON.
// On serverless (Vercel) the filesystem is ephemeral — swap this module to
// KV/Upstash/Postgres later; the exported interface stays identical.

import { promises as fs } from 'fs'
import path from 'path'

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} price            // major units, e.g. 19 for $19
 * @property {string} currency         // ISO 4217, e.g. "USD"
 * @property {'once'|'monthly'|'yearly'} billingPeriod
 * @property {string} [waffoProductId] // PROD_xxx from Waffo (optional)
 * @property {'draft'|'published'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

const BILLING = ['once', 'monthly', 'yearly']

function productsFile() {
  const dir = process.env.PRODUCTS_DIR || path.join(process.cwd(), 'data')
  return path.join(dir, 'products.json')
}

async function readAll() {
  try {
    const buf = await fs.readFile(productsFile(), 'utf8')
    const arr = JSON.parse(buf)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

async function writeAll(list) {
  await fs.mkdir(path.dirname(productsFile()), { recursive: true })
  await fs.writeFile(productsFile(), JSON.stringify(list, null, 2), 'utf8')
}

/** List products; pass {status:'published'} to filter storefront-visible ones. */
export async function listProducts(opts = {}) {
  const all = await readAll()
  if (opts.status) return all.filter((p) => p.status === opts.status)
  return all
}

export async function getProduct(id) {
  const all = await readAll()
  return all.find((p) => p.id === id) || null
}

export async function createProduct(input = {}) {
  const all = await readAll()
  const now = new Date().toISOString()
  const id = `prd_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  const product = {
    id,
    name: String(input.name || 'Untitled'),
    description: String(input.description || ''),
    price: Number(input.price) || 0,
    currency: String(input.currency || 'USD'),
    billingPeriod: BILLING.includes(input.billingPeriod) ? input.billingPeriod : 'monthly',
    waffoProductId: input.waffoProductId ? String(input.waffoProductId) : undefined,
    status: input.status === 'published' ? 'published' : 'draft',
    createdAt: now,
    updatedAt: now,
  }
  all.push(product)
  await writeAll(all)
  return product
}

export async function updateProduct(id, patch = {}) {
  const all = await readAll()
  const idx = all.findIndex((p) => p.id === id)
  if (idx === -1) return null
  const prev = all[idx]
  const next = {
    ...prev,
    name: patch.name !== undefined ? String(patch.name) : prev.name,
    description: patch.description !== undefined ? String(patch.description) : prev.description,
    price: patch.price !== undefined ? Number(patch.price) : prev.price,
    currency: patch.currency !== undefined ? String(patch.currency) : prev.currency,
    billingPeriod:
      patch.billingPeriod !== undefined && BILLING.includes(patch.billingPeriod)
        ? patch.billingPeriod
        : prev.billingPeriod,
    waffoProductId:
      patch.waffoProductId !== undefined
        ? patch.waffoProductId
          ? String(patch.waffoProductId)
          : undefined
        : prev.waffoProductId,
    status: patch.status !== undefined ? (patch.status === 'published' ? 'published' : 'draft') : prev.status,
    updatedAt: new Date().toISOString(),
  }
  all[idx] = next
  await writeAll(all)
  return next
}

export async function setProductStatus(id, status) {
  return updateProduct(id, { status })
}

export async function deleteProduct(id) {
  const all = await readAll()
  const idx = all.findIndex((p) => p.id === id)
  if (idx === -1) return false
  all.splice(idx, 1)
  await writeAll(all)
  return true
}
