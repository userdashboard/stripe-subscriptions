const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

// The creation of objects like charges and invoices that happen
// without user actions are indexed as this webhook is notifed.  All
// other types of data are indexed as created by the user.

module.exports = {
  auth: false,
  post: async (req) => {
    const endpointSecret = process.env.ENDPONT_SECRET || 'whsec_jtVof8FKN5SVsDjE0MvDXjgVeriWXl2X'
    let stripeEvent
    try {
      stripeEvent = stripe.webhooks.constructEvent(req.bodyRaw, req.headers['stripe-signature'], endpointSecret)
    } catch (error) {
    }
    if (!stripeEvent) {
      throw new Error('invalid-stripe-event')
    }
    let charge, invoice, type
    switch (stripeEvent.type) {
      case 'invoice.created':
        type = 'invoices'
        invoice = stripeEvent.data.object
        break
      case 'charge.pending':
        type = 'charges'
        charge = stripeEvent.data.object
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        break
      case 'charge.refunded':
        charge = stripeEvent.data.object
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        type = 'refunds'
        break
    }
    if (!type) {
      return
    }
    const customer = await stripe.customers.retrieve(invoice.customer, req.stripeKey)
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription, req.stripeKey)
    const plan = await stripe.plans.retrieve(subscription.plan, req.stripeKey)
    const customerid = invoice.customerid
    const planid = subscription.plan
    const productid = plan.product
    const cardid = customer.default_source
    const subscriptionid = invoice.subscription
    const indexes = [
      type,
      `customer:${type}:${customerid}`,
      `card:${type}:${cardid}`,
      `plan:${type}:${planid}`,
      `product:${type}:${productid}`,
      `subscription:${type}:${subscriptionid}`
    ]
    for (const collection of indexes) {
      await dashboard.RedisList.add(collection, stripeEvent.data.object.id)
    }
  }
}
