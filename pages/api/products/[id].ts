import type { NextApiRequest, NextApiResponse } from 'next'
import { getProduct, updateProduct, deleteProduct } from '../../../lib/products-store.mjs'

// GET    /api/products/[id] -> one product
// PUT    /api/products/[id] -> edit (incl. status: publish/unpublish)
// DELETE /api/products/[id] -> remove
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'id required' })

  if (req.method === 'GET') {
    const p = await getProduct(id)
    return p ? res.status(200).json({ product: p }) : res.status(404).json({ error: 'not found' })
  }
  if (req.method === 'PUT') {
    const p = await updateProduct(id, req.body || {})
    return p ? res.status(200).json({ product: p }) : res.status(404).json({ error: 'not found' })
  }
  if (req.method === 'DELETE') {
    const ok = await deleteProduct(id)
    return ok ? res.status(200).json({ ok: true }) : res.status(404).json({ error: 'not found' })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
