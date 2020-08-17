const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    const result = await subscriptions.StorageList.count(`${req.appid}/published/products`)
    return result
  }
}
