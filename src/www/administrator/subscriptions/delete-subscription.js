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
  if (req.session.lockURL === req.url && req.session.unlocked >= global.dashboard.Timestamp.now) {
    await global.api.administrator.subscriptions.DeleteSubscription.delete(req)
  }
  req.data = {subscription}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = global.dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'messageContainer')
    if (messageTemplate === 'success') {
      doc.removeElementById('submitForm')
    }
  }
  return global.dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (req.data.subscription.deleted) {
    return renderPage(req, res, 'success')
  }
  try {
    await global.api.administrator.subscriptions.DeleteSubscription.delete(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return global.dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
