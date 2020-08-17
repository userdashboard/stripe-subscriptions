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
  if (coupon.metadata.unpublished) {
    throw new Error('invalid-coupon')
  }
  req.data = { coupon }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, req.data.coupon, 'coupon', req.language)
  navbar.setup(doc, req.data.coupon)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  const nameField = doc.getElementById('name')
  nameField.setAttribute('value', req.body ? (req.body.name || '').split("'").join('&quot;') : req.data.coupon.name || req.data.coupon.id)
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.query && req.query.message === 'success') {
    return renderPage(req, res)
  }
  if (!req.body.name) {
    return renderPage(req, res, 'invalid-name')
  }
  try {
    await global.api.administrator.subscriptions.UpdateCoupon.patch(req)
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
