import {
  WaffoPancake,
  verifyWebhook,
  Environment,
  WebhookEvent,
} from '@waffo/pancake-ts'

export const WAFFO_ENV: Environment = (
  process.env.WAFFO_ENVIRONMENT === 'prod' ? 'prod' : 'test'
) as Environment

/** True only when both merchant id + private key are present. */
export function waffoConfigured(): boolean {
  return !!(process.env.WAFFO_MERCHANT_ID && process.env.WAFFO_PRIVATE_KEY)
}

let _client: WaffoPancake | null = null
let _clientKey = ''

/** Lazily build a Waffo client from env. Returns null when not configured. */
export function getWaffoClient(): WaffoPancake | null {
  if (!waffoConfigured()) return null
  const key = `${process.env.WAFFO_MERCHANT_ID}|${process.env.WAFFO_ENVIRONMENT}`
  if (_client && _clientKey === key) return _client
  const wpk = process.env.WAFFO_WEBHOOK_PUBLIC_KEY
  _client = new WaffoPancake({
    merchantId: process.env.WAFFO_MERCHANT_ID as string,
    privateKey: process.env.WAFFO_PRIVATE_KEY as string,
    baseUrl: process.env.WAFFO_BASE_URL || undefined,
    webhookPublicKey: wpk ? { test: wpk, prod: wpk } : undefined,
  })
  _clientKey = key
  return _client
}

/**
 * Create an anonymous Waffo checkout session for a subscription plan.
 * Returns the redirect URL. Throws if Waffo is not configured or the plan
 * product id is missing.
 */
export async function createWaffoCheckout(
  plan: 'pro' | 'studio',
  origin: string,
): Promise<string> {
  const client = getWaffoClient()
  if (!client) throw new Error('Waffo client not configured')
  const productId =
    plan === 'studio'
      ? process.env.WAFFO_PRODUCT_STUDIO
      : process.env.WAFFO_PRODUCT_PRO
  if (!productId) {
    throw new Error(
      `Missing WAFFO_PRODUCT_${plan === 'studio' ? 'STUDIO' : 'PRO'} env var`,
    )
  }
  const res = await client.checkout.anonymous.create({
    productId,
    currency: 'USD',
    successUrl: `${origin}/?upgrade=success`,
    metadata: { plan },
    orderMerchantExternalId: `pl_${plan}_${Date.now()}`,
  })
  return res.checkoutUrl
}

/**
 * Create an anonymous Waffo checkout session for a catalog product.
 * `orderId` is passed as the merchant external id so the webhook can later
 * locate the local order. Throws if the product has no Waffo product id.
 */
export async function createWaffoCheckoutForProduct(
  product: { waffoProductId?: string; currency?: string },
  appUrl: string,
  orderId: string,
): Promise<string> {
  const client = getWaffoClient()
  if (!client) throw new Error('Waffo client not configured')
  const productId = product.waffoProductId
  if (!productId) {
    throw new Error('Product has no waffoProductId; cannot use Waffo checkout')
  }
  const res = await client.checkout.anonymous.create({
    productId,
    currency: (product.currency as string) || 'USD',
    successUrl: `${appUrl}/?upgrade=success`,
    metadata: { orderId, productId },
    orderMerchantExternalId: orderId,
  })
  return res.checkoutUrl
}

/** Verify a Waffo webhook payload. Returns null on invalid signature. */
export function verifyWaffoWebhook(
  rawBody: string,
  signature: string | null | undefined,
): WebhookEvent | null {
  try {
    return verifyWebhook(rawBody, signature ?? null, { environment: WAFFO_ENV })
  } catch (e) {
    return null
  }
}
