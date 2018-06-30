const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

// The creation of objects like charges and invoices that happen
// without user actions are indexed as this webhook is notifed.  All
// other types of data are indexed as created by the user.

module.exports = {
  auth: false,
  post: async (req) => {
    let stripeEvent
    try {
      stripeEvent = stripe.webhooks.constructEvent(req.bodyRaw, req.headers['stripe-signature'], process.env.ENDPOINT_SECRET)
    } catch (error) {
      throw new Error('invalid-stripe-signature')
    }
    if (!stripeEvent) {
      throw new Error('invalid-stripe-event')
    }
    let webhookNumber = await global.redisClient.getAsync('webhookNumber')
    if (webhookNumber && webhookNumber.length) {
      webhookNumber = parseInt(webhookNumber, 10)
    }
    webhookNumber = 1 + (webhookNumber || 0)
    console.log(`[webhook ~${webhookNumber}]`, stripeEvent.type, stripeEvent.data.object.id)
    let invoice, charge, customerid, subscriptionid, planid, productid, cardid
    switch (stripeEvent.type) {
      case 'invoice.created':
        invoice = stripeEvent.data.object
        if (invoice.object !== 'invoice') {
          throw new Error('invalid-invoice')
        }
        customerid = invoice.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        await dashboard.RedisList.add('invoices', invoice.id)
        await dashboard.RedisList.add(`customer:invoices:${customerid}`, invoice.id)
        await dashboard.RedisList.add(`plan:invoices:${planid}`, invoice.id)
        await dashboard.RedisList.add(`product:invoices:${productid}`, invoice.id)
        await dashboard.RedisList.add(`subscription:invoices:${subscriptionid}`, invoice.id)
        break
      case 'charge.succeeded':
        charge = stripeEvent.data.object
        if (charge.object !== 'charge') {
          throw new Error('invalid-charge')
        }
        cardid = charge.source.id
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        customerid = charge.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        await dashboard.RedisList.add('charges', charge.id)
        await dashboard.RedisList.add(`customer:charges:${customerid}`, charge.id)
        await dashboard.RedisList.add(`plan:charges:${planid}`, charge.id)
        await dashboard.RedisList.add(`product:charges:${productid}`, charge.id)
        await dashboard.RedisList.add(`customer:charges:${customerid}`, charge.id)
        await dashboard.RedisList.add(`subscription:charges:${subscriptionid}`, charge.id)
        await dashboard.RedisList.add(`card:charges:${cardid}`, charge.id)
        await dashboard.RedisList.add(`card:invoices:${cardid}`, invoice.id)
        await dashboard.RedisList.add(`card:subscriptions:${cardid}`, subscriptionid)
        await dashboard.RedisList.add(`card:products:${cardid}`, productid)
        await dashboard.RedisList.add(`card:plans:${cardid}`, planid)
        break
      case 'charge.refunded':
        charge = stripeEvent.data.object
        if (charge.object !== 'charge') {
          throw new Error('invalid-charge')
        }
        const refund = charge.refunds.data[0]
        cardid = charge.source.id
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        customerid = charge.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        await dashboard.RedisList.add('refunds', refund.id)
        await dashboard.RedisList.add(`customer:refunds:${customerid}`, refund.id)
        await dashboard.RedisList.add(`plan:refunds:${planid}`, refund.id)
        await dashboard.RedisList.add(`product:refunds:${productid}`, refund.id)
        await dashboard.RedisList.add(`subscription:refunds:${subscriptionid}`, refund.id)
        await dashboard.RedisList.add(`card:refunds:${cardid}`, refund.id)
        break
    }
    await global.redisClient.incrbyAsync('webhookNumber', 1)
  }
}
