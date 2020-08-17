const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  auth: false,
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const product = await stripeCache.retrieve(req.query.productid, 'products', req.stripeKey)
    if (!product.metadata.published || product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    return product
  }
}
