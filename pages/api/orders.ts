import type { NextApiRequest, NextApiResponse } from 'next'
import { listOrders, getOrder } from '../../lib/orders.mjs'

// GET /api/orders        -> recent orders (dashboard)
// GET /api/orders?id=... -> one order (used by the mock payment page)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const id = req.query.id as string | undefined
  if (id) {
    const o = await getOrder(id)
    return o ? res.status(200).json({ order: o }) : res.status(404).json({ error: 'not found' })
  }
  const limit = Number(req.query.limit) || 200
  return res.status(200).json({ orders: await listOrders(limit) })
}
