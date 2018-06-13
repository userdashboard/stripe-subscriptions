const RedisListIndex = require('../../redis-list-index.js')
const stripe = require('stripe')()

// The creation of objects like charges and invoices that happen
// without user actions are indexed as this webhook is notifed.  All
// other types of data are indexed as created by the user.

module.exports = {
  auth: false,
  post: async (req, res) => {
    const endpointSecret = process.env.ENDPONT_SECRET || 'whsec_blSjcGhK1UHRbyGwXa9wSaK9FzLErNIS'
    let sig = req.headers['stripe-signature']
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
      const indexes = []
      switch (event.type) {
        case 'invoice.created':
          indexes.push(
            'invoices',
            `customer:invoices:${customerid}`,
            `card:invoices:${cardid}`,
            `plan:invoices:${planid}`,
            `product:invoices:${productid}`,
            `subscription:invoices:${subscriptionid}`
          )
          break
        case 'charge.pending':
          indexes.push(
            'charges',
            `customer:charges:${customerid}`,
            `card:charges:${cardid}`,
            `subscription:charges:${subscriptionid}`,
            `plan:charges:${planid}`,
            `product:charges:${productid}`
          )
          break
        case 'refund.created':
          indexes.push(
            'refunds',
            `customer:refunds:${customerid}`,
            `card:refunds:${cardid}`,
            `subscription:refunds:${subscriptionid}`,
            `plan:refunds:${planid}`,
            `product:refunds:${productid}`
          )
          break
        case 'payout.created':
          indexes.push(
            'payouts'
          )
          break
      }
      for (const collection of indexes) {
        await RedisListIndex.add(collection, event.data.object.id)
      }
      res.status(200).end()
    } catch (err) {
      res.status(400).end()
    }
  }
}
