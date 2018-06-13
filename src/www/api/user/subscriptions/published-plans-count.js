const stripeDataIndex = require('../../../../stripe-data-index.js')

module.exports = {
  get: async (req) => {
    const filter = {
      limit: 100
    }
    const total = await stripeDataIndex.count(filter, 'published:plans', req.stripeKey)
    return total
  }
}
