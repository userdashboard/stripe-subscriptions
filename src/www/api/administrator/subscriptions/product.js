const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    let product
    try {
      product = await stripeCache.retrieve(req.query.productid, 'products', req.stripeKey)
    } catch (error) {
    }
    if (!product) {
      throw new Error('invalid-productid')
    }
    return product
  }
}
