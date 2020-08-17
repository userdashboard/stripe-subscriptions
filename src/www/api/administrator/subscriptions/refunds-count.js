const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    return subscriptions.StorageList.count(`${req.appid}/refunds`, req.stripeKey)
  }
}
