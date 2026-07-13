import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billingPeriod: 'once' | 'monthly' | 'yearly'
  status: 'draft' | 'published'
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/products?status=published')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setMsg('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const buy = async (id: string) => {
    setBusy(id)
    setMsg('')
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      })
      const d = await r.json()
      if (d.url) {
        // Open checkout (mock page or real Waffo) in a new tab.
        window.open(d.url, '_blank', 'noopener,noreferrer')
        return
      }
      setMsg(d.message || d.error || 'Could not start checkout.')
    } catch (e: any) {
      setMsg(e.message || 'Network error')
    } finally {
      setBusy(null)
    }
  }

  const periodLabel = (p: Product) =>
    p.billingPeriod === 'once' ? '' : p.billingPeriod === 'yearly' ? '/yr' : '/mo'

  return (
    <Layout>
      <Head>
        <title>Products — PriceLens</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600 mb-8">Choose a plan and check out. Payments run in{' '}
          <code className="bg-gray-100 px-1 rounded">PAYMENT_MODE</code> (mock by default).</p>

        {loading && <p className="text-gray-500">Loading…</p>}
        {!loading && products.length === 0 && (
          <p className="text-gray-500">No published products yet. Add some in <a className="text-brand underline" href="/admin/products">Admin</a>.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-xl shadow flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
              <p className="text-2xl font-bold text-brand my-2">
                ${p.price}
                <span className="text-sm font-normal text-gray-500">{periodLabel(p)}</span>
              </p>
              <p className="text-gray-600 text-sm mb-4 flex-grow">{p.description}</p>
              <button
                onClick={() => buy(p.id)}
                disabled={busy === p.id}
                className="w-full bg-brand text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {busy === p.id ? 'Redirecting…' : 'Buy'}
              </button>
            </div>
          ))}
        </div>
        {msg && <p className="text-center text-sm text-amber-600 mt-4">{msg}</p>}
      </div>
    </Layout>
  )
}
