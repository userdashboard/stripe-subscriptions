const subscriptions = require('../../../../../index.js')

module.exports = async (stripeEvent, req) => {
  const discount = stripeEvent.data.object
  const indexing = {
    [`${req.appid}/customer/coupons/${discount.customer}`]: discount.coupon.id,
    [`${req.appid}/coupon/customers/${discount.coupon.id}`]: discount.customer
  }
  if (discount.subscription) {
    indexing[`${req.appid}/subscription/coupons/${discount.subscription}`] = discount.coupon.id
    indexing[`${req.appid}/coupon/subscriptions/${discount.coupon.id}`] = discount.subscription
  }
  await subscriptions.StorageList.addMany(indexing)
}
