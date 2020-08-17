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
    const couponExists = await subscriptions.StorageList.exists(`${req.appid}/coupons`, req.body.couponid)
    if (!couponExists) {
      throw new Error('invalid-couponid')
    }
    const customerExists = await subscriptions.StorageList.exists(`${req.appid}/customers`, req.query.customerid)
    if (!customerExists) {
      throw new Error('invalid-customerid')
    }
    const customer = await global.api.administrator.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    if (customer.discount && customer.discount.coupon && customer.discount.coupon.id) {
      throw new Error('invalid-customer')
    }
    req.query.couponid = req.body.couponid
    const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (!coupon.metadata.published || coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
    const customerInfo = {
      coupon: req.body.couponid
    }
    const customerNow = await stripeCache.execute('customers', 'update', req.query.customerid, customerInfo, req.stripeKey)
    await stripeCache.update(customerNow)
    await subscriptions.StorageList.addMany({
      [`${req.appid}/customer/coupons/${customer.id}`]: req.body.couponid,
      [`${req.appid}/coupon/customers/${req.body.couponid}`]: customer.id
    })
    return customerNow
  }
}
