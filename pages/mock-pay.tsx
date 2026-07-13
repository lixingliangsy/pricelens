import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/Layout'

interface Order {
  id: string
  productName: string
  amount: number
  currency: string
  status: string
}

// Local stand-in for the payment gateway's hosted checkout page.
// In mock mode the buyer "pays" here; the buttons POST to /api/mock-webhook
// which simulates the gateway's async success/failure callback.
export default function MockPay() {
  const router = useRouter()
  const orderId = (router.query.orderId as string) || ''
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!orderId) return
    fetch(`/api/orders?id=${orderId}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order || null))
      .catch(() => setMsg('Failed to load order'))
      .finally(() => setLoading(false))
  }, [orderId])

  const pay = async (result: 'success' | 'fail') => {
    setBusy(result)
    setMsg('')
    try {
      const r = await fetch('/api/mock-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, result }),
      })
      const d = await r.json()
      if (d.order) {
        setOrder(d.order)
        setDone(result === 'success' ? 'Payment succeeded' : 'Payment failed')
      } else {
        setMsg(d.error || 'Callback failed')
      }
    } catch (e: any) {
      setMsg(e.message || 'Network error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Checkout — PriceLens</title>
      </Head>
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mock Checkout</h1>
          <p className="text-sm text-gray-500 mb-6">Simulated payment page (PAYMENT_MODE=mock). No real charge.</p>

          {loading && <p className="text-gray-500">Loading…</p>}
          {!loading && !order && <p className="text-red-600">Order not found.</p>}

          {order && (
            <>
              <div className="mb-4">
                <div className="text-lg font-semibold text-gray-800">{order.productName}</div>
                <div className="text-3xl font-bold text-brand my-2">
                  ${order.amount} {order.currency}
                </div>
                <div className={`text-sm font-medium ${order.status === 'paid' ? 'text-green-600' : order.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
                  status: {order.status}
                </div>
              </div>

              {order.status === 'pending' ? (
                <div className="flex gap-3">
                  <button onClick={() => pay('success')} disabled={!!busy}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50">
                    {busy === 'success' ? '…' : 'Pay successfully'}
                  </button>
                  <button onClick={() => pay('fail')} disabled={!!busy}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50">
                    {busy === 'fail' ? '…' : 'Simulate failure'}
                  </button>
                </div>
              ) : (
                <div className={`text-sm font-medium ${done?.includes('succeeded') ? 'text-green-600' : 'text-red-600'}`}>
                  {done}
                </div>
              )}

              <a href="/products" className="inline-block mt-6 text-sm text-brand underline">Back to products</a>
            </>
          )}
          {msg && <p className="text-sm text-amber-600 mt-4">{msg}</p>}
        </div>
      </div>
    </Layout>
  )
}
