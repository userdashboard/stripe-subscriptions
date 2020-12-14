const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  if (req.body && req.body.planid) {
    req.query.planid = req.body.planid
    let newPlan
    try {
      newPlan = await global.api.user.subscriptions.PublishedPlan.get(req)
      if (!newPlan.metadata.published || newPlan.metadata.unpublished) {
        req.error = 'invalid-plan'
      }
      const subscription = await global.api.user.subscriptions.Subscription.get(req)
      req.query.customerid = subscription.customer.id || subscription.customer
    } catch (error) {
      switch (error.message) {
        case 'invalid-planid':
        case 'invalid-plan':
          req.error = error.message
          break
        default:
          throw new Error('unknown-error')
      }
    }
  }
  const subscription = await global.api.user.subscriptions.Subscription.get(req)
  if (subscription.status !== 'active') {
    throw new Error('invalid-subscription')
  }
  req.query.planid = subscription.plan.id
  const currentPlan = await global.api.user.subscriptions.PublishedPlan.get(req)
  currentPlan.currency = subscription.plan.currency.toUpperCase()
  currentPlan.priceFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
  const plans = await global.api.user.subscriptions.PublishedPlans.get(req)
  const availablePlans = []
  for (const plan of plans) {
    if (plan.id === subscription.plan.id) {
      continue
    }
    availablePlans.push(plan)
  }
  req.query.accountid = req.account.accountid
  req.query.all = true
  const paymentMethods = await global.api.user.subscriptions.PaymentMethods.get(req)
  req.data = { plans: availablePlans, subscription, plan: currentPlan, paymentMethods }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  if (!req.data.plans || !req.data.plans.length) {
    messageTemplate = 'no-plans'
  }
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.subscription, 'subscription')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success' || messageTemplate === 'no-plans') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (req.data.paymentMethods && req.data.paymentMethods.length) {
    dashboard.HTML.renderList(doc, req.data.paymentMethods, 'payment-method-option-template', 'paymentmethodid')
  } else {
    const paymentMethodContainer = doc.getElementById('payment-method-container')
    paymentMethodContainer.parentNode.removeChild(paymentMethodContainer)
  }
  dashboard.HTML.renderList(doc, req.data.plans, 'plan-option-template', 'planid')
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
  if (req.query && req.query.message === 'success') {
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
