const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.body || !req.body.name) {
      throw new Error('invalid-name')
    }
    if (global.minimumProductNameLength > req.body.name.length ||
      global.maximumProductNameLength < req.body.name.length) {
      throw new Error('invalid-product-name-length')
    }
    if (!req.body.statement_descriptor || !req.body.statement_descriptor.length) {
      throw new Error('invalid-statement_descriptor')
    }
    if (!req.body.unit_label || !req.body.unit_label.length) {
      throw new Error('invalid-unit_label')
    }
    const productInfo = {
      type: 'service',
      name: req.body.name,
      statement_descriptor: req.body.statement_descriptor,
      unit_label: req.body.unit_label,
      metadata: {
        appid: req.appid
      }
    }
    if (req.body.published) {
      productInfo.metadata.published = dashboard.Timestamp.now
    }
    const product = await stripeCache.execute('products', 'create', productInfo, req.stripeKey)
    const indexing = {
      [`${req.appid}/products`]: product.id
    }
    if (product.metadata.published) {
      indexing[`${req.appid}/published/products`] = product.id
    }
    await subscriptions.StorageList.addMany(indexing)
    return product
  }
}
