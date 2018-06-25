const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.administrator.subscriptions.CustomersCount.get(req)
  const customers = await global.api.administrator.subscriptions.Customers.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (customers && customers.length) {
    for (const customer of customers) {
      customer.created = dashboard.Timestamp.date(customer.created)
      customer.account_balance = customer.account_balance || 0
      customer.accountBalanceFormatted = customer.account_balance < 0 ? dashboard.Format.money(-customer.account_balance, customer.currency) : ''
      customer.numSubscriptions = customer.subscriptions.data.length
      customer.email = customer.email || ''
      customer.discount = customer.discount || ''
      customer.delinquentFormatted = customer.delinquent ? 'Yes' : 'No'
    }
  }
  req.data = {customers, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.customers && req.data.customers.length) {
    dashboard.HTML.renderTable(doc, req.data.customers, 'customer-row', 'customers-table')
    if (req.data.count < global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.count)
    }
  } else {
    const customersTable = doc.getElementById('customers-table')
    customersTable.parentNode.removeChild(customersTable)
  }
  return dashboard.Response.end(req, res, doc)
}
