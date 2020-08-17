const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    let customer
    try {
      customer = await stripeCache.retrieve(req.query.customerid, 'customers', req.stripeKey)
    } catch (error) {
    }
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    return customer
  }
}
