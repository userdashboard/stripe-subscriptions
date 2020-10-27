const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-plan.js')

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
  if (plan.metadata.unpublished) {
    throw new Error('invalid-plan')
  }
  const products = await global.api.administrator.subscriptions.Products.get(req)
  const published = []
  if (products && products.length) {
    for (const product of products) {
      if (!product.metadata.published || product.metadata.unpublished) {
        continue
      }
      published.push(product)
    }
  }
  req.data = { plan, products: published }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.plan, 'plan', req.language)
  navbar.setup(doc, req.data.plan)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  const trialPeriodDaysField = doc.getElementById('trial_period_days')
  trialPeriodDaysField.setAttribute('value', req.body ? (req.body.trial_period_days || '').split("'").join('&quot;') : req.data.plan.trial_period_days || 0)
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
  if (req.query && req.query.message === 'success') {
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
  req.query.productid = req.body.productid
  let product
  try {
    product = await global.api.administrator.subscriptions.Product.get(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (!product) {
    return renderPage(req, res, 'invalid-productid')
  }
  if (product.metadata.unpublished || !product.metadata.published) {
    return renderPage(req, res, 'invalid-product')
  }
  try {
    await global.api.administrator.subscriptions.UpdatePlan.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?planid=${req.query.planid}&message=success`
    })
    return res.end()
  }
}
