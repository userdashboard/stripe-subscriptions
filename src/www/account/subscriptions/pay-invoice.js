const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-invoice.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invoiceid) {
    throw new Error('invalid-invoiceid')
  }
  const invoice = await global.api.user.subscriptions.Invoice.get(req)
  if (req.query.message === 'success') {
    req.data = {
      invoice
    }
    return
  }
  if (invoice.paid) {
    throw new Error('invalid-invoice')
  }
  invoice.totalFormatted = dashboard.Format.money(invoice.total, invoice.currency)
  invoice.createdFormatted = dashboard.Format.date(invoice.created)
  invoice.lines.data[invoice.lines.data.length - 1].period.startFormatted = dashboard.Format.date(invoice.lines.data[invoice.lines.data.length - 1].period.start)
  invoice.lines.data[invoice.lines.data.length - 1].period.endFormatted = dashboard.Format.date(invoice.lines.data[invoice.lines.data.length - 1].period.end)
  let subscription
  if (invoice.subscription) {
    req.query.subscriptionid = invoice.subscription || invoice.lines.data[invoice.lines.data.length - 1].subscription
    subscription = await global.api.user.subscriptions.Subscription.get(req)
  }
  req.query.customerid = invoice.customer
  const customer = await global.api.user.subscriptions.Customer.get(req)
  req.data = { customer, invoice, subscription }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, req.data.invoice, 'invoice', req.language)

  await navbar.setup(doc, req.data.invoice)
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
  req.body = req.body || {}
  req.body.paymentmethodid = req.data.customer.invoice_settings.default_payment_method
  try {
    await global.api.user.subscriptions.SetInvoicePaid.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?invoiceid=${req.query.invoiceid}&message=success`
    })
    return res.end()
  }
}
