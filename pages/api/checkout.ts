import type { NextApiRequest, NextApiResponse } from 'next'
import { getAppUrl, getPaymentMode, isWaffoConfigured } from '../../lib/config.mjs'
import { getProduct } from '../../lib/products-store.mjs'
import { createOrder } from '../../lib/orders.mjs'
import { appendTx, productIdForPlan } from '../../lib/transactions'
import { createWaffoCheckout, createWaffoCheckoutForProduct } from '../../lib/waffo'

// Checkout entry point. Picks the product (explicit productId, else legacy
// plan), opens an order, then returns a redirect URL — either the local mock
// payment page or a real Waffo checkout, depending on PAYMENT_MODE.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { productId, plan } = req.body as { productId?: string; plan?: string }

    // Resolve the product.
    let product: any = productId ? await getProduct(productId) : null
    let legacyPlan: 'pro' | 'studio' | null = null
    if (!product && plan) {
      legacyPlan = plan === 'studio' ? 'studio' : 'pro'
      const pid = productIdForPlan(legacyPlan)
      if (pid) {
        product = {
          id: pid,
          name: legacyPlan,
          waffoProductId: pid,
          price: legacyPlan === 'studio' ? 49 : 19,
          currency: 'USD',
          billingPeriod: 'monthly',
        }
      }
    }
    if (!product) {
      return res.status(400).json({
        error: 'Unknown product',
        message: 'Provide a valid productId or plan (pro|studio).',
      })
    }

    const mode = getPaymentMode()
    const appUrl = getAppUrl()
    const order = await createOrder({
      productId: product.id,
      productName: product.name,
      amount: Number(product.price) || 0,
      currency: product.currency || 'USD',
      gateway: mode === 'waffo' ? 'waffo' : 'mock',
    })

    await appendTx({
      id: `tx_${Date.now()}`,
      source: 'checkout',
      plan: legacyPlan || undefined,
      status: 'redirect',
      orderId: order.id,
      createdAt: new Date().toISOString(),
    })

    if (mode === 'waffo') {
      if (!isWaffoConfigured()) {
        return res.status(400).json({
          error: 'Waffo not configured',
          message: 'Set WAFFO_MERCHANT_ID + WAFFO_PRIVATE_KEY, or use PAYMENT_MODE=mock.',
        })
      }
      const url = await createWaffoCheckoutForProduct(product, appUrl, order.id)
      return res.status(200).json({ url, mode: 'waffo', orderId: order.id })
    }

    // Mock mode: same-origin simulated checkout page (domain-agnostic).
    const url = `${appUrl}/mock-pay?orderId=${order.id}`
    return res.status(200).json({ url, mode: 'mock', orderId: order.id })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Checkout failed' })
  }
}
