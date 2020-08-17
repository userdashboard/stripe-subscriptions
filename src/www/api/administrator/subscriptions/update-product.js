const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const product = await global.api.administrator.subscriptions.Product.get(req)
    if (!product) {
      throw new Error('invalid-productid')
    }
    if (product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    const updateInfo = {}
    if (req.body.name !== undefined) {
      if (!req.body.name || !req.body.name.length) {
        throw new Error('invalid-name')
      }
      if (global.minimumProductNameLength > req.body.name.length ||
        global.maximumProductNameLength < req.body.name.length) {
        throw new Error('invalid-name-length')
      }
      updateInfo.name = req.body.name
    }
    if (req.body.statement_descriptor !== undefined) {
      if (!req.body.statement_descriptor || !req.body.statement_descriptor.length) {
        throw new Error('invalid-statement_descriptor')
      }
      if (req.body.statement_descriptor.length < 5 ||
          req.body.statement_descriptor.length > 22) {
        throw new Error('invalid-statement_descriptor-length')
      }
      updateInfo.statement_descriptor = req.body.statement_descriptor
    }
    if (req.body.unit_label !== undefined) {
      if (!req.body.unit_label || !req.body.unit_label.length) {
        throw new Error('invalid-unit_label')
      }
      updateInfo.unit_label = req.body.unit_label
    }
    if (!Object.keys(updateInfo).length) {
      throw new Error('invalid-name')
    }
    const productNow = await stripeCache.execute('products', 'update', req.query.productid, updateInfo, req.stripeKey)
    await stripeCache.update(productNow)
    return productNow
  }
}
