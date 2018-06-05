const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']
const intervals = ['day', 'week', 'month', 'year']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
  if (subscriptions && subscriptions.length) {
    for (const subscription of subscriptions) {
      subscription.plan_name = subscription.plan.name
      subscription.currency = subscription.plan.currency.toUpperCase()
      subscription.interval = subscription.plan.interval
      subscription.interval_count = subscription.plan.interval_count
      subscription.created = dashboard.Timestamp.date(subscription.start)
      subscription.priceFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
      if (subscription.status === 'trial') {
        subscription.trial_end = dashboard.Timestamp.date(subscription.trial_end)
      }
      if (!subscription.plan.amount || subscription.status !== 'active') {
        subscription.nextCharge = ''
      } else {
        subscription.nextCharge = dashboard.Timestamp.date(subscription.current_period_end)
      }
    }
  }
  req.data = {subscriptions}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.subscriptions && req.data.subscriptions.length) {
    doc.renderTable(req.data.subscriptions, 'subscription-row-template', 'subscriptions-table')
    const removeElements = []
    for (const subscription of req.data.subscriptions) {
      for (const status of statuses) {
        if (subscription.status === status) {
          continue
        }
        removeElements.push(`${status}-subscription-${subscription.id}`)
      }
      if (subscription.status === 'active') {
        if (subscription.cancel_at_period_end) {
          removeElements.push(`active-subscription-${subscription.id}`, `change-plan-link-${subscription.id}`, `cancel-subscription-link-${subscription.id}`)
        } else {
          removeElements.push(`canceling-subscription-${subscription.id}`)
        }
      }
      for (const interval of intervals) {
        if (interval !== subscription.plan.interval) {
          removeElements.push(`${interval}-singular-interval-${subscription.id}`, `${interval}-multiple-${subscription.id}`)
        }
        if (subscription.plan.interval_count === 1) {
          removeElements.push(`${interval}-multiple-interval-${subscription.id}`)
        } else {
          removeElements.push(`${interval}-singular-interval-${subscription.id}`)
        }
      }
    }
    doc.removeElementsById(removeElements)
  } else {
    doc.removeElementById('subscriptions-table')
  }
  return dashboard.Response.end(req, res, doc)
}
