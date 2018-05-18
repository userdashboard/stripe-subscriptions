module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const subscriptions = await global.api.administrator.subscriptions.Subscriptions.get(req)
  if (subscriptions && subscriptions.length) {
    for (const subscription of subscriptions) {
      if (subscription.plan && subscription.plan.id) {
        subscription.plan = subscription.plan.id
      }
      subscription.created = subscription.created.getTime ? subscription.created : global.dashboard.Timestamp.date(subscription.created)
      subscription.createdRelative = global.dashboard.Format.relativePastDate(subscription.created)
      subscription.currentPeriodStart = global.dashboard.Timestamp.date(subscription.current_period_start)
      subscription.currentPeriodStartFormatted = global.dashboard.Format.date(subscription.currentPeriodStart)
      subscription.currentPeriodEnd = global.dashboard.Timestamp.date(subscription.current_period_end)
      subscription.currentPeriodEndFormatted = global.dashboard.Format.date(subscription.currentPeriodEnd)
    }
  }
  req.data = {subscriptions}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  if (req.data.subscriptions && req.data.subscriptions.length) {
    doc.renderTable(req.data.subscriptions, 'subscription-row-template', 'subscriptions-table')
  } else {
    doc.removeElementById('subscriptions-table')
  }
  return global.dashboard.Response.end(req, res, doc)
}
