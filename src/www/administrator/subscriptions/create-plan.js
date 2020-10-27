const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  const products = await global.api.administrator.subscriptions.Products.get(req)
  const published = []
  if (products && products.length) {
    for (const product of products) {
      if (product.metadata.published && !product.metadata.unpublished) {
        published.push(product)
      }
    }
  }
  req.data = { products: published }
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, null, null, req.language)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (req.data.products && req.data.products.length) {
    dashboard.HTML.renderList(doc, req.data.products, 'product-option-template', 'productid')
  }
  if (req.body) {
    dashboard.HTML.setSelectedOptionByValue(doc, 'productid', req.body.productid || '')
    dashboard.HTML.setSelectedOptionByValue(doc, 'currency', req.body.currency || 'usd')
    const idField = doc.getElementById('planid')
    idField.setAttribute('value', (req.body.planid || '').split("'").join('&quot;'))
    const nicknameField = doc.getElementById('nickname')
    nicknameField.setAttribute('value', (req.body.nickname || '').split("'").join('&quot;'))
    const amountField = doc.getElementById('amount')
    amountField.setAttribute('value', (req.body.amount || '').split("'").join('&quot;'))
    dashboard.HTML.setSelectedOptionByValue(doc, 'interval_count', (req.body.interval_count || '').split("'").join('&quot;'))
    dashboard.HTML.setSelectedOptionByValue(doc, 'interval', (req.body.interval || '').split("'").join('&quot;'))
    const trialPeriodDaysField = doc.getElementById('trial_period_days')
    trialPeriodDaysField.setAttribute('value', (req.body.trial_period_days || '').split("'").join('&quot;'))
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.query && req.query.message === 'success') {
    return renderPage(req, res)
  }
  if (!req.body.planid || !req.body.planid.trim()) {
    return renderPage(req, res, 'invalid-planid')
  }
  if (global.minimumPlanIDLength > req.body.planid.length ||
    global.maximumPlanIDLength < req.body.planid.length) {
    return renderPage(req, res, 'invalid-planid-length')
  }
  if (!req.body.productid || !req.body.productid.length) {
    return renderPage(req, res, 'invalid-productid')
  }
  if (!req.body.amount) {
    return renderPage(req, res, 'invalid-amount')
  }
  if (!req.body.currency) {
    return renderPage(req, res, 'invalid-currency')
  }
  if (req.body.usage_type !== 'licensed' && req.body.usage_type !== 'metered') {
    return renderPage(req, res, 'invalid-usage_type')
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
  let validProduct = false
  if (req.data.products && req.data.products.length) {
    for (const product of req.data.products) {
      if (product.id === req.body.productid) {
        validProduct = true
        break
      }
    }
  }
  if (!validProduct) {
    return renderPage(req, res, 'invalid-productid')
  }
  let plan
  try {
    plan = await global.api.administrator.subscriptions.CreatePlan.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `/administrator/subscriptions/plan?planid=${plan.id}`
    })
    return res.end()
  }
}
