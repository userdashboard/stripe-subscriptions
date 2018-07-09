const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  if (req.session.lockURL === req.url && req.session.unlocked) {
    await global.api.user.subscriptions.DeleteSubscription.delete(req)
    if (req.success) {
      return
    }
  }
  const subscription = await global.api.user.subscriptions.Subscription.get(req)
  if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
    throw new Error('invalid-subscription')
  }
  if (subscription.customer !== req.customer.id) {
    throw new Error('invalid-account')
  }
  const invoice = await global.api.user.subscriptions.UpcomingInvoice.get(req)
  const card = req.customer.default_source || { last4: '', brand: '' }
  req.data = {subscription, card, invoice}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.subscription, 'subscription')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (req.data.invoice.total < 0) {
    dashboard.HTML.renderTemplate(doc, req.data.charge, 'refund-template', 'refund-now')
  } else {
    const refundContainer = doc.getElementById('refund-container')
    refundContainer.parentNode.removeChild(refundContainer)
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.user.subscriptions.DeleteSubscription.delete(req)
    if (req.success) {
      if (req.body.refund === 'refund') {
        return dashboard.Response.redirect(req, res, `/account/refund-invoice?invoiceid=${req.data.invoice.id}`)
      }
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
