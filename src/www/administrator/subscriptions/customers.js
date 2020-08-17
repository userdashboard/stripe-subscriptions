const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.CustomersCount.get(req)
  const customers = await global.api.administrator.subscriptions.Customers.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (customers && customers.length) {
    for (const customer of customers) {
      customer.createdFormatted = dashboard.Format.date(customer.created)
      customer.account_balance = customer.account_balance || 0
      customer.accountBalanceFormatted = customer.account_balance < 0 ? dashboard.Format.money(-customer.account_balance, customer.currency) : ''
      customer.numSubscriptions = customer.subscriptions.data.length
      customer.email = customer.email || ''
      customer.discount = customer.discount || ''
      customer.delinquentFormatted = customer.delinquent ? 'Yes' : 'No'
    }
  }
  req.data = { customers, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, null, null, req.language)
  if (req.data.customers && req.data.customers.length) {
    dashboard.HTML.renderTable(doc, req.data.customers, 'customer-row', 'customers-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noCustomers = doc.getElementById('no-customers')
    noCustomers.parentNode.removeChild(noCustomers)
  } else {
    const customersTable = doc.getElementById('customers-table')
    customersTable.parentNode.removeChild(customersTable)
  }
  return dashboard.Response.end(req, res, doc)
}
