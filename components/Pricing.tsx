import React, { useState } from 'react'
import { PRODUCT } from '../lib/product'

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const upgrade = async (plan: 'pro' | 'studio') => {
    setLoading(plan)
    setMsg('')
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const d = await r.json()
      if (d.url) {
        // Waffo guide hard rule: open checkout in a new tab with noopener.
        window.open(d.url, '_blank', 'noopener,noreferrer')
        return
      }
      setMsg(d.message || d.error || 'Could not start checkout.')
    } catch (e: any) {
      setMsg(e.message || 'Network error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div id="pricing" className="mt-16 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Pricing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(PRODUCT.pricing || []).map((p, i) => {
          const isFree = i === 0
          const plan = (p.tier || '').toLowerCase() as 'pro' | 'studio'
          return (
            <div key={p.tier} className="bg-white p-6 rounded-xl shadow text-center flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800">{p.tier}</h3>
              <p className="text-2xl font-bold text-brand my-2">{p.price}</p>
              <p className="text-gray-600 text-sm mb-4">{p.desc}</p>
              {isFree ? (
                <button
                  disabled
                  className="mt-auto w-full bg-gray-200 text-gray-500 py-3 rounded-lg cursor-not-allowed"
                >
                  Current
                </button>
              ) : (
                <button
                  onClick={() => upgrade(plan)}
                  disabled={loading === plan}
                  className="mt-auto w-full bg-brand text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading === plan ? 'Redirecting...' : `Upgrade to ${p.tier}`}
                </button>
              )}
            </div>
          )
        })}
      </div>
      {msg && <p className="text-center text-sm text-amber-600 mt-4">{msg}</p>}
    </div>
  )
}
