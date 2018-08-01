const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.CouponsCount.get(req)
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
  req.data = {coupons, total, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.coupons && req.data.coupons.length) {
    dashboard.HTML.renderTable(doc, req.data.coupons, 'coupon-row', 'coupons-table')
    for (const coupon of req.data.coupons) {
      const draftCoupon = doc.getElementById(`draft-coupon-${coupon.id}`)
      const publishedCoupon = doc.getElementById(`published-coupon-${coupon.id}`)
      const unpublishedCoupon = doc.getElementById(`unpublished-coupon-${coupon.id}`)
      if (coupon.metadata.unpublished) {
        draftCoupon.parentNode.removeChild(draftCoupon)
        publishedCoupon.parentNode.removeChild(publishedCoupon)
      } else if (coupon.metadata.published) {
        draftCoupon.parentNode.removeChild(draftCoupon)
        unpublishedCoupon.parentNode.removeChild(unpublishedCoupon)
      } else {
        publishedCoupon.parentNode.removeChild(publishedCoupon)
        unpublishedCoupon.parentNode.removeChild(unpublishedCoupon)
      }
    }
    if (req.data.total <= global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
  } else {
    const couponsTable = doc.getElementById('coupons-table')
    couponsTable.parentNode.removeChild(couponsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
