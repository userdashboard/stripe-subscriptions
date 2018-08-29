const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.account.customerid || req.query.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    const profile = await dashboard.Profile.load(req.account.profileid)
    const customerInfo = {
      email: profile.email,
      description: `${profile.firstName} ${profile.lastName}`,
      metadata: {
        appid: req.headers['x-appid'] || process.env.appid,
        accountid: req.account.accountid,
        created: req.account.created,
        ip: req.ip,
        userAgent: req.userAgent
      }
    }
    const customer = await stripe.customers.create(customerInfo, req.stripeKey)
    await dashboard.RedisObject.setProperty(req.account.accountid, `customerid`, customer.id)
    await dashboard.RedisList.add('customers', customer.id)
    req.success = true
    return customer
  }
}
