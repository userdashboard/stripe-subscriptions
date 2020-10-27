const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-customer.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.customerid) {
    throw new Error('invalid-customerid')
  }
  const customer = await global.api.administrator.subscriptions.Customer.get(req)
  if (req.query.message === 'success') {
    customer.discount = {
      coupon: {
      }
    }
    req.data = {
      customer
    }
    return
  }
  if (!customer) {
    throw new Error('invalid-customerid')
  }
  if (!customer.discount ||
      !customer.discount.coupon ||
      !customer.discount.coupon.id) {
    throw new Error('invalid-customer')
  }
  req.data = { customer }
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.customer, 'customer', req.language)
  navbar.setup(doc, req.data.customer)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.ResetCustomerCoupon.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?customerid=${req.query.customerid}&message=success`
    })
    return res.end()
  }
}
