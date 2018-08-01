const dashboard = require('@userappstore/dashboard')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.customerid = req.customer.id
  const total = await global.api.user.subscriptions.SubscriptionsCount.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
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
  req.data = {subscriptions, total, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.subscriptions && req.data.subscriptions.length) {
    dashboard.HTML.renderTable(doc, req.data.subscriptions, 'subscription-row', 'subscriptions-table')
    for (const subscription of req.data.subscriptions) {
      for (const status of statuses) {
        if (subscription.status === status) {
          continue
        }
        const element = doc.getElementById(`${status}-subscription-${subscription.id}`)
        element.parentNode.removeChild(element)
      }
      if (subscription.status === 'active') {
        if (subscription.cancel_at_period_end) {
          const element = doc.getElementById(`active-subscription-${subscription.id}`)
          element.parentNode.removeChild(element)
          const element2 = doc.getElementById(`change-plan-link-${subscription.id}`)
          element2.parentNode.removeChild(element2)
          const element3 = doc.getElementById(`cancel-subscription-link-${subscription.id}`)
          element3.parentNode.removeChild(element3)
        }
      }
    }
    if (req.data.total <= global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
  } else {
    const subscriptionsTable = doc.getElementById('subscriptions-table')
    subscriptionsTable.parentNode.removeChild(subscriptionsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
