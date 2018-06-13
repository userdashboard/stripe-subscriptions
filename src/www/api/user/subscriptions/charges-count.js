const stripeDataIndex = require('../../../../stripe-data-index.js')

module.exports = {
  get: async (req) => {
    const filter = {
      limit: 100,
      customer: req.customerid
    }
    const total = await stripeDataIndex.count(filter, 'charges', req.stripeKey)
    return total
  }
}
