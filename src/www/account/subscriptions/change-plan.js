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
    await global.api.user.subscriptions.SetSubscriptionPlan.patch(req)
    if (req.success) {
      return
    }
  }
  if (req.body && req.body.planid) {
    req.query.planid = req.body.planid
    let newPlan
    try {
      newPlan = await global.api.user.subscriptions.PublishedPlan.get(req)
      if (!newPlan.metadata.published || newPlan.metadata.unpublished) {
        req.error = 'invalid-plan'
      }
      if (newPlan.amount > 0 && !req.customer.default_source) {
        req.error = 'invalid-cardid'
      }
    } catch (error) {
      switch (error.message) {
        case 'invalid-planid':
        case 'invalid-plan':
          req.error = error.message
          break
        case 'invalid-payment_source':
          req.error = 'invalid-cardid'
          break
        default:
          throw new Error('unknown-error')
      }
    }
  }
  let subscription = await global.api.user.subscriptions.Subscription.get(req)
  if (subscription.status === 'canceled' || subscription.customer !== req.customer.id || subscription.cancel_at_period_end) {
    throw new Error('invalid-subscription')
  }
  req.query.planid = subscription.plan.id
  const currentPlan = await global.api.user.subscriptions.PublishedPlan.get(req)
  currentPlan.currency = subscription.plan.currency.toUpperCase()
  currentPlan.priceFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
  const plans = await global.api.user.subscriptions.PublishedPlans.get(req)
  req.data = {plans, subscription, plan: currentPlan}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
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
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (req.error) {
    return renderPage(req, res)
  }
  if (!req.body) {
    return renderPage(req, res)
  }
  if (!req.body.planid) {
    return renderPage(req, res, 'invalid-planid')
  }
  if (req.body.planid === req.data.plan.id) {
    return renderPage(req, res, 'invalid-plan')
  }
  try {
    await global.api.user.subscriptions.SetSubscriptionPlan.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
