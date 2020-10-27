const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-coupon.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.couponid) {
    throw new Error('invalid-couponid')
  }
  const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
  if (req.query.message === 'success') {
    req.data = {
      coupon
    }
    return
  }
  if (coupon.metadata.published) {
    throw new Error('invalid-coupon')
  }
  coupon.createdFormatted = dashboard.Format.date(coupon.created)
  if (coupon.amount_off) {
    coupon.amount_offFormatted = dashboard.Format.money(coupon.amount_off, coupon.currency)
  }
  req.data = { coupon }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.coupon, 'coupon', req.language)
  navbar.setup(doc, req.data.coupon)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc.toString())
    }
  }
  return dashboard.Response.end(req, res, doc.toString())
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.SetCouponPublished.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?couponid=${req.query.couponid}&message=success`
    })
    return res.end()
  }
}
