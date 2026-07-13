import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billingPeriod: 'once' | 'monthly' | 'yearly'
  waffoProductId?: string
  status: 'draft' | 'published'
}

const empty = {
  name: '',
  description: '',
  price: 19,
  currency: 'USD',
  billingPeriod: 'monthly' as const,
  waffoProductId: '',
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState({ ...empty })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setMsg('Failed to load products'))
  }
  useEffect(load, [])

  const submit = async () => {
    if (!form.name) return setMsg('Name is required')
    setBusy(true)
    setMsg('')
    try {
      const isEdit = !!editingId
      const url = isEdit ? `/api/products/${editingId}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'
      const body = isEdit
        ? { name: form.name, description: form.description, price: Number(form.price), currency: form.currency, billingPeriod: form.billingPeriod, waffoProductId: form.waffoProductId || undefined }
        : { ...form, price: Number(form.price), waffoProductId: form.waffoProductId || undefined }
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        return setMsg(d.error || 'Save failed')
      }
      setForm({ ...empty })
      setEditingId(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  const edit = (p: Product) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      billingPeriod: p.billingPeriod,
      waffoProductId: p.waffoProductId || '',
    })
  }

  const setStatus = async (id: string, status: 'draft' | 'published') => {
    setMsg('')
    const r = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!r.ok) return setMsg('Status update failed')
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (!r.ok) return setMsg('Delete failed')
    load()
  }

  return (
    <Layout>
      <Head>
        <title>Admin — Products</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Admin</h1>

        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit product' : 'New product'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded p-2" placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="border rounded p-2" placeholder="Waffo product ID (PROD_xxx, optional)" value={form.waffoProductId}
              onChange={(e) => setForm({ ...form, waffoProductId: e.target.value })} />
            <input className="border rounded p-2" type="number" placeholder="Price" value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <input className="border rounded p-2" placeholder="Currency" value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            <select className="border rounded p-2" value={form.billingPeriod}
              onChange={(e) => setForm({ ...form, billingPeriod: e.target.value as any })}>
              <option value="once">once</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
            <textarea className="border rounded p-2 md:col-span-2" placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={submit} disabled={busy}
              className="bg-brand text-white px-4 py-2 rounded hover:opacity-90 disabled:opacity-50">
              {busy ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm({ ...empty }) }}
                className="px-4 py-2 rounded border">Cancel</button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow divide-y">
          {products.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">{p.name}{' '}
                  <span className="text-gray-400 text-sm">${p.price} {p.currency}/{p.billingPeriod}</span>
                </div>
                <div className="text-xs text-gray-500">{p.status}{p.waffoProductId ? ` · ${p.waffoProductId}` : ''}</div>
              </div>
              <div className="flex gap-2 text-sm">
                {p.status === 'published'
                  ? <button className="px-3 py-1 rounded border text-amber-700" onClick={() => setStatus(p.id, 'draft')}>Unpublish</button>
                  : <button className="px-3 py-1 rounded border text-green-700" onClick={() => setStatus(p.id, 'published')}>Publish</button>}
                <button className="px-3 py-1 rounded border text-gray-700" onClick={() => edit(p)}>Edit</button>
                <button className="px-3 py-1 rounded border text-red-700" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className="p-4 text-gray-500 text-sm">No products yet.</div>}
        </div>
        {msg && <p className="text-sm text-amber-600 mt-4">{msg}</p>}
      </div>
    </Layout>
  )
}
