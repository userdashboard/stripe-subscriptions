const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-customer')
    }
    if (customer.discount) {
      throw new Error('invalid-customer')
    }
    const couponExists = await subscriptions.StorageList.exists(`${req.appid}/coupons`, req.body.couponid)
    if (!couponExists) {
      throw new Error('invalid-couponid')
    }
    req.query.couponid = req.body.couponid
    const coupon = await global.api.user.subscriptions.PublishedCoupon.get(req)
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    const customerInfo = {
      coupon: req.body.couponid
    }
    const customerNow = await stripeCache.execute('customers', 'update', req.query.customerid, customerInfo, req.stripeKey)
    await stripeCache.update(customerNow)
    return customerNow
  }
}
