/* eslint-env mocha */
require('./test-helper.js')
const assert = require('assert')
const properties = [
  { camelCase: 'stripeJS', raw: 'STRIPE_JS', description: 'Use client-side stripe.js in browser', value: '3', default: '', valueDescription: 'Integer' },
  { camelCase: 'maximumStripeRetries', raw: 'MAXIMUM_STRIPE_RETRIES', description: 'Retry Stripe web requests', value: '2', default: '', valueDescription: 'Integer', defaultDescription: '0' },
  { camelCase: 'subscriptionWebhookEndPointSecret', raw: 'SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET', description: 'Secret provided by Stripe to sign webhooks', value: 'wh_sec_xxx', valueDescription: 'String', noDefaultValue: true },
  { camelCase: 'stripeKey', raw: 'STRIPE_KEY', description: 'The `sk_test_xxx` key from Stripe', value: 'sk_test_xxx', valueDescription: 'String', noDefaultValue: true },
  { camelCase: 'stripePublishableKey', raw: 'STRIPE_PUBLISHABLE_KEY', description: 'The `pk_test_xxx` key from Stripe', value: 'pk_test_xxx', valueDescription: 'String', noDefaultValue: true }, { camelCase: 'requireSubscription', raw: 'REQUIRE_SUBSCRIPTION', description: 'Users must create subscription to access application', value: 'true', default: '', valueDescription: 'Boolean' },
  { camelCase: 'requirePayment', raw: 'REQUIRE_PAYMENT', description: 'Users must resolve unpaid invoices to access application', value: 'true', default: '', valueDescription: 'Boolean' },
  { camelCase: 'requirePaymentConfirmation', raw: 'REQUIRE_PAYMENT_CONFIRMATION', description: 'Users must resolve payment confirmations to access application', value: 'true', default: '', valueDescription: 'Boolean' },
  { camelCase: 'overdueInvoiceThreshold', raw: 'OVERDUE_INVOICE_THRESHOLD', description: 'Duration in days to allow open invoices before enforcing payment', value: '6', default: '1', valueDescription: 'Integer' },
  { camelCase: 'startSubscriptionPath', raw: 'START_SUBSCRIPTION_PATH', description: 'Alternate URL path to your start subscription flow', value: '/start-subscription', default: '/account/subscriptions/start-subscription', valueDescription: 'String' }
]

const stripeKey = process.env.STRIPE_KEY
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY
const webhookSecret = process.env.SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET

describe('index', () => {
  afterEach(() => {
    process.env.STRIPE_KEY = stripeKey
    process.env.STRIPE_PUBLISHABLE_KEY = stripePublishableKey
    process.env.SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET = webhookSecret
    global.subscriptionWebhookEndPointSecret = false
    delete (require.cache[require.resolve('./index.js')])
    require('./index.js').setup(global.applicationPath)
  })
  after(() => {
    process.env.STRIPE_KEY = stripeKey
    process.env.STRIPE_PUBLISHABLE_KEY = stripePublishableKey
    process.env.SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET = webhookSecret
    delete (require.cache[require.resolve('./index.js')])
    require('./index.js').setup(global.applicationPath)
  })
  for (const property of properties) {
    describe(property.raw, () => {
      describe(property.description, () => {
        if (!property.noDefaultValue) {
          if (property.raw.startsWith('STRIPE_')) {
            process.env.SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET = 'wh_sec_xxx'
            process.env.STRIPE_KEY = 'sk_test_xxx'
            process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_xxx'
          }
          it('default ' + (property.default || property.defaultDescription || 'unset'), async () => {
            delete (process.env[property.raw])
            delete (require.cache[require.resolve('./index.js')])
            require('./index.js')
            delete (require.cache[require.resolve('./index.js')])
            assert.strictEqual((global[property.camelCase] || '').toString().trim(), property.default.toString())
          })
        }
        it(property.valueDescription, async () => {
          if (property.raw.startsWith('STRIPE_')) {
            process.env.SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET = 'wh_sec_xxx'
            process.env.STRIPE_KEY = 'sk_test_xxx'
            process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_xxx'
          }
          process.env[property.raw] = property.value
          delete (require.cache[require.resolve('./index.js')])
          global.subscriptionWebhookEndPointSecret = false
          require('./index.js')
          delete (require.cache[require.resolve('./index.js')])
          assert.strictEqual(global[property.camelCase].toString(), property.value)
        })
      })
      process.env.SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET = webhookSecret
      process.env.STRIPE_KEY = stripeKey
      process.env.STRIPE_PUBLISHABLE_KEY = stripePublishableKey
      delete (require.cache[require.resolve('./index.js')])
      require('./index.js').setup(global.applicationPath)
    })
  }
})
