import type { NextApiRequest, NextApiResponse } from 'next'
import { listTx } from '../../lib/transactions'

// Lists local transaction records. Returns JSON by default, or an HTML table
// when ?format=html (a simple, clear transaction-records view).
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const limit = Math.min(parseInt((req.query.limit as string) || '200', 10) || 200, 1000)
  const txs = await listTx(limit)

  if (req.query.format === 'html') {
    const rows = txs
      .map(
        (t) => `<tr>
          <td>${t.createdAt}</td>
          <td>${t.source}</td>
          <td>${t.event || '-'}</td>
          <td>${t.plan || '-'}</td>
          <td>${t.amount || '-'} ${t.currency || ''}</td>
          <td>${t.status}</td>
          <td>${t.externalId || '-'}</td>
        </tr>`,
      )
      .join('')
    const html = `<!doctype html><html><head><meta charset="utf-8">
      <title>Waffo Transactions</title>
      <style>body{font-family:system-ui,sans-serif;margin:2rem}
      table{border-collapse:collapse;width:100%}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
      th{background:#f5f5f5}</style></head><body>
      <h1>Waffo Transaction Records (${txs.length})</h1>
      <table><thead><tr>
        <th>Time</th><th>Source</th><th>Event</th><th>Plan</th>
        <th>Amount</th><th>Status</th><th>External ID</th>
      </tr></thead><tbody>${rows}</tbody></table></body></html>`
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(html)
  }

  return res.status(200).json({ count: txs.length, transactions: txs })
}
