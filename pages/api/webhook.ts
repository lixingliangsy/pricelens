import type { NextApiRequest, NextApiResponse } from 'next'

export const config = { api: { bodyParser: false } }

// In-memory subscription store (placeholder). Swap for a DB in production.
const subscriptions = new Map<string, any>()

function readRaw(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return res.status(200).json({ received: true, note: 'STRIPE_WEBHOOK_SECRET not set; webhook logged only.' })
  }
  try {
    const raw = await readRaw(req)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe: any = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
    const sig = req.headers['stripe-signature'] as string
    const event = stripe.webhooks.constructEvent(raw, sig, secret)
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as any
      subscriptions.set(s.id, {
        plan: s.metadata?.plan,
        email: s.customer_email,
        at: Date.now(),
      })
    }
    return res.status(200).json({ received: true })
  } catch (e: any) {
    return res.status(400).json({ error: e.message || 'Webhook verification failed' })
  }
}
