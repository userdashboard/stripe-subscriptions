const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const customer = await global.api.administrator.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    if (!customer.discount) {
      throw new Error('invalid-customer')
    }
    const updateInfo = {
      coupon: null
    }
    const customerNow = await stripeCache.execute('customers', 'update', req.query.customerid, updateInfo, req.stripeKey)
    await stripeCache.update(customerNow)
    return customerNow
  }
}
