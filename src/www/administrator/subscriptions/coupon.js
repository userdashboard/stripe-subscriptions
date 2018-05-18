const Navigation = require('./navbar-coupon-options.js')

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
  const doc = global.dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  doc.renderTemplate(req.data.coupon, 'coupon-row-template', 'coupons-table')
  return global.dashboard.Response.end(req, res, doc)
}
