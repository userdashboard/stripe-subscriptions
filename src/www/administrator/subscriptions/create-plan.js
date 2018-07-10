const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (req.session.lockURL === req.url && req.session.unlocked) {
    await global.api.administrator.subscriptions.CreatePlan.post(req)
    if (req.success) {
      return
    }
  }
  const products = await global.api.administrator.subscriptions.Products.get(req)
  req.data = { products }
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  req.body = req.body || {}
  if (req.data.products && req.data.products.length) {
    dashboard.HTML.renderList(doc, req.data.products, 'product-option-template', 'productid')
  }
  dashboard.HTML.setSelectedOptionByValue(doc, 'productid', req.body.productid || '0')
  dashboard.HTML.setSelectedOptionByValue(doc, 'currency-select', req.body.currency || 'usd')
  const idField = doc.getElementById('planid')
  idField.setAttribute('value', req.body.planid || '')
  const amountField = doc.getElementById('amount')
  amountField.setAttribute('value', req.body.amount || '0')
  dashboard.HTML.setSelectedOptionByValue(doc, 'interval_count', req.body.interval_count || '')
  dashboard.HTML.setSelectedOptionByValue(doc, 'interval', req.body.interval || '')
  const trialPeriodDaysField = doc.getElementById('trial_period_days')
  trialPeriodDaysField.setAttribute('value', req.body.trial_period_days || '0')
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (!req.body.planid || !req.body.planid.trim()) {
    return renderPage(req, res, 'invalid-planid')
  }
  if (global.MINIMUM_PLAN_LENGTH > req.body.planid.length ||
    global.MAXIMUM_PLAN_LENGTH < req.body.planid.length) {
    return renderPage(req, res, 'invalid-planid-length')
  }
  if (!req.body.productid) {
    return renderPage(req, res, 'invalid-productid')
  }
  if (!req.body.amount) {
    return renderPage(req, res, 'invalid-amount')
  }
  try {
    const amount = parseInt(req.body.amount, 10)
    if (amount < 0) {
      return renderPage(req, res, 'invalid-amount')
    }
  } catch (s) {
    return renderPage(req, res, 'invalid-amount')
  }
  if (!req.body.interval_count) {
    return renderPage(req, res, 'invalid-interval_count')
  }
  if (req.body.interval !== 'day' && req.body.interval !== 'week' && req.body.interval !== 'month' && req.body.interval !== 'year') {
    return renderPage(req, res, 'invalid-interval')
  }
  try {
    const intervalCount = parseInt(req.body.interval_count, 10)
    if (!intervalCount || intervalCount < 1) {
      return renderPage(req, res, 'invalid-interval_count')
    }
  } catch (s) {
    return renderPage(req, res, 'invalid-interval_count')
  }
  if (req.body.trial_period_days) {
    try {
      const trialPeriodDays = parseInt(req.body.trial_period_days, 10)
      if (trialPeriodDays < 0 || trialPeriodDays > 365) {
        return renderPage(req, res, 'invalid-trial_period_days')
      }
    } catch (s) {
      return renderPage(req, res, 'invalid-trial_period_days')
    }
  }
  try {
    await global.api.administrator.subscriptions.CreatePlan.post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    switch (error.message) {
      case 'invalid-amount':
      case 'invalid-interval':
      case 'invalid-interval_count':
      case 'invalid-currency':
      case 'invalid-product':
      case 'invalid-trial_period_days':
      case 'invalid-productid':
        return renderPage(req, res, error.message)
    }
    return renderPage(req, res, 'unknown-error')
  }
}
