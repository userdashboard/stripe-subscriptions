const fs = require('fs')
const Log = require('@userdashboard/dashboard/src/log.js')('stripe-subscriptions')
const packageJSON = require('../../../../package.json')
const path = require('path')
const stripe = require('stripe')({
  apiVersion: global.stripeAPIVersion,
  telemetry: false,
  maxNetworkRetries: global.maximumStripeRetries || 0,
  appInfo: {
    version: packageJSON.version,
    name: '@userdashboard/stripe-subscriptions',
    url: 'https://github.com/userdashboard/stripe-subscriptions'
  }
})
const stripeCache = require('../../../stripe-cache.js')
const webhookPath = path.join(__dirname, '.')
const supportedWebhooks = {}
const subscriptionWebhooks = fs.readdirSync(`${webhookPath}/stripe-webhooks/`)
for (const webhookHandler of subscriptionWebhooks) {
  const type = webhookHandler.substring(0, webhookHandler.indexOf('.js'))
  supportedWebhooks[type] = require(`${webhookPath}/stripe-webhooks/${webhookHandler}`)
}

module.exports = {
  auth: false,
  template: false,
  post: async (req, res) => {
    res.statusCode = 200
    if (!req.body || !req.bodyRaw) {
      return res.end()
    }
    if (global.testNumber) {
      if (req.bodyRaw.indexOf('appid') > -1 && req.bodyRaw.indexOf(global.testNumber) === -1) {
        return res.end()
      }
    }
    let stripeEvent
    try {
      stripeEvent = stripe.webhooks.constructEvent(req.bodyRaw, req.headers['stripe-signature'], req.endpointSecret || global.subscriptionWebhookEndPointSecret)
    } catch (error) {
    }
    if (!stripeEvent) {
      return res.end()
    }
    res.statusCode = 200
    if (supportedWebhooks[stripeEvent.type]) {
      try {
        await supportedWebhooks[stripeEvent.type](stripeEvent, req)
      } catch (error) {
        res.statusCode = 500
        Log.error('subscription webhook error', error)
      }
    }
    if (stripeEvent.data &&
        stripeEvent.data.object &&
        stripeEvent.data.object.id) {
      await stripeCache.delete(stripeEvent.data.object.id)
    }
    if (global.testNumber) {
      global.webhooks = global.webhooks || []
      global.webhooks.unshift(stripeEvent)
    }
    return res.end()
  }
}
