const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-subscription.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  const subscription = await global.api.user.subscriptions.Subscription.get(req)
  if (subscription.status === 'canceled') {
    throw new Error('invalid-subscription')
  }
  subscription.createdFormatted = dashboard.Format.date(subscription.created)
  if (subscription.current_period_start) {
    subscription.current_period_startFormatted = dashboard.Format.date(subscription.current_period_start)
  }
  if (subscription.current_period_end) {
    subscription.current_period_endFormatted = dashboard.Format.date(subscription.current_period_end)
  }
  subscription.amountFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
  if (subscription.status === 'trial') {
    subscription.trial_endFormatted = dashboard.Format.date(subscription.trial_end)
  }
  if (!subscription.plan.amount || (subscription.status !== 'trialing' && subscription.status !== 'active') || subscription.cancel_at_period_end) {
    subscription.nextCharge = '-'
  } else {
    subscription.nextCharge = dashboard.Timestamp.date(subscription.current_period_end)
  }
  req.query.accountid = req.account.accountid
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = dashboard.Format.money(invoice.total || 0, invoice.currency)
      invoice.createdFormatted = dashboard.Format.date(invoice.created)
    }
  }
  req.data = { subscription, invoices }
}

async function renderPage (req, res) {
  const removeElements = []
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.subscription, 'subscription')
  navbar.setup(doc, req.data.subscription)
  if (req.data.subscription.status === 'trialing') {
    removeElements.push(`canceled-subscription-${req.data.subscription.id}`, `past_due-subscription-${req.data.subscription.id}`, `unpaid-subscription-${req.data.subscription.id}`, `canceling-subscription-${req.data.subscription.id}`, `active-subscription-${req.data.subscription.id}`)
  } else if (req.data.subscription.status === 'active') {
    removeElements.push(`canceled-subscription-${req.data.subscription.id}`, `past_due-subscription-${req.data.subscription.id}`, `unpaid-subscription-${req.data.subscription.id}`, `trial-subscription-${req.data.subscription.id}`)
    if (req.data.subscription.cancel_at_period_end) {
      removeElements.push(`active-subscription-${req.data.subscription.id}`, `change-plan-link-${req.data.subscription.id}`, `cancel-subscription-link-${req.data.subscription.id}`)
    } else {
      removeElements.push(`canceling-subscription-${req.data.subscription.id}`)
    }
  } else {
    removeElements.push(`active-subscription-${req.data.subscription.id}`, `trial-subscription-${req.data.subscription.id}`, `canceling-subscription-${req.data.subscription.id}`, `change-plan-link-${req.data.subscription.id}`)
    if (req.data.subscription.status === 'past_due') {
      removeElements.push(`canceled-subscription-${req.data.subscription.id}`, `unpaid-subscription-${req.data.subscription.id}`)
    } else if (req.data.subscription.status === 'canceled') {
      removeElements.push(`past_due-subscription-${req.data.subscription.id}`, `unpaid-subscription-${req.data.subscription.id}`)
    } else if (req.data.subscription.status === 'unpaid') {
      removeElements.push(`canceled-subscription-${req.data.subscription.id}`, `past_due-subscription-${req.data.subscription.id}`)
    }
  }
  for (const interval of ['day', 'week', 'month', 'year']) {
    if (interval !== req.data.subscription.plan.interval) {
      removeElements.push(`${interval}-singular-interval-${req.data.subscription.id}`, `${interval}-multiple-interval-${req.data.subscription.id}`)
      continue
    }
    if (req.data.subscription.plan.interval_count === 1) {
      removeElements.push(`${interval}-multiple-interval-${req.data.subscription.id}`)
    } else {
      removeElements.push(`${interval}-singular-interval-${req.data.subscription.id}`)
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    if (!element || !element.parentNode) {
      continue
    }
    element.parentNode.removeChild(element)
  }
  if (req.data.invoices && req.data.invoices.length) {
    dashboard.HTML.renderTable(doc, req.data.invoices, 'invoice-row', 'invoices-table')
  } else {
    const invoicesContainer = doc.getElementById('invoices-container')
    invoicesContainer.parentNode.removeChild(invoicesContainer)
  }
  return dashboard.Response.end(req, res, doc)
}
