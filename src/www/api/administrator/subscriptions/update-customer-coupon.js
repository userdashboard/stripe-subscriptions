const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.customerid) {
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
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    let coupon
    try {
      coupon = await stripe.coupons.retrieve(req.body.couponid, req.stripeKey)
    } catch (error) {
    }
    if (!coupon) {
      throw new Error('invalid-couponid')
    }
    if (coupon.metadata.unpublished) {
      throw new Error('invalid-coupon')
    }
  },
  patch: async (req) => {
    const updateInfo = {
      coupon: req.body.couponid
    }
    try {
      await stripe.customers.update(req.query.customerid, updateInfo, req.stripeKey)
      req.success = true
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
