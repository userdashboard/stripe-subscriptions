const subscriptions = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    const account = await global.api.user.Account.get(req)
    if (!account) {
      throw new Error('invalid-account')
    }
    return subscriptions.StorageList.count(`${req.appid}/account/paymentIntentsPendingConfirmation/${req.query.accountid}`, req.stripeKey)
  }
}
