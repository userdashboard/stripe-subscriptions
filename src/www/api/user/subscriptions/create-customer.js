const dashboard = require('@userappstore/dashboard')
const RedisListIndex = require('../../../../redis-list-index.js')
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
        accountid: req.account.accountid,
        created: req.account.created,
        ip: req.ip,
        userAgent: req.userAgent
      }
    }
    const customer = await stripe.customers.create(customerInfo, req.stripeKey)
    await dashboard.Account.setProperty(req.account.accountid, `customerid`, customer.id)
    await RedisListIndex.add('customers', req.customer.id)
    req.account = await dashboard.Account.load(req.account.accountid)
    req.success = true
    return customer
  }
}
