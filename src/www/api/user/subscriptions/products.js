const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  auth: false,
  get: async (req) => {
    const products = await stripe.products.list(req.stripeKey)
    const activeProducts = []
    if (products && products.data.length) {
      for (const product of products.data) {
        if (!product.metadata.published || product.metadata.unpublished) {
          continue
        }
        product.created = dashboard.Timestamp.date(product.created)
        activeProducts.push(product)
      }
    }
    if (!activeProducts.length) {
      return null
    }
    return activeProducts
  }
}
