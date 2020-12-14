const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-invoice.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.invoiceid) {
    throw new Error('invalid-invoiceid')
  }
  const invoice = await global.api.user.subscriptions.Invoice.get(req)
  invoice.totalFormatted = dashboard.Format.money(invoice.total || 0, invoice.currency)
  invoice.createdFormatted = dashboard.Format.date(invoice.created)
  invoice.discountFormatted = dashboard.Format.money(invoice.discount || 0, invoice.currency)
  for (const line of invoice.lines.data) {
    line.totalFormatted = dashboard.Format.money(line.amount, line.currency)
    line.startFormatted = dashboard.Format.date(dashboard.Timestamp.date(line.period.start))
    line.endFormatted = dashboard.Format.date(dashboard.Timestamp.date(line.period.end))
    line.description = line.description || line.plan.id
  }
  let charge
  if (invoice.charge) {
    req.query.chargeid = invoice.charge
    // the invoice.charge may refer to a brand new charge
    // that has not been delivered by webhook yet
    try {
      charge = await global.api.user.subscriptions.Charge.get(req)
      charge.dateFormatted = dashboard.Format.date(charge.created)
      charge.amountFormatted = dashboard.Format.money(charge.amount, charge.currency)
    } catch (error) {
    }
  }
  let refunds
  if (invoice.subscription) {
    req.query.accountid = req.account.accountid
    req.query.subscriptionid = invoice.subscription
    refunds = await global.api.user.subscriptions.Refunds.get(req)
    if (refunds && refunds.length) {
      for (const refund of refunds) {
        refund.createdFormatted = dashboard.Format.date(refund.created)
        refund.amountFormatted = dashboard.Format.money(refund.amount || 0, refund.currency)
        refund.source = charge.source
      }
    }
  }
  req.data = { invoice, charge, refunds }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.invoice, 'invoice')
  await navbar.setup(doc, req.data.invoice)
  dashboard.HTML.renderTable(doc, req.data.invoice.lines.data, 'line_item-row', 'line_items-table')
  if (req.data.charge) {
    dashboard.HTML.renderTemplate(doc, req.data.charge, 'charge-row', 'charges-table')
  } else {
    const chargeContainer = doc.getElementById('charge-container')
    chargeContainer.parentNode.removeChild(chargeContainer)
  }
  if (req.data.refunds && req.data.refunds.length) {
    dashboard.HTML.renderTable(doc, req.data.refunds, 'refund-row', 'refunds-table')
  } else {
    const refundContainer = doc.getElementById('refund-container')
    refundContainer.parentNode.removeChild(refundContainer)
  }
  return dashboard.Response.end(req, res, doc)
}
