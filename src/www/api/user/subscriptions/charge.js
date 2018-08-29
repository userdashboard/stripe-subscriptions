const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    const exists = await dashboard.RedisList.exists(`${req.appid}:charges`, req.query.chargeid)
    if (!exists) {
      throw new Error('invalid-chargeid')
    }
    const owned = await dashboard.RedisList.exists(`${req.appid}:customer:charges:${req.customer.id}`, req.query.chargeid)
    if (!owned) {
      throw new Error('invalid-account')
    }
    let charge
    try {
      charge = await stripe.charges.retrieve(req.query.chargeid, req.stripeKey)
    } catch (error) {
    }
    if (!charge) {
      throw new Error('invalid-chargeid')
    }
    if (charge.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    charge.date = dashboard.Timestamp.date(charge.created)
    return charge
  }
}
