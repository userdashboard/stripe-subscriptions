const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.planid) {
    throw new Error('invalid-planid')
  }
  const plan = await global.api.user.subscriptions.PublishedPlan.get(req)
  if (!plan) {
    throw new Error('invalid-planid')
  }
  if (plan.metadata.unpublished) {
    throw new Error('invalid-plan')
  }
  switch (plan.currency) {
    case 'usd':
      plan.amountFormatted = `$${plan.amount / 100}`
      break
    default:
      plan.amountFormatted = plan.amount
      break
  }
  req.query.accountid = req.account.accountid
  req.query.all = true
  const customers = await global.api.user.subscriptions.Customers.get(req)
  req.data = { plan, customers }
}

function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.plan, 'plan', req.language)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, {}, messageTemplate, 'message-container')
  }
  dashboard.HTML.renderTemplate(doc, req.data.plan, 'plan-row', 'plan-table')
  if (req.data.plan.trial_period_days) {
    dashboard.HTML.renderTemplate(doc, req.data.plan, 'charge-later', 'charge')
  } else {
    dashboard.HTML.renderTemplate(doc, req.data.plan, 'charge-now', 'charge')
  }
  if (req.data.customers && req.data.customers.length) {
    dashboard.HTML.renderList(doc, req.data.customers, 'customer-option', 'customerid')
    if (req.body) {
      dashboard.HTML.setSelectedOptionByValue(doc, 'customerid', req.body.customerid)
    }
  } else {
    const existingContainer = doc.getElementById('existing-container')
    existingContainer.parentNode.removeChild(existingContainer)
  }
  return res.end(doc.toString())
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.query && req.query.message === 'success') {
    return renderPage(req, res)
  }
  if (!req.body.customerid || !req.data.customers || !req.data.customers.length) {
    return renderPage(req, res, 'invalid-customerid')
  }
  let found = false
  for (const customer of req.data.customers) {
    found = customer.id === req.body.customerid
    if (found) {
      if (req.data.plan.amount && !customer.invoice_settings.default_payment_method) {
        return renderPage(req, res, 'invalid-paymentmethodid')
      }
      break
    }
  }
  if (!found) {
    return renderPage(req, res, 'invalid-customerid')
  }
  req.query.customerid = req.body.customerid
  req.body.planid = req.query.planid
  try {
    await global.api.user.subscriptions.CreateSubscription.post(req)
    return dashboard.Response.redirect(req, res, '/home')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
