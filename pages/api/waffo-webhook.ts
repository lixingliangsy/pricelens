import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyWaffoWebhook } from '../../lib/waffo'
import { getOrderByExternalId, updateOrderStatus } from '../../lib/orders.mjs'
import { applyGatewayEvent } from '../../lib/payments.mjs'
import { appendTx } from '../../lib/transactions'

export const config = { api: { bodyParser: false } }

function readRaw(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function sigHeader(req: NextApiRequest): string | null {
  return (
    (req.headers['waffo-signature'] as string) ||
    (req.headers['x-waffo-signature'] as string) ||
    (req.headers['signature'] as string) ||
    null
  )
}

// Receives real Waffo webhook events, verifies the signature, and updates the
// matching local order's status. The order is located via the merchant
// external id we set at checkout time (orderMerchantExternalId).
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const raw = (await readRaw(req)).toString('utf8')
  const event = verifyWaffoWebhook(raw, sigHeader(req))
  if (!event) return res.status(400).json({ error: 'Invalid signature' })

  const data: any = (event as any).data || {}
  const eventType: string = (event as any).eventType
  const externalId: string = data.orderMerchantExternalId || data.orderId || (event as any).eventId

  const order = await getOrderByExternalId(externalId)
  const { status, meta } = applyGatewayEvent(order ? order.status : 'pending', eventType)
  if (order) {
    await updateOrderStatus(order.id, status, {
      externalId,
      meta: { ...meta, eventType, paymentId: data.paymentId },
    })
  }

  await appendTx({
    id: `tx_${Date.now()}`,
    source: 'webhook',
    event: eventType,
    externalId,
    status,
    orderId: order?.id,
    raw: event,
    createdAt: new Date().toISOString(),
  })

  return res.status(200).json({ received: true })
}
