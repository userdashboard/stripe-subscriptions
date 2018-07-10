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
    await global.api.administrator.subscriptions.UpdatePlan.patch(req)
    if (req.success) {
      return
    }
  }
  const plan = await global.api.administrator.subscriptions.Plan.get(req)
  if (plan.metadata.unpublished) {
    throw new Error('invalid-plan')
  }
  const products = await global.api.administrator.subscriptions.Products.get(req)
  req.data = {plan, products}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  const trialPeriodDaysField = doc.getElementById('trial_period_days')
  trialPeriodDaysField.setAttribute('value', req.body ? req.body.trial_period_days : req.data.plan.trial_period_days || 0)
  if (req.data.products && req.data.products.length) {
    dashboard.HTML.renderList(doc, req.data.products, 'product-option-template', 'productid')
  }
  dashboard.HTML.setSelectedOptionByValue(doc, 'productid', req.body ? req.body.productid : req.data.plan.productid)
  return dashboard.Response.end(req, res, doc)
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
      const trialPeriodDays = parseInt(req.body.trial_period_days, 10)
      if (!trialPeriodDays || trialPeriodDays < 0 || trialPeriodDays > 365) {
        return renderPage(req, res, 'invalid-trial_period_days')
      }
    } catch (s) {
      return renderPage(req, res, 'invalid-trial_period_days')
    }
  }
  try {
    await global.api.administrator.subscriptions.UpdatePlan.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
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
