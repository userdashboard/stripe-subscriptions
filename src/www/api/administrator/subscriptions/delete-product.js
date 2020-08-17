const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  delete: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const product = await global.api.administrator.subscriptions.Product.get(req)
    if (!product) {
      throw new Error('invalid-productid')
    }
    await stripeCache.execute('products', 'del', req.query.productid, req.stripeKey)
    await subscriptions.StorageList.remove(`${req.appid}/products`, req.query.productid)
    if (product.metadata.unpublished) {
      await subscriptions.StorageList.remove(`${req.appid}/unpublished/products`, req.query.productid)
    } else if (product.metadata.published) {
      await subscriptions.StorageList.remove(`${req.appid}/published/products`, req.query.productid)
    }
    await stripeCache.delete(req.query.productid, req.stripeKey)
    return true
  }
}
