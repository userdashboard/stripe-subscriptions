const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.administrator.subscriptions.CouponsCount.get(req)
  const coupons = await global.api.administrator.subscriptions.Coupons.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (coupons && coupons.length) {
    for (const coupon of coupons) {
      if (coupon.percent_off) {
        coupon.discount = `${coupon.percent_off}%`
      } else {
        if (coupon.currency === 'usd') {
          coupon.discount = `$${coupon.amount_off / 100} ${coupon.currency.toUpperCase()}`
        } else if (coupon.currency === 'eu') {
          coupon.discount = `€${coupon.amount_off / 100} ${coupon.currency.toUpperCase()}`
        } else {
          coupon.discount = `${coupon.amount_off} ${coupon.currency.toUpperCase()}`
        }
      }
    }
  }
  req.data = {coupons, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.coupons && req.data.coupons.length) {
    doc.renderTable(req.data.coupons, 'coupon-row-template', 'coupons-table')
    for (const coupon of req.data.coupons) {
      if (coupon.metadata.unpublished) {
        doc.removeElementsById([`draft-coupon-${coupon.id}`, `published-coupon-${coupon.id}`])
      } else if (coupon.metadata.published) {
        doc.removeElementsById([`draft-coupon-${coupon.id}`, `unpublished-coupon-${coupon.id}`])
      } else {
        doc.removeElementsById([`published-coupon-${coupon.id}`, `unpublished-coupon-${coupon.id}`])
      }
    }
    if (req.data.count < global.PAGE_SIZE) {
      doc.removeElementById('page-links')
    } else {
      doc.renderPagination(req.data.offset, req.data.count)
    }
  } else {
    doc.removeElementById('coupons-table')
  }
  return dashboard.Response.end(req, res, doc)
}
