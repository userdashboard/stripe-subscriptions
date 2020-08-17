const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    const charge = await stripeCache.retrieve(req.query.chargeid, 'charges', req.stripeKey)
    if (!charge) {
      throw new Error('invalid-chargeid')
    }
    return charge
  }
}
