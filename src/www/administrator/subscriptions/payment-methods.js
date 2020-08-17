const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.PaymentMethodsCount.get(req)
  const paymentMethods = await global.api.administrator.subscriptions.PaymentMethods.get(req)
  if (paymentMethods && paymentMethods.length) {
    for (const paymentMethod of paymentMethods) {
      paymentMethod.createdFormatted = dashboard.Format.date(paymentMethod.created)
      paymentMethod.amountFormatted = dashboard.Format.money(paymentMethod.amount, paymentMethod.currency)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { paymentMethods, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, null, null, req.language)
  if (req.data.paymentMethods && req.data.paymentMethods.length) {
    dashboard.HTML.renderTable(doc, req.data.paymentMethods, 'payment-method-row', 'payment-methods-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noPayouts = doc.getElementById('no-payment-methods')
    noPayouts.parentNode.removeChild(noPayouts)
  } else {
    const paymentMethodsTable = doc.getElementById('payment-methods-table')
    paymentMethodsTable.parentNode.removeChild(paymentMethodsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
