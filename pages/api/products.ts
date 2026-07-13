import type { NextApiRequest, NextApiResponse } from 'next'
import { listProducts, createProduct } from '../../lib/products-store.mjs'

// GET /api/products?status=published  -> list (optionally storefront-visible)
// POST /api/products                    -> create a product
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const status = (req.query.status as string) || undefined
    const products = await listProducts(status ? { status } : {})
    return res.status(200).json({ products })
  }
  if (req.method === 'POST') {
    const p = req.body || {}
    if (!p.name) return res.status(400).json({ error: 'name is required' })
    const product = await createProduct(p)
    return res.status(201).json({ product })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
