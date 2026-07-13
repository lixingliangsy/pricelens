// lib/orders.mjs
// Order records + a small state machine. Persisted as JSON (swap to a real
// store on serverless). Pure transition rules live in canTransition() so the
// webhook / mock-callback handlers and the tests share one source of truth.

import { promises as fs } from 'fs'
import path from 'path'

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} productId
 * @property {string} productName
 * @property {number} amount
 * @property {string} currency
 * @property {'pending'|'paid'|'failed'|'cancelled'|'past_due'} status
 * @property {'waffo'|'mock'} gateway
 * @property {string} [externalId]
 * @property {Object} [meta]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export const ORDER_STATUSES = ['pending', 'paid', 'failed', 'cancelled', 'past_due']

// Allowed forward transitions. Same-status is always a no-op.
const ALLOWED = {
  pending: ['paid', 'failed', 'cancelled'],
  paid: ['cancelled', 'past_due', 'paid'],
  past_due: ['paid', 'cancelled'],
  failed: [],
  cancelled: [],
}

/** Validate a status transition (pure, no I/O). */
export function canTransition(from, to) {
  if (from === to) return true
  return (ALLOWED[from] || []).includes(to)
}

function ordersFile() {
  const dir = process.env.ORDERS_DIR || path.join(process.cwd(), 'data')
  return path.join(dir, 'orders.json')
}

async function readAll() {
  try {
    const buf = await fs.readFile(ordersFile(), 'utf8')
    const arr = JSON.parse(buf)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

async function writeAll(list) {
  await fs.mkdir(path.dirname(ordersFile()), { recursive: true })
  await fs.writeFile(ordersFile(), JSON.stringify(list, null, 2), 'utf8')
}

export async function createOrder(input = {}) {
  const all = await readAll()
  const now = new Date().toISOString()
  const id = `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  const order = {
    id,
    productId: String(input.productId || ''),
    productName: String(input.productName || ''),
    amount: Number(input.amount) || 0,
    currency: String(input.currency || 'USD'),
    status: 'pending',
    gateway: input.gateway === 'waffo' ? 'waffo' : 'mock',
    externalId: input.externalId || undefined,
    meta: input.meta || {},
    createdAt: now,
    updatedAt: now,
  }
  all.push(order)
  await writeAll(all)
  return order
}

export async function getOrder(id) {
  const all = await readAll()
  return all.find((o) => o.id === id) || null
}

export async function listOrders(limit = 200) {
  const all = await readAll()
  return all.slice(-limit).reverse() // newest first
}

export async function getOrderByExternalId(externalId) {
  if (!externalId) return null
  const all = await readAll()
  return all.find((o) => o.externalId === externalId) || null
}

/** Update an order's status + optional externalId/meta. Applies unconditionally
 *  (the gateway is the source of truth) but records whether the transition was
 *  legal so callers / auditors can inspect meta.forced. */
export async function updateOrderStatus(id, status, extra = {}) {
  const all = await readAll()
  const idx = all.findIndex((o) => o.id === id)
  if (idx === -1) return null
  const prev = all[idx]
  const forced = !canTransition(prev.status, status)
  const next = {
    ...prev,
    status,
    externalId: extra.externalId !== undefined ? extra.externalId : prev.externalId,
    meta: { ...(prev.meta || {}), ...(extra.meta || {}), forced: prev.meta?.forced || forced },
    updatedAt: new Date().toISOString(),
  }
  all[idx] = next
  await writeAll(all)
  return next
}
