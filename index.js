
global.minimumCouponLength = parseInt(process.env.MINIMUM_COUPON_LENGTH || '1', 10)
global.maximumCouponLength = parseInt(process.env.MAXIMUM_COUPON_LENGTH || '50', 10)
global.minimumPlanIDLength = parseInt(process.env.MINIMUM_PLANID_LENGTH || '1', 10)
global.maximumPlanIDLength = parseInt(process.env.MAXIMUM_PLANID_LENGTH || '50', 10)
global.minimumProductNameLength = parseInt(process.env.MINIMUM_PRODUCT_NAME_LENGTH || '1', 10)
global.maximumProductNameLength = parseInt(process.env.MAXIMUM_PRODUCT_NAME_LENGTH || '50', 10)
global.subscriptionRefundPeriod = parseInt(process.env.SUBSCRIPTION_REFUND_PERIOD || '604800', 10)
global.maximumStripeRetries = parseInt(process.env.MAXIMUM_STRIPE_RETRIES || '0', 10)
global.requireSubscription = process.env.REQUIRE_SUBSCRIPTION === 'true'
global.requirePayment = process.env.REQUIRE_PAYMENT === 'true'
global.requirePaymentConfirmation = process.env.REQUIRE_PAYMENT_CONFIRMATION === 'true'
global.overdueInvoiceThreshold = parseInt(process.env.OVERDUE_INVOICE_THRESHOLD || '1', 10)
global.startSubscriptionPath = process.env.START_SUBSCRIPTION_PATH || '/account/subscriptions/start-subscription'
global.stripeAPIVersion = '2020-03-02'
global.stripeKey = process.env.STRIPE_KEY
if (!global.stripeKey) {
  throw new Error('invalid-stripe-key')
}
global.stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY
if (global.stripeJS > 0 && !global.stripePublishableKey) {
  throw new Error('invalid-stripe-publishable-key')
}
global.subscriptionWebhookEndPointSecret = global.subscriptionWebhookEndPointSecret || process.env.SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET
if (!global.subscriptionWebhookEndPointSecret) {
  throw new Error('invalid-subscription-webhook-endpoint-secret')
}
if (process.env.STRIPE_JS) {
  global.stripeJS = process.env.STRIPE_JS === 'false' ? false : parseInt(process.env.STRIPE_JS, 10)
} else {
  global.stripeJS = false
}
if (global.stripeJS !== false && global.stripeJS !== 2 && global.stripeJS !== 3) {
  throw new Error('invalid-stripe-js-version')
}
const packageJSON = require('./package.json')
const stripe = require('stripe')()
stripe.setApiVersion(global.stripeAPIVersion)
if (global.maxmimumStripeRetries) {
  stripe.setMaxNetworkRetries(global.maximumStripeRetries)
}
stripe.setAppInfo({
  version: packageJSON.version,
  name: '@userdashboard/stripe-subscriptions',
  url: 'https://github.com/userdashboard/stripe-subscriptions'
})

module.exports = {
  setup: async () => {
    if (process.env.SUBSCRIPTIONS_STORAGE) {
      const Storage = require('@userdashboard/dashboard/src/storage.js')
      const storage = await Storage.setup('SUBSCRIPTIONS')
      const StorageList = require('@userdashboard/dashboard/src/storage-list.js')
      const storageList = await StorageList.setup(storage, 'SUBSCRIPTIONS')
      const StorageObject = require('@userdashboard/dashboard/src/storage-object.js')
      const storageObject = await StorageObject.setup(storage, 'SUBSCRIPTIONS')
      module.exports.Storage = storage
      module.exports.StorageList = storageList
      module.exports.StorageObject = storageObject
    } else {
      const dashboard = require('@userdashboard/dashboard')
      module.exports.Storage = dashboard.Storage
      module.exports.StorageList = dashboard.StorageList
      module.exports.StorageObject = dashboard.StorageObject
    }
  }
}
