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
    if (product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    if (!req.body.name || !req.body.name.length) {
      throw new Error('invalid-name')
    }
    if (global.MINIMUM_PRODUCT_NAME_LENGTH < req.body.name ||
      global.MAXIMUM_PRODUCT_NAME_LENGTH > req.body.name) {
      throw new Error('invalid-product-name-length')
    }
    if (!req.body.statement_descriptor || !req.body.statement_descriptor.length) {
      throw new Error('invalid-statement_descriptor')
    }
    if (!req.body.unit_label || !req.body.unit_label.length) {
      throw new Error('invalid-unit_label')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      name: req.body.name,
      statement_descriptor: req.body.statement_descriptor,
      unit_label: req.body.unit_label
    }
    try {
      const product = await stripe.products.update(req.query.productid, updateInfo, req.stripeKey)
      req.success = true
      return product
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
