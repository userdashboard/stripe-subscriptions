const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.body || !req.body.couponid) {
      throw new Error('invalid-couponid')
    }
    if (!req.body.couponid.match(/^[a-zA-Z0-9_]+$/) ||
      global.minimumCouponLength > req.body.couponid.length ||
      global.maximumCouponLength < req.body.couponid.length) {
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
      } else {
        throw new Error('invalid-duration_in_months')
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
    if (
      (req.body.redeem_by_day && req.body.redeem_by_day !== '0') ||
      (req.body.redeem_by_month && req.body.redeem_by_month !== '0') ||
      (req.body.redeem_by_year && req.body.redeem_by_year !== '0') ||
      (req.body.redeem_by_hour && req.body.redeem_by_hour !== 'HH') ||
      (req.body.redeem_by_minute && req.body.redeem_by_minute !== 'MM')) {
      if (req.body.redeem_by_meridiem !== 'AM' && req.body.redeem_by_meridiem !== 'PM') {
        throw new Error('invalid-redeem_by_meridiem')
      }
      try {
        expires = new Date(
          new Date().getFullYear().toString().substring(0, 2) + req.body.redeem_by_year,
          req.body.redeem_by_month - 1,
          req.body.redeem_by_day,
          req.body.redeem_by_meridiem === 'PM' ? req.body.redeem_by_hour + 12 : req.body.redeem_by_hour,
          req.body.redeem_by_minute,
          0)
        const expiresTimestamp = dashboard.Timestamp.create(expires)
        if (expiresTimestamp - dashboard.Timestamp.now > 5 * 365 * 24 * 60 * 60) {
          throw new Error('invalid-redeem_by')
        }
      } catch (s) {
        throw new Error('invalid-redeem_by')
      }
      if (!expires) {
        throw new Error('invalid-redeem_by')
      }
      req.body.redeem_by = dashboard.Timestamp.create(expires)
      if (req.body.redeem_by < dashboard.Timestamp.now) {
        throw new Error('invalid-redeem_by')
      }
    }
    const couponInfo = {
      id: req.body.couponid,
      duration: req.body.duration || null,
      redeem_by: req.body.redeem_by,
      metadata: {
        appid: req.appid
      }
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
      couponInfo.metadata.published = dashboard.Timestamp.now
    }
    const coupon = await stripeCache.execute('coupons', 'create', couponInfo, req.stripeKey)
    const indexing = {
      [`${req.appid}/coupons`]: coupon.id
    }
    if (coupon.metadata.published) {
      indexing[`${req.appid}/published/coupons`] = coupon.id
    }
    await subscriptions.StorageList.addMany(indexing)
    return coupon
  }
}
