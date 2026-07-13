export interface InputField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "PriceLens",
  slug: "pricelens",
  tagline: "See how your pricing page compares in 30 seconds",
  description: "Paste a pricing page URL or your plan copy; get a blunt teardown: positioning gaps, confusing tiers, and 3 concrete fixes. Built for indie founders doing Build in Public.",
  toolTitle: "Paste your pricing",
  resultLabel: "Your teardown",
  ctaLabel: "Analyze pricing",
  features: [
  "Tier-clarity score",
  "Positioning gaps",
  "3 copy fixes",
  "Benchmark vs common SaaS tiers"
],
  inputs: [
  {
    "key": "url",
    "label": "Pricing page URL (optional)",
    "type": "input",
    "placeholder": "https://..."
  },
  {
    "key": "copy",
    "label": "Or paste your plan copy",
    "type": "textarea",
    "placeholder": "e.g. Starter $9 - 1 project; Pro $29 - 5 projects; Team $99 - unlimited"
  },
  {
    "key": "market",
    "label": "Market",
    "type": "select",
    "options": [
      "B2B SaaS",
      "Consumer app",
      "Dev tools",
      "Marketplace"
    ]
  }
] as InputField[],
  systemPrompt: "You are a pricing strategist for indie SaaS. Given a pricing page URL or plan copy and the market, output: (1) a tier-clarity score 1-10 with one line why, (2) the biggest positioning gap, (3) exactly 3 concrete copy/structure fixes. Be blunt and specific. No fluff.",
  pricing: [
  {
    "tier": "Free",
    "price": "$0",
    "desc": "3 analyses/month"
  },
  {
    "tier": "Pro",
    "price": "$19/mo",
    "desc": "Unlimited, save history"
  },
  {
    "tier": "Studio",
    "price": "$49/mo",
    "desc": "Competitor batch, export"
  }
],
  mock: (inputs: Record<string, string>): string => {
  const m = inputs['market'] || 'B2B SaaS'
  const c = inputs['copy'] || inputs['url'] || 'your pricing'
  return `PRICING TEARDOWN - ${m}

Tier clarity: 6/10
- One line why: tiers blur together; the middle plan has no clear "why upgrade" reason.

Biggest positioning gap:
- No anchor. The top tier doesn't make the cheaper ones feel obvious.

3 concrete fixes:
1. Name the middle plan after the job ("Growth"), not a number.
2. Add one bold outcome per tier, not a feature list.
3. Show "most popular" on the plan you want to sell.

---
(Mock teardown. Add OPENAI_API_KEY for a real analysis of your page.)`
}
}
