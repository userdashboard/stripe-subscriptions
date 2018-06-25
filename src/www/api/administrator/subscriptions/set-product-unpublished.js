const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    let product
    try {
      product = await stripe.products.retrieve(req.query.productid, req.stripeKey)
    } catch (error) {
    }
    if (!product) {
      throw new Error('invalid-productid')
    }
    if (!product.metadata.published || product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      metadata: {
        unpublished: dashboard.Timestamp.now
      }
    }
    try {
      await stripe.products.update(req.query.productid, updateInfo, req.stripeKey)
      req.success = true
      await dashboard.RedisList.remove('published:products', req.query.productid)
      await dashboard.RedisList.add('unpublished:products', req.query.productid)
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
