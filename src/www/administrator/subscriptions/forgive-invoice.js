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
  if (req.query.message === 'success') {
    req.data = {
      invoice: {
        id: req.query.invoiceid,
        object: 'invoice'
      }
    }
    return
  }
  const invoice = await global.api.administrator.subscriptions.Invoice.get(req)
  if (invoice.status !== 'open' && invoice.status !== 'draft') {
    throw new Error('invalid-invoice')
  }
  invoice.totalFormatted = dashboard.Format.money(invoice.total, invoice.currency)
  invoice.createdFormatted = dashboard.Format.date(invoice.created)
  invoice.lines.data[invoice.lines.data.length - 1].period.startFormatted = dashboard.Format.date(invoice.lines.data[invoice.lines.data.length - 1].period.start)
  invoice.lines.data[invoice.lines.data.length - 1].period.endFormatted = dashboard.Format.date(invoice.lines.data[invoice.lines.data.length - 1].period.end)
  req.data = { invoice }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, req.data.invoice, 'invoice', req.language)
  navbar.setup(doc, req.data.invoice)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc.toString())
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.SetInvoiceUncollectible.patch(req)
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
