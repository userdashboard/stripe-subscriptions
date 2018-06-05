const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.customerid) {
    throw new Error('invalid-customerid')
  }
  const customer = await global.api.administrator.subscriptions.Customer.get(req)
  customer.created = dashboard.Timestamp.date(customer.created)
  customer.account_balance = customer.account_balance || 0
  customer.accountBalanceFormatted = customer.account_balance < 0 ? dashboard.Format.money(-customer.account_balance, customer.currency) : ''
  customer.numSubscriptions = customer.subscriptions.data.length
  customer.email = customer.email || ''
  customer.discount = customer.discount || ''
  customer.delinquentFormatted = customer.delinquent ? 'Yes' : 'No'
  req.data = {customer}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  doc.renderTemplate(req.data.customer, 'customer-row-template', 'customers-table')
  return dashboard.Response.end(req, res, doc)
}
