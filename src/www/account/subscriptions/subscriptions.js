const dashboard = require('@userdashboard/dashboard')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'canceling']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.subscriptions.SubscriptionsCount.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
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
      subscription.priceFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
      if (subscription.status === 'trialing') {
        subscription.trial_endFormatted = dashboard.Format.date(subscription.trial_end)
      }
      if (!subscription.plan.amount || subscription.status !== 'active') {
        subscription.nextChargeFormatted = ''
      } else {
        subscription.nextChargeFormatted = dashboard.Format.date(subscription.current_period_end)
      }
    }
  }
  req.data = { subscriptions, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
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
    }
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noSubscriptions = doc.getElementById('no-subscriptions')
    noSubscriptions.parentNode.removeChild(noSubscriptions)
  } else {
    const subscriptionsTable = doc.getElementById('subscriptions-table')
    subscriptionsTable.parentNode.removeChild(subscriptionsTable)
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    if (!element || !element.parentNode) {
      continue
    }
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
