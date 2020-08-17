const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    req.query = req.query || {}
    let productids
    if (req.query.all) {
      productids = await subscriptions.StorageList.listAll(`${req.appid}/products`)
    } else {
      const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : global.pageSize
      productids = await subscriptions.StorageList.list(`${req.appid}/products`, offset, limit)
    }
    if (!productids || !productids.length) {
      return null
    }
    const items = []
    for (const productid of productids) {
      req.query.productid = productid
      const product = await global.api.administrator.subscriptions.Product.get(req)
      items.push(product)
    }
    return items
  }
}
