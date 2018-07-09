const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.planid) {
    throw new Error('invalid-planid')
  }
  if (req.session.lockURL === req.url && req.session.unlocked) {
    await global.api.user.subscriptions.CreateSubscription.post(req)
  }
  const plan = await global.api.user.subscriptions.PublishedPlan.get(req)
  if (req.success) {
    req.data = {plan}
    return
  }
  req.query.customerid = req.customer.id
  const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
  if (subscriptions && subscriptions.length) {
    for (const subscription of subscriptions) {
      if (subscription.plan.id === req.query.planid) {
        req.error = 'duplicate-subscription'
        req.data = {plan}
        return
      }
    }
  }
  const card = req.customer.default_source || { last4: '', brand: '' }
  req.data = {card, plan}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.plan, 'plan')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success' || messageTemplate === 'duplicate-subscription') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (req.error) {
    return renderPage(req, res)
  }
  req.body = {
    cardid: req.customer.default_source
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
