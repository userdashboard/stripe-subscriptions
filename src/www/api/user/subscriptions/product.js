const stripe = require('stripe')()

module.exports = {
  auth: false,
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const product = await stripe.products.retrieve(req.query.productid, req.stripeKey)
    if (!product.metadata.published || product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    return product
  }
}
