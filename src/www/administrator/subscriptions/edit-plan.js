const Navigation = require('./navbar-plan-data.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.planid) {
    throw new Error('invalid-planid')
  }
  const plan = await global.api.administrator.subscriptions.Plan.get(req)
  const products = await global.api.administrator.subscriptions.Products.get(req)
  req.data = {plan, products}
  if (req.session.lockURL === req.url && req.session.unlocked >= global.dashboard.Timestamp.now) {
    await global.api.administrator.subscriptions.UpdatePlan.patch(req)
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
  }
  const trialPeriodDaysField = doc.getElementById('trial_period_days')
  trialPeriodDaysField.setAttribute('value', req.body ? req.body.trial_period_days : req.data.plan.trial_period_days || 0)
  if (req.data.products && req.data.products.length) {
    doc.renderList(req.data.products, 'product-option-template', 'productid')
  }
  doc.setSelectedOptionByValue('productid', req.body ? req.body.productid : req.data.plan.productid)
  return global.dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (!req.body.productid) {
    return renderPage(req, res, 'invalid-productid')
  }
  if (req.body.trial_period_days) {
    try {
      req.body.trial_period_days = parseInt(req.body.trial_period_days, 10)
    } catch (s) {
      return renderPage(req, res, 'invalid-trial_period_days')
    }
    if (!req.body.trial_period_days || req.body.trial_period_days < 0 || req.body.trial_period_days > 365) {
      return renderPage(req, res, 'invalid-trial_period_days')
    }
  }
  try {
    await global.api.administrator.subscriptions.UpdatePlan.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return global.dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    switch (error.message) {
      case 'invalid-product':
      case 'invalid-productid':
      case 'invalid-trial_period_days':
        return renderPage(req, res, error.message)
    }
    return renderPage(req, res, 'unknown-error')
  }
}
