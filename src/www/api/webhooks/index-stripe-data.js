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
    const indexes = []
    let invoice, charge, customerid, subscriptionid, planid, productid, cardid
    switch (stripeEvent.type) {
      case 'invoice.created':
        invoice = stripeEvent.data.object
        customerid = invoice.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        indexes.push(
          'invoices',
          `customer:invoices:${customerid}`,
          `plan:invoices:${planid}`,
          `product:invoices:${productid}`,
          `subscription:invoices:${subscriptionid}`)
        break
      case 'charge.succeeded':
        charge = stripeEvent.data.object
        cardid = charge.source.id
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        customerid = charge.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        indexes.push(
          'charges',
          `customer:charges:${customerid}`,
          `plan:charges:${planid}`,
          `product:charges:${productid}`,
          `subscription:charges:${subscriptionid}`,
          `card:charges:${cardid}`,
          `card:invoices:${cardid}`,
          `card:subscriptions:${cardid}`,
          `card:products:${cardid}`,
          `card:plans:${cardid}`)
        break
      case 'charge.refunded':
        charge = stripeEvent.data.object
        cardid = charge.source.id
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        customerid = charge.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        indexes.push(
          'refunds',
          `customer:refunds:${customerid}`,
          `plan:refunds:${planid}`,
          `product:refunds:${productid}`,
          `subscription:refunds:${subscriptionid}`,
          `card:refunds:${cardid}`)
        break
    }
    if (!indexes.length) {
      return
    }
    console.log('[webhook]', indexes.join(', '))
    for (const collection of indexes) {
      await dashboard.RedisList.add(collection, stripeEvent.data.object.id)
    }
  }
}
