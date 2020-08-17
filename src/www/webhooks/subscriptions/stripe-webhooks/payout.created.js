const subscriptions = require('../../../../../index.js')

module.exports = async (stripeEvent, req) => {
  await subscriptions.StorageList.add(`${req.appid}/payouts`, stripeEvent.data.object.id)
}
