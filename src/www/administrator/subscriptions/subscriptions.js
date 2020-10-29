const dashboard = require('@userdashboard/dashboard')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.SubscriptionsCount.get(req)
  const subscriptions = await global.api.administrator.subscriptions.Subscriptions.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
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
  req.data = { subscriptions, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HML.parse(req.html || req.route.html)
  const removeElements = []
  if (req.data.subscriptions && req.data.subscriptions.length) {
    dashboard.HTML.renderTable(doc, req.data.subscriptions, 'subscription-row', 'subscriptions-table')
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
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    removeElements.push('no-subscriptions')
  } else {
    removeElements.push('subscriptions-table')
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
