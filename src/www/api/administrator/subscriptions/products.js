const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const products = await stripe.products.list(req.stripeKey)
    if (products && products.data.length) {
      for (const product of products.data) {
        product.created = global.dashboard.Timestamp.date(product.created)
      }
    }
    return products.data
  }
}
