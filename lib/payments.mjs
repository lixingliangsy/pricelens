// lib/payments.mjs
// Pure mapping from gateway events -> internal order status. No I/O, so it is
// trivially unit-testable and shared by both the real Waffo webhook and the
// local mock callback.

/**
 * Map a Waffo webhook eventType to an internal order status + meta.
 * @param {string} currentStatus
 * @param {string} eventType  e.g. "order.completed", "subscription.activated"
 * @returns {{status:string, meta?:object}}
 */
export function applyGatewayEvent(currentStatus, eventType) {
  switch (eventType) {
    case 'order.completed':
    case 'subscription.activated':
    case 'subscription.payment_succeeded':
      return { status: 'paid' }
    case 'subscription.past_due':
      return { status: 'past_due' }
    case 'subscription.canceling':
    case 'subscription.canceled':
      return { status: 'cancelled' }
    case 'subscription.uncanceled':
      return { status: 'paid' }
    case 'subscription.updated':
      return { status: currentStatus }
    case 'refund.succeeded':
      return { status: 'paid', meta: { refunded: true } }
    case 'refund.failed':
      return { status: currentStatus, meta: { refundFailed: true } }
    default:
      return { status: currentStatus }
  }
}

/**
 * Map a mock payment result to an internal order status.
 * @param {'success'|'fail'} result
 * @returns {{status:string}}
 */
export function applyMockResult(result) {
  return { status: result === 'success' ? 'paid' : 'failed' }
}
