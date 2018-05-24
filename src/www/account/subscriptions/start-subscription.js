const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar-subscription-options.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.planid) {
    throw new Error('invalid-planid')
  }
  const plan = await global.api.user.subscriptions.Plan.get(req)
  if (!plan.metadata.published || plan.metadata.unpublished) {
    throw new Error('invalid-plan')
  }
  const card = req.customer.default_source || { last4: '', brand: '' }
  req.data = {card, plan}
  if (req.session.lockURL === req.url && req.session.unlocked >= dashboard.Timestamp.now) {
    await global.api.user.subscriptions.CreateSubscription.post(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'messageContainer')
    if (messageTemplate === 'success') {
      doc.removeElementById('submitForm')
      return dashboard.Response.end(req, res, doc)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
  if (subscriptions && subscriptions.length) {
    for (const subscription of subscriptions) {
      if (subscription.plan.id === req.query.planid) {
        return renderPage(req, res, 'duplicate-subscription')
      }
    }
  }
  try {
    await global.api.user.subscriptions.CreateSubscription.post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
