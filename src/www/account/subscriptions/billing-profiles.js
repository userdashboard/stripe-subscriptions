const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.subscriptions.CustomersCount.get(req)
  const customers = await global.api.user.subscriptions.Customers.get(req)
  if (customers && customers.length) {
    for (const customer of customers) {
      customer.free = 0
      customer.paid = 0
      req.query.customerid = customer.id
      req.query.all = true
      const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
      if (!subscriptions || !subscriptions.length) {
        continue
      }
      for (const subscription of subscriptions) {
        if (subscription.plan.amount) {
          customer.paid++
        } else {
          customer.free++
        }
      }
    }
  }
  const offset = req.query.offset || 0
  req.data = { customers, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)

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
