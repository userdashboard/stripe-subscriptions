(async () => {
  if (!process.env.SUBSCRIPTION_WEBHOOK_ENDPOINT_SECRET) {
    const fs = require('fs')
    const path = require('path')
    const events = fs.readdirSync(path.join(__dirname, '/src/www/webhooks/subscriptions/stripe-webhooks'))
    const eventList = []
    for (const event of events) {
      eventList.push(event.substring(0, event.indexOf('.js')))
    }
    const stripeKey = {
      api_key: process.env.STRIPE_KEY
    }
    const stripe = require('stripe')()
    stripe.setApiVersion(global.stripeAPIVersion)
    if (global.maxmimumStripeRetries) {
      stripe.setMaxNetworkRetries(global.maximumStripeRetries)
    }
    const webhooks = await stripe.webhookEndpoints.list({ limit: 100 }, stripeKey)
    if (webhooks && webhooks.data && webhooks.data.length) {
      for (const webhook of webhooks.data) {
        await stripe.webhookEndpoints.del(webhook.id, stripeKey)
      }
    }
    const webhook = await stripe.webhookEndpoints.create({
      url: `${process.env.DASHBOARD_SERVER}/webhooks/subscriptions/index-subscription-data`,
      enabled_events: eventList
    }, {
      api_key: process.env.STRIPE_KEY
    })
    global.subscriptionWebhookEndPointSecret = webhook.secret
  }
  require('./index.js')
  const dashboard = require('@userdashboard/dashboard')
  await dashboard.start(__dirname)
  if (process.env.NODE_ENV === 'testing') {
    const helperRoutes = require('./test-helper-routes.js')
    global.sitemap['/api/create-fake-payout'] = helperRoutes.createFakePayout
    global.sitemap['/api/fake-amount-owed'] = helperRoutes.fakeAmountOwed
    global.sitemap['/api/toggle-refunds'] = helperRoutes.toggleRefunds
    global.sitemap['/api/toggle-overdue-invoice-threshold'] = helperRoutes.toggleOverdueInvoiceThreshold
  }
})()
