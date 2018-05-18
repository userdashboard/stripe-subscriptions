const stripe = require('stripe')()

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.accountid) {
      throw new Error('invalid-accountid')
    }
    if (req.account.customerid || req.query.accountid !== req.account.accountid) {
      throw new Error('invalid-account')
    }
    const profile = await global.dashboard.Profile.load(req.account.accountid)
    const customerInfo = {
      email: profile.email,
      description: `${profile.firstName} ${profile.lastName}`,
      metadata: {
        accountid: req.account.accountid,
        created: req.account.created,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    }
    const customer = await stripe.customers.create(customerInfo, req.stripeKey)
    await global.dashboard.Account.setProperty(req.account.accountid, `customerid`, customer.id)
    req.account = await global.dashboard.Account.load(req.account.accountid)
    req.success = true
    return customer
  }
}
