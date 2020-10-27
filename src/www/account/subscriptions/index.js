const dashboard = require('@userdashboard/dashboard')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']
const intervals = ['day', 'week', 'month', 'year']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const customers = await global.api.user.subscriptions.Customers.get(req)
  if (customers && customers.length) {
    for (const customer of customers) {
      customer.createdFormatted = dashboard.Format.date(customer.created)
      if (!customer.sources.data.length) {
        customer.sources.data.push({
          brand: '-',
          last4: '',
          exp_year: '',
          exp_month: ''
        })
      }
    }
  }
  delete (req.query.customerid)
  const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
  if (subscriptions && subscriptions.length) {
    for (const subscription of subscriptions) {
      subscription.createdFormatted = dashboard.Format.date(subscription.created)
      if (subscription.current_period_start) {
        subscription.current_period_startFormatted = dashboard.Format.date(subscription.current_period_start)
      }
      if (subscription.current_period_end) {
        subscription.current_period_endFormatted = dashboard.Format.date(subscription.current_period_end)
      }
      subscription.plan.amountFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
      if (subscription.status === 'trial') {
        subscription.trial_end = dashboard.Timestamp.date(subscription.trial_end)
      }
      if (!subscription.plan.amount || subscription.status !== 'active' || subscription.cancel_at_period_end) {
        subscription.nextChargeFormatted = '-'
      } else {
        subscription.nextChargeFormatted = dashboard.Format.date(subscription.current_period_end)
      }
    }
  }
  delete (req.query.subscriptionid)
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = dashboard.Format.money(invoice.total || 0, invoice.currency)
      invoice.createdFormatted = dashboard.Format.date(invoice.created)
    }
  }
  req.data = { customers, subscriptions, invoices }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, null, null, req.language)
  let allFree = true
  const removeElements = []
  if (req.data.subscriptions && req.data.subscriptions.length) {
    dashboard.HTML.renderTable(doc, req.data.subscriptions, 'subscription-row', 'subscriptions-table')
    for (const subscription of req.data.subscriptions) {
      allFree = allFree || subscription.plan.amount > 0
      for (const status of statuses) {
        if (subscription.status === status) {
          continue
        }
        removeElements.push(`${status}-subscription-${subscription.id}`)
      }
      if (subscription.status === 'active') {
        if (subscription.cancel_at_period_end) {
          removeElements.push(`active-subscription-${subscription.id}`)
        } else {
          removeElements.push(`canceling-subscription-${subscription.id}`)
        }
      } else if (subscription.status === 'canceled') {
        removeElements.push(`canceling-subscription-${subscription.id}`)
      }
      for (const interval of intervals) {
        if (interval !== subscription.plan.interval) {
          removeElements.push(`${interval}-multiple-interval-${subscription.id}`, `${interval}-singular-interval-${subscription.id}`)
        } else {
          if (subscription.quantity < 2) {
            removeElements.push(`${interval}-multiple-interval-${subscription.id}`)
          } else {
            removeElements.push(`${interval}-singular-interval-${subscription.id}`)
          }
        }
      }
    }
    removeElements.push('no-subscriptions')
  } else {
    removeElements.push('subscriptions-table')
  }
  if (req.data.invoices && req.data.invoices.length) {
    dashboard.HTML.renderTable(doc, req.data.invoices, 'invoice-row', 'invoices-table')
    for (const invoice of req.data.invoices) {
      if (invoice.status === 'open') {
        const paid = doc.getElementById(`paid-${invoice.id}`)
        paid.parentNode.removeChild(paid)
      } else {
        const open = doc.getElementById(`open-${invoice.id}`)
        open.parentNode.removeChild(open)
      }
    }
    removeElements.push('no-invoices')
  } else {
    removeElements.push('invoices-table')
  }
  if (req.data.customers && req.data.customers.length) {
    dashboard.HTML.renderTable(doc, req.data.customers, 'customer-row', 'customers-table')
    removeElements.push('no-customers')
  } else {
    removeElements.push('customers-table')
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
