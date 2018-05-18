const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.body || !req.body.name) {
      throw new Error('invalid-name')
    }
    if (global.MINIMUM_PRODUCT_NAME_LENGTH > req.body.name.length ||
      global.MAXIMUM_PRODUCT_NAME_LENGTH < req.body.name.length) {
      throw new Error('invalid-product-name-length')
    }
    if (!req.body.statement_descriptor || !req.body.statement_descriptor.length) {
      throw new Error('invalid-statement_descriptor')
    }
    if (!req.body.unit_label || !req.body.unit_label.length) {
      throw new Error('invalid-unit_label')
    }
  },
  post: async (req) => {
    const productInfo = {
      type: `service`,
      name: req.body.name,
      statement_descriptor: req.body.statement_descriptor,
      unit_label: req.body.unit_label
    }
    const product = await stripe.products.create(productInfo, req.stripeKey)
    req.success = true
    return product
  }
}
