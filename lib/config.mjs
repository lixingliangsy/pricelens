// lib/config.mjs
// Single source of truth for domain + payment-mode configuration.
// Nothing in the app hardcodes a hostname — every absolute URL is built
// from getAppUrl(). Swap to a real domain later by changing one env var.

/** App base URL. Defaults to localhost so the flow runs with zero setup. */
export function getAppUrl() {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '')
}

/**
 * Payment mode:
 *  - 'mock'  → local simulated checkout + callback (no external gateway, no KYC)
 *  - 'waffo' → real Waffo Pancake checkout (needs WAFFO_MERCHANT_ID/PRIVATE_KEY)
 */
export function getPaymentMode() {
  return process.env.PAYMENT_MODE === 'waffo' ? 'waffo' : 'mock'
}

/** Waffo environment (test | prod). */
export function getWaffoEnv() {
  return process.env.WAFFO_ENVIRONMENT === 'prod' ? 'prod' : 'test'
}

/** True only when both merchant id + private key are present. */
export function isWaffoConfigured() {
  return !!(process.env.WAFFO_MERCHANT_ID && process.env.WAFFO_PRIVATE_KEY)
}
