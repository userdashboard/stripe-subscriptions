const dashboard = require('@userappstore/dashboard')

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
      if (subscription.plan && subscription.plan.id) {
        subscription.plan = subscription.plan.id
      }
      subscription.created = subscription.created.getTime ? subscription.created : dashboard.Timestamp.date(subscription.created)
      subscription.currentPeriodStart = dashboard.Timestamp.date(subscription.current_period_start)
      subscription.currentPeriodStartFormatted = dashboard.Format.date(subscription.currentPeriodStart)
      subscription.currentPeriodEnd = dashboard.Timestamp.date(subscription.current_period_end)
      subscription.currentPeriodEndFormatted = dashboard.Format.date(subscription.currentPeriodEnd)
    }
  }
  req.data = {subscriptions, total, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.subscriptions && req.data.subscriptions.length) {
    dashboard.HTML.renderTable(doc, req.data.subscriptions, 'subscription-row', 'subscriptions-table')
    if (req.data.count <= global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.count)
    }
  } else {
    const subscriptionsTable = doc.getElementById('subscriptions-table')
    subscriptionsTable.parentNode.removeChild(subscriptionsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
