const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.couponid) {
    throw new Error('invalid-couponid')
  }
  const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
  req.data = {coupon}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.coupon, 'coupon')
  return dashboard.Response.end(req, res, doc)
}
