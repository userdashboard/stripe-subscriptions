const RedisListIndex = require('../../../../redis-list-index.js')
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
  },
  delete: async (req) => {
    try {
      await stripe.products.del(req.query.productid, req.stripeKey)
      await RedisListIndex.remove('products', req.query.productid)
      await RedisListIndex.remove('published:products', req.query.productid)
      await RedisListIndex.remove('unpublished:products', req.query.productid)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
