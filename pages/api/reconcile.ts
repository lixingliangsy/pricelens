import type { NextApiRequest, NextApiResponse } from 'next'
import { listTx, TxRecord } from '../../lib/transactions'
import { diffTx } from '../../lib/reconcile'
import { getWaffoClient, waffoConfigured } from '../../lib/waffo'

/**
 * Reconciliation endpoint.
 *
 * Two modes:
 *  1. POST { remote: TxRecord[] } — diff local records against a supplied
 *     remote list (e.g. pasted from the Waffo portal export / GraphQL result).
 *     This works without live API access and is fully testable.
 *  2. POST {} with Waffo configured — best-effort live pull via GraphQL, then
 *     diff. Wrapped in try/catch; on failure returns a local-only summary.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = (req.body || {}) as { remote?: TxRecord[] }
  const local = await listTx(100000)

  // Mode 1: explicit remote list supplied.
  if (Array.isArray(body.remote)) {
    const report = diffTx(local, body.remote)
    return res.status(200).json({ mode: 'supplied', report })
  }

  // Mode 2: live pull if configured.
  if (waffoConfigured()) {
    const client = getWaffoClient()
    if (client) {
      try {
        const q = `query { payments(first: 50) { edges { node { id status amount currency } } } }`
        const r: any = await (client as any).graphql.query(q)
        const edges = r?.data?.payments?.edges || []
        const remote: TxRecord[] = edges.map((e: any) => {
          const n = e?.node || {}
          return {
            id: n.id,
            externalId: n.id,
            source: 'reconcile',
            status: n.status,
            amount: n.amount,
            currency: n.currency,
            createdAt: new Date().toISOString(),
          }
        })
        const report = diffTx(local, remote)
        return res.status(200).json({ mode: 'live', report })
      } catch (e: any) {
        return res.status(200).json({
          mode: 'live-failed',
          note: 'Live Waffo pull failed: ' + (e.message || 'unknown'),
          localCount: local.length,
        })
      }
    }
  }

  return res.status(200).json({
    mode: 'local-only',
    note: 'No remote records supplied and Waffo not configured. Provide { remote: [...] } to reconcile.',
    localCount: local.length,
  })
}
