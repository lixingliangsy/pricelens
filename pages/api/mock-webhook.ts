import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrder, updateOrderStatus } from '../../lib/orders.mjs'
import { applyMockResult } from '../../lib/payments.mjs'
import { appendTx } from '../../lib/transactions'

// Local stand-in for a payment-gateway callback. Simulates the async
// "payment succeeded / failed" notification so the full lifecycle can be
// exercised on localhost with no external dependency.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { orderId, result } = req.body as { orderId?: string; result?: string }
    if (!orderId) return res.status(400).json({ error: 'orderId required' })

    const order = await getOrder(orderId)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const { status } = applyMockResult(result === 'success' ? 'success' : 'fail')
    const updated = await updateOrderStatus(orderId, status, { meta: { mockResult: result } })

    await appendTx({
      id: `tx_${Date.now()}`,
      source: 'mock-webhook',
      status,
      orderId,
      result,
      createdAt: new Date().toISOString(),
    })

    return res.status(200).json({ order: updated })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Mock webhook failed' })
  }
}
