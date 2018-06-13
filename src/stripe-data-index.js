const stripe = require('stripe')()

module.exports = {
  count: async (query, type, stripeKey) => {
    let last = null
    let total = 0
    query.limit = 100
    while (true) {
      if (last) {
        query.starting_after = last
      }
      const objects = await stripe[type].list(query, stripeKey)
      for (const object of objects.data) {
        if (process.env.NODE_ENV === 'testing' && object.created < global.MINIMUM_STRIPE_TIMESTAMP) {
          continue
        }
        last = object.id
        total++
      }
      if (objects.has_more !== true) {
        return total
      }
    }
  }
}
