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
    await global.api.user.subscriptions.UpdateSubscriptionPlan.patch(req)
  }
  let subscription = await global.api.user.subscriptions.Subscription.get(req)
  if (subscription.status === 'canceled' || subscription.customer !== req.customer.id || subscription.cancel_at_period_end) {
    throw new Error('invalid-subscription')
  }
  req.query.planid = subscription.plan.id
  const currentPlan = await global.api.user.subscriptions.Plan.get(req)
  currentPlan.text = currentPlan.metadata.display.change_plan || currentPlan.metadata.display.register || currentPlan.name
  currentPlan.currency = subscription.plan.currency.toUpperCase()
  currentPlan.priceFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
  const plans = await global.api.user.subscriptions.Plans.get(req)
  const activePlans = []
  for (const plan of plans) {
    if (currentPlan.id === plan.id || !plan.metadata.published || plan.metadata.unpublished) {
      continue
    }
    plan.text = plan.metadata.display.change_plan || plan.metadata.display.register || plan.name
    plan.currency = plan.currency.toUpperCase()
    plan.priceFormatted = dashboard.Format.money(plan.amount || 0, plan.currency)
    activePlans.push(plan)
  }
  req.data = {plans: activePlans, subscription, plan: currentPlan}
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
  dashboard.HTML.renderList(doc, req.data.plans, 'plan-option-template', 'plans-select')
  dashboard.HTML.renderTemplate(doc, req.data.plan, 'plan-name-template', 'plan-name')
  const subscriptionidField = doc.getElementById('subscriptionid')
  subscriptionidField.setAttribute('value', req.query.subscriptionid)
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (!req.body.planid) {
    return renderPage(req, res, 'invalid-planid')
  }
  if (req.body.planid === req.data.plan.id) {
    return renderPage(req, res, 'invalid-plan')
  }
  req.query.planid = req.body.planid
  let newPlan
  try {
    newPlan = await global.api.user.subscriptions.Plan.get(req)
  } catch (error) {
    switch (error.message) {
      case 'invalid-planid':
      case 'invalid-plan':
        return renderPage(req, res, error.message)
    }
    return renderPage(req, res, 'unknown-error')
  }
  if (newPlan.amount > 0 && !req.customer.default_source) {
    return renderPage(req, res, 'invalid-payment_source')
  }
  if (!newPlan.metadata.published || newPlan.metadata.unpublished) {
    return renderPage(req, res, 'invalid-plan')
  }
  try {
    await global.api.user.subscriptions.UpdateSubscriptionPlan.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
