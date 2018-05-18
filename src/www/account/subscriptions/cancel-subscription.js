const Navigation = require('./navbar-subscription-options.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  const subscription = await global.api.user.subscriptions.Subscription.get(req)
  if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
    throw new Error('invalid-subscription')
  }
  if (subscription.customer !== req.customer.id) {
    throw new Error('invalid-account')
  }
  const invoice = global.api.user.subscriptions.UpcomingInvoice.get(req)
  const card = req.customer.default_source || { last4: '', brand: '' }
  req.data = {subscription, card, invoice}
  if (req.session.lockURL === req.url && req.session.unlocked >= global.dashboard.Timestamp.now) {
    await global.api.user.subscriptions.DeleteSubscription.delete(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = global.dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'messageContainer')
    if (messageTemplate === 'success') {
      doc.removeElementById('submitForm')
      return global.dashboard.Response.end(req, res, doc)
    }
  }
  if (req.data.invoice.total < 0) {
    doc.renderTemplate(req.data.charge, 'refund-template', 'refund-now')
  } else {
    doc.removeElementById('refundContainer')
  }
  return global.dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.subscriptions.DeleteSubscription.delete(req)
    if (req.success) {
      if (req.body.refund === 'refund') {
        return global.dashboard.Response.redirect(req, res, `/account/refund-invoice?invoiceid=${req.data.invoice.id}`)
      }
      return renderPage(req, res, 'success')
    }
    return global.dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
