const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-customer.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.customerid) {
    throw new Error('invalid-customerid')
  }
  const customer = await global.api.administrator.subscriptions.Customer.get(req)
  customer.createdFormatted = dashboard.Format.date(customer.created)
  if (customer.account_balance) {
    customer.account_balanceFormatted = dashboard.Format.money(customer.account_balance, customer.currency)
  }
  if (customer.delinquent) {
    customer.delinquentFormatted = dashboard.Format.money(customer.delinquent, customer.currency)
  }
  if (!customer.discount || !customer.discount.coupon || !customer.discount.coupon.id) {
    customer.discount = { coupon: { id: '' } }
  }
  customer.email = customer.email || ''
  req.query.all = true
  const invoices = await global.api.administrator.subscriptions.Invoices.get(req)
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = dashboard.Format.money(invoice.total, invoice.currency)
      invoice.createdFormatted = dashboard.Format.date(invoice.created)
      invoice.lines.data[invoice.lines.data.length - 1].period.startFormatted = dashboard.Format.date(invoice.lines.data[invoice.lines.data.length - 1].period.start)
      invoice.lines.data[invoice.lines.data.length - 1].period.endFormatted = dashboard.Format.date(invoice.lines.data[invoice.lines.data.length - 1].period.end)
    }
  }
  const subscriptions = await global.api.administrator.subscriptions.Subscriptions.get(req)
  if (subscriptions && subscriptions.length) {
    for (const subscription of subscriptions) {
      subscription.createdFormatted = dashboard.Format.date(subscription.created)
      if (subscription.current_period_start) {
        subscription.current_period_startFormatted = dashboard.Format.date(subscription.current_period_start)
      }
      if (subscription.current_period_end) {
        subscription.current_period_endFormatted = dashboard.Format.date(subscription.current_period_end)
      }
      if (subscription.trial_end) {
        subscription.trial_endFormatted = dashboard.Format.date(subscription.trial_end)
      }
    }
  }
  req.query.accountid = req.account.accountid
  const account = await global.api.administrator.Account.get(req)
  customer.account = account
  req.data = { customer, invoices, subscriptions }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.customer, 'customer', req.language)
  navbar.setup(doc, req.data.customer)
  const removeElements = []
  if (!req.data.customer.delinquent) {
    removeElements.push('delinquent-amount')
  }
  if (!req.data.customer.discount || !req.data.customer.discount.coupon || !req.data.customer.discount.coupon.id) {
    removeElements.push('discount')
  }
  if (!req.data.customer.account_balance) {
    removeElements.push('account-balance')
  }
  if (req.data.invoices && req.data.invoices.length) {
    dashboard.HTML.renderTable(doc, req.data.invoices, 'invoice-row', 'invoices-table')
    for (const invoice of req.data.invoices) {
      if (invoice.status === 'open') {
        removeElements.push(`paid-${invoice.id}`)
      } else {
        removeElements.push(`open-${invoice.id}`)
      }
    }
  } else {
    removeElements.push('invoices-container')
  }
  if (req.data.subscriptions && req.data.subscriptions.length) {
    dashboard.HTML.renderTable(doc, req.data.subscriptions, 'subscription-row', 'subscriptions-table')
    const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']
    for (const subscription of req.data.subscriptions) {
      if (subscription.cancel_at_period_end) {
        subscription.status = 'canceling'
      }
      for (const status of statuses) {
        if (subscription.status === status) {
          continue
        }
        removeElements.push(`${status}-subscription-${subscription.id}`)
      }
      if (subscription.status === 'active') {
        removeElements.push(`canceling-subscription-${subscription.id}`)
      } else {
        if (!subscription.cancel_at_period_end) {
          removeElements.push(`canceling-subscription-${subscription.id}`)
        }
      }
    }
  } else {
    removeElements.push('subscriptions-container')
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
