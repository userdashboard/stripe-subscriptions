const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    if (!req.body.couponid.match(/^[a-zA-Z0-9]+$/) ||
      global.MINIMUM_COUPON_LENGTH > req.body.couponid.length ||
      global.MAXIMUM_COUPON_LENGTH < req.body.couponid.length) {
      throw new Error('invalid-couponid')
    }
    if (req.body.amount_off) {
      try {
        req.body.amount_off = parseInt(req.body.amount_off, 10)
        if (!req.body.amount_off) {
          throw new Error('invalid-amount_off')
        }
      } catch (s) {
        throw new Error('invalid-amount_off')
      }
      if (req.body.amount_off < 0) {
        throw new Error('invalid-amount_off')
      }
      if (!req.body.currency || req.body.currency.length !== 3) {
        throw new Error('invalid-currency')
      }
    } else if (req.body.percent_off) {
      try {
        req.body.percent_off = parseInt(req.body.percent_off, 10)
        if (!req.body.percent_off) {
          throw new Error('invalid-percent_off')
        }
      } catch (s) {
        throw new Error('invalid-percent_off')
      }
      if (req.body.percent_off < 0 || req.body.percent_off > 100) {
        throw new Error('invalid-percent_off')
      }
    }
    if (!req.body.amount_off && !req.body.percent_off) {
      throw new Error('invalid-amount_off')
    }
    if (req.body.duration !== 'once' && req.body.duration !== 'repeating' && req.body.duration !== 'forever') {
      throw new Error('invalid-duration')
    }
    if (req.body.duration === 'repeating') {
      if (req.body.duration_in_months) {
        try {
          req.body.duration_in_months = parseInt(req.body.duration_in_months, 10)
          if (!req.body.duration_in_months) {
            throw new Error('invalid-duration_in_months')
          }
        } catch (s) {
          throw new Error('invalid-duration_in_months')
        }
        if (req.body.duration_in_months < 1 || req.body.duration_in_months > 24) {
          throw new Error('invalid-duration_in_months')
        }
      }
    }
    if (req.body.max_redemptions) {
      try {
        req.body.max_redemptions = parseInt(req.body.max_redemptions, 10)
        if (!req.body.max_redemptions) {
          throw new Error('invalid-max_redemptions')
        }
      } catch (s) {
        throw new Error('invalid-max_redemptions')
      }
      if (req.body.max_redemptions < 0) {
        throw new Error('invalid-max_redemptions')
      }
    }
    let expires
    if (req.body.expire_day || req.body.expire_month || req.body.expire_year ||
      req.body.expire_hour || req.body.expire_minute || req.body.expire_meridien) {
      if (req.body.expire_meridien !== 'AM' && req.body.expire_meridien !== 'PM') {
        throw new Error('invalid-expire_meridien')
      }
      try {
        expires = new Date(
          req.body.expire_year,
          req.body.expire_month - 1,
          req.body.expire_day,
          req.body.expire_meridien === 'PM' ? req.body.expire_hour + 12 : req.body.expire_hour,
          req.body.expire_minute,
          0)
      } catch (s) {
        throw new Error('invalid-expire')
      }
      if (!expires) {
        throw new Error('invalid-expire')
      }
      req.body.expires = dashboard.Timestamp.create(expires)
      if (req.body.expires < dashboard.Timestamp.now) {
        throw new Error('invalid-expire')
      }
    }
  },
  post: async (req) => {
    const couponInfo = {
      id: req.body.couponid,
      duration: req.body.duration || null,
      redeem_by: req.body.expires
    }
    if (req.body.amount_off) {
      couponInfo.amount_off = req.body.amount_off
      couponInfo.currency = req.body.currency
    } else {
      couponInfo.percent_off = req.body.percent_off
    }
    if (req.body.duration_in_months) {
      couponInfo.duration_in_months = req.body.duration_in_months
    }
    if (req.body.max_redemptions) {
      couponInfo.max_redemptions = req.body.max_redemptions
    }
    if (req.body.published) {
      couponInfo.metadata = {
        published: dashboard.Timestamp.now
      }
    }
    const coupon = await stripe.coupons.create(couponInfo, req.stripeKey)
    req.success = true
    await dashboard.RedisList.add('coupons', coupon.id)
    if (coupon.metadata.published) {
      await dashboard.RedisList.add('published:coupons', coupon.id)
    }
    return coupon
  }
}
