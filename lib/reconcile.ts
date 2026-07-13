import { TxRecord } from './transactions'

export interface ReconcileReport {
  generatedAt: string
  localCount: number
  remoteCount: number
  /** In local records but NOT found in the remote list (possible missing payout). */
  onlyLocal: TxRecord[]
  /** In the remote list but NOT in local records (possible unrecorded payment). */
  onlyRemote: TxRecord[]
  /** Present in both but status/amount disagree. */
  mismatched: { local: TxRecord; remote: TxRecord; reason: string }[]
}

/**
 * Diff local transaction records against a remote list (e.g. Waffo portal
 * export or a GraphQL query). Match by externalId when available, else by
 * id. Pure function — easy to unit test with mock data.
 */
export function diffTx(local: TxRecord[], remote: TxRecord[]): ReconcileReport {
  const report: ReconcileReport = {
    generatedAt: new Date().toISOString(),
    localCount: local.length,
    remoteCount: remote.length,
    onlyLocal: [],
    onlyRemote: [],
    mismatched: [],
  }

  const remoteByKey = new Map<string, TxRecord>()
  for (const r of remote) {
    const key = r.externalId || r.id
    if (key) remoteByKey.set(key, r)
  }
  const localByKey = new Map<string, TxRecord>()
  for (const l of local) {
    const key = l.externalId || l.id
    if (key) localByKey.set(key, l)
  }

  for (const l of local) {
    const key = l.externalId || l.id
    const r = key ? remoteByKey.get(key) : undefined
    if (!r) {
      report.onlyLocal.push(l)
      continue
    }
    const reasons: string[] = []
    if (l.status && r.status && l.status !== r.status) {
      reasons.push(`status: local=${l.status} remote=${r.status}`)
    }
    if (l.amount && r.amount && l.amount !== r.amount) {
      reasons.push(`amount: local=${l.amount} remote=${r.amount}`)
    }
    if (l.currency && r.currency && l.currency !== r.currency) {
      reasons.push(`currency: local=${l.currency} remote=${r.currency}`)
    }
    if (reasons.length) {
      report.mismatched.push({ local: l, remote: r, reason: reasons.join('; ') })
    }
  }

  for (const r of remote) {
    const key = r.externalId || r.id
    if (!key || !localByKey.has(key)) {
      report.onlyRemote.push(r)
    }
  }

  return report
}
