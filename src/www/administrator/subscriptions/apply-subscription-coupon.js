const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-subscription.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  const subscription = await global.api.administrator.subscriptions.Subscription.get(req)
  if (req.query.message === 'success') {
    req.data = {
      subscription
    }
    return
  }
  if (!subscription.plan.amount || subscription.cancel_at_period_end) {
    throw new Error('invalid-subscription')
  }
  if (subscription.discount && subscription.discount.coupon && subscription.discount.coupon.id) {
    throw new Error('invalid-subscription')
  }
  req.query.all = true
  const coupons = await global.api.administrator.subscriptions.Coupons.get(req)
  const published = []
  if (coupons && coupons.length) {
    for (const coupon of coupons) {
      if (coupon.metadata.published && !coupon.metadata.unpublished) {
        published.push(coupon)
      }
    }
  }
  req.data = { subscription, coupons: published }
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.subscription, 'subscription', req.language)
  navbar.setup(doc, req.data.subscription)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (req.data.coupons && req.data.coupons.length) {
    dashboard.HTML.renderList(doc, req.data.coupons, 'coupon-option', 'couponid')
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body || !req.body.couponid) {
    return renderPage(req, res)
  }
  if (!req.data.coupons || !req.data.coupons.length) {
    return renderPage(req, res, 'invalid-couponid')
  }
  let coupon
  try {
    coupon = await global.api.administrator.subscriptions.Coupon.get(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (coupon.metadata.unpublished ||
      !coupon.metadata.published ||
      (coupon.max_redemptions &&
      coupon.max_redemptions === coupon.times_redeemed)) {
    return renderPage(req, res, 'invalid-coupon')
  }
  try {
    await global.api.administrator.subscriptions.SetSubscriptionCoupon.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?subscriptionid=${req.query.subscriptionid}&message=success`
    })
    return res.end()
  }
}
