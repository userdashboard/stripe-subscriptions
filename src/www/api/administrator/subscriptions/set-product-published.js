const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
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
    if (product.metadata.published || product.metadata.unpublished) {
      throw new Error('invalid-product')
    }
    const updateInfo = {
      metadata: {
        published: dashboard.Timestamp.now
      }
    }
    const productNow = await stripeCache.execute('products', 'update', req.query.productid, updateInfo, req.stripeKey)
    await stripeCache.update(productNow)
    await subscriptions.StorageList.add(`${req.appid}/published/products`, req.query.productid)
    return productNow
  }
}
