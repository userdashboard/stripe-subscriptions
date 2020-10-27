const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-coupon.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.couponid) {
    throw new Error('invalid-couponid')
  }
  const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
  coupon.createdFormatted = dashboard.Format.date(coupon.created)
  if (coupon.amount_off) {
    coupon.amount_offFormatted = dashboard.Format.money(coupon.amount_off, coupon.currency)
  }
  req.data = { coupon }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.coupon, 'coupon', req.language)
  navbar.setup(doc, req.data.coupon)
  return dashboard.Response.end(req, res, doc)
}
