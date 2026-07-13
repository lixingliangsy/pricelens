import test from 'node:test'
import assert from 'node:assert/strict'
import { getAppUrl, getPaymentMode, getWaffoEnv, isWaffoConfigured } from '../lib/config.mjs'

test('getAppUrl defaults to localhost and strips trailing slash', () => {
  delete process.env.APP_URL
  assert.equal(getAppUrl(), 'http://localhost:3000')
  process.env.APP_URL = 'https://pricelens.example.com/'
  assert.equal(getAppUrl(), 'https://pricelens.example.com')
})

test('getPaymentMode defaults to mock', () => {
  delete process.env.PAYMENT_MODE
  assert.equal(getPaymentMode(), 'mock')
  process.env.PAYMENT_MODE = 'waffo'
  assert.equal(getPaymentMode(), 'waffo')
})

test('getWaffoEnv defaults to test; isWaffoConfigured reflects env', () => {
  delete process.env.WAFFO_ENVIRONMENT
  assert.equal(getWaffoEnv(), 'test')
  delete process.env.WAFFO_MERCHANT_ID
  delete process.env.WAFFO_PRIVATE_KEY
  assert.equal(isWaffoConfigured(), false)
  process.env.WAFFO_MERCHANT_ID = 'MER_x'
  process.env.WAFFO_PRIVATE_KEY = 'key'
  assert.equal(isWaffoConfigured(), true)
})
