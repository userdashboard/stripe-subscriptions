const dashboard = require('@userappstore/dashboard')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']
const intervals = ['day', 'week', 'month', 'year']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  const subscription = await global.api.user.subscriptions.Subscription.get(req)
  if (subscription.status === 'canceled' || subscription.customer !== req.customer.id) {
    throw new Error('invalid-subscription')
  }
  subscription.plan_name = subscription.plan.name
  subscription.currency = subscription.plan.currency.toUpperCase()
  subscription.interval = subscription.plan.interval
  subscription.interval_count = subscription.plan.interval_count
  subscription.created = dashboard.Timestamp.date(subscription.start)
  subscription.priceFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
  if (subscription.status === 'trial') {
    subscription.trial_end = dashboard.Timestamp.date(subscription.trial_end)
  }
  if (!subscription.plan.amount || subscription.status !== 'active' || subscription.cancel_at_period_end) {
    subscription.nextCharge = '-'
  } else {
    subscription.nextCharge = dashboard.Timestamp.date(subscription.current_period_end)
  }
  const invoiceList = await global.api.user.subscriptions.Invoices.get(req)
  const invoices = invoiceList.data
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = dashboard.Format.money(invoice.total || 0, invoice.currency)
      invoice.date = dashboard.Timestamp.date(invoice.date)
      invoice.period_start = dashboard.Timestamp.date(invoice.lines.data[0].period_start)
      invoice.period_end = dashboard.Timestamp.date(invoice.lines.data[0].period_end)
      invoice.plan_name = invoice.lines.data[0].plan.name
    }
  }
  req.data = {subscription, invoices}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.subscription, 'subscription')
  for (const status of statuses) {
    if (req.data.subscription.status === status) {
      continue
    }
    const element = doc.getElementById(`${status}-subscription-${req.data.subscription.id}`)
    element.parentNode.removeChild(element)
  }
  if (req.data.subscription.status === 'active') {
    if (req.data.subscription.cancel_at_period_end) {
      const element1 = doc.getElementById(`active-subscription-${req.data.subscription.id}`)
      element1.parentNode.removeChild(element1)
      const element2 = doc.getElementById(`change-plan-link-${req.data.subscription.id}`)
      element2.parentNode.removeChild(element2)
      const element3 = doc.getElementById(`cancel-subscription-link-${req.data.subscription.id}`)
      element3.parentNode.removeChild(element3)
    } else {
      const element = doc.getElementById(`canceling-subscription-${req.data.subscription.id}`)
      element.parentNode.removeChild(element)
    }
  }
  for (const interval of intervals) {
    if (interval !== req.data.subscription.plan.interval) {
      const element1 = doc.getElementById(`${interval}-singular-interval-${req.data.subscription.id}`)
      element1.parentNode.removeChild(element1)
      const element2 = doc.getElementById(`${interval}-multiple-${req.data.subscription.id}`)
      element2.parentNode.removeChild(element2)
    }
    if (req.data.subscription.plan.interval_count === 1) {
      const element = doc.getElementById(`${interval}-multiple-interval-${req.data.subscription.id}`)
      element.parentNode.removeChild(element)
    } else {
      const element = doc.getElementById(`${interval}-singular-interval-${req.data.subscription.id}`)
      element.parentNode.removeChild(element)
    }
  }
  if (req.data.invoices && req.data.invoices.length) {
    dashboard.HTML.renderTable(doc, req.data.invoices, 'invoice-row', 'invoices-table')
  } else {
    const invoicesContainer = doc.getElementById('invoices-container')
    invoicesContainer.parentNode.removeChild(invoicesContainer)
  }
  return dashboard.Response.end(req, res, doc)
}
