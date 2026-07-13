import { promises as fs } from 'fs'
import path from 'path'

/**
 * Local transaction record. On Vercel serverless the filesystem is ephemeral,
 * so for production swap this module to Vercel KV / Upstash / Postgres.
 * The interface stays the same.
 */
export interface TxRecord {
  id: string
  externalId?: string
  source: 'checkout' | 'webhook' | 'reconcile' | 'refund'
  event?: string
  plan?: string
  amount?: string
  currency?: string
  paymentId?: string
  buyerEmail?: string
  productId?: string
  status: string
  raw?: unknown
  createdAt: string
}

/** Resolve the Waffo product id for a plan from env. */
export function productIdForPlan(plan?: string): string | undefined {
  if (plan === 'studio') return process.env.WAFFO_PRODUCT_STUDIO
  if (plan === 'pro') return process.env.WAFFO_PRODUCT_PRO
  return undefined
}

function txDir(): string {
  return process.env.WAFFO_TX_DIR || '/tmp/waffo-tx'
}

function txFile(): string {
  return path.join(txDir(), 'transactions.jsonl')
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(txDir(), { recursive: true })
}

export async function appendTx(tx: TxRecord): Promise<void> {
  await ensureDir()
  await fs.appendFile(txFile(), JSON.stringify(tx) + '\n', 'utf8')
}

export async function listTx(limit = 200): Promise<TxRecord[]> {
  try {
    const buf = await fs.readFile(txFile(), 'utf8')
    const lines = buf
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const all = lines.map((l) => JSON.parse(l) as TxRecord)
    return all.slice(-limit).reverse() // newest first
  } catch (e: any) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

export async function getTxByExternalId(
  externalId: string,
): Promise<TxRecord | null> {
  const all = await listTx(100000)
  return all.find((t) => t.externalId === externalId) || null
}

export async function getTxByPaymentId(
  paymentId: string,
): Promise<TxRecord | null> {
  const all = await listTx(100000)
  return all.find((t) => t.paymentId === paymentId) || null
}
