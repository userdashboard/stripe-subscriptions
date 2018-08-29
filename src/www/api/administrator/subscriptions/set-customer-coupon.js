const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    const couponExists = await dashboard.RedisList.exists(`${req.appid}:coupons`, req.body.couponid)
    if (!couponExists) {
      throw new Error('invalid-couponid')
    }
    const customerExists = await dashboard.RedisList.exists(`${req.appid}:customers`, req.query.customerid)
    if (!customerExists) {
      throw new Error('invalid-customerid')
    }
    let customer
    try {
      customer = await stripe.customers.retrieve(req.query.customerid, req.stripeKey)
    } catch (error) {
    }
    if (!customer) {
      throw new Error('invalid-customerid')
    }
    if (customer.discount) {
      throw new Error('invalid-customer')
    }
    let coupon
    try {
      coupon = await stripe.coupons.retrieve(req.body.couponid, req.stripeKey)
    } catch (error) {
    }
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (!coupon.metadata.published || coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
  },
  patch: async (req) => {
    const customerInfo = {
      coupon: req.body.couponid
    }
    try {
      const customer = await stripe.customers.update(req.query.customerid, customerInfo, req.stripeKey)
      req.success = true
      await dashboard.RedisList.add(`${req.appid}:customer:coupons:${customer.id}`, req.body.couponid)
      await dashboard.RedisList.add(`${req.appid}:coupon:customers:${req.body.couponid}`, customer.id)
      return customer
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
