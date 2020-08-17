const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    return subscriptions.StorageList.count(`${req.appid}/account/refunds/${req.account.accountid}`, req.stripeKey)
  }
}
