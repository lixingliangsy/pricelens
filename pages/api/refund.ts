import type { NextApiRequest, NextApiResponse } from 'next'
import { getWaffoClient } from '../../lib/waffo'
import { getTxByPaymentId, appendTx, productIdForPlan } from '../../lib/transactions'

/**
 * Initiate a refund for a completed payment.
 *
 * Flow (Waffo buyer-side refund model):
 *   1. Look up the stored transaction by paymentId to recover buyerEmail + productId.
 *   2. Issue a buyer session token (derives the store from productId).
 *   3. Create a refund ticket on that buyer session.
 *
 * Requires WAFFO_MERCHANT_ID + WAFFO_PRIVATE_KEY (merchant auth to call the API).
 * The buyer identity comes from the original webhook, so the merchant can operate
 * the refund on the buyer's behalf for support/success cases.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const client = getWaffoClient()
  if (!client) {
    return res.status(400).json({
      error: 'Waffo not configured',
      message: 'Set WAFFO_MERCHANT_ID and WAFFO_PRIVATE_KEY to enable refunds.',
    })
  }

  try {
    const body = req.body as {
      paymentId?: string
      buyerEmail?: string
      productId?: string
      plan?: string
      reason?: string
      amount?: string
      currency?: string
    }
    const paymentId = body.paymentId
    if (!paymentId) return res.status(400).json({ error: 'paymentId is required' })

    // Recover buyer + product context from the stored transaction.
    const tx = await getTxByPaymentId(paymentId)
    const buyerEmail = body.buyerEmail || tx?.buyerEmail
    const productId = body.productId || tx?.productId || productIdForPlan(body.plan || tx?.plan)
    if (!buyerEmail) return res.status(400).json({ error: 'buyerEmail unavailable (pass it or ensure webhook ran)' })
    if (!productId) return res.status(400).json({ error: 'productId unavailable (pass it or set WAFFO_PRODUCT_PRO/STUDIO)' })

    const currency = body.currency || tx?.currency || 'USD'
    const amount = body.amount || tx?.amount || '0.00'
    const reason = body.reason || 'Refund requested by merchant/support'

    // Step 2: issue a buyer session token (derives store from productId).
    const { token } = await client.auth.issueSessionToken({
      buyerIdentity: buyerEmail,
      productId,
    })
    // Step 3: create the refund ticket on the buyer session.
    const { ticket } = await client.buyer(token).createRefundTicket({
      paymentId,
      reason,
      requestedAmount: { amount, currency },
      refundTicketMerchantExternalId: `rf_${Date.now()}`,
    })

    await appendTx({
      id: `tx_${Date.now()}`,
      externalId: ticket.id,
      source: 'refund',
      event: 'refund.created',
      plan: tx?.plan,
      amount,
      currency,
      paymentId,
      buyerEmail,
      productId,
      status: (ticket as any).status || 'submitted',
      raw: ticket,
      createdAt: new Date().toISOString(),
    })

    return res.status(200).json({ ticketId: ticket.id, status: (ticket as any).status })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Refund failed' })
  }
}
