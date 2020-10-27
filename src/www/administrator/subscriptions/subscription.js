const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-subscription.js')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  const subscription = await global.api.administrator.subscriptions.Subscription.get(req)
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
  subscription.discount = subscription.discount || { coupon: { id: '' } }
  req.data = { subscription }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.subscription, 'subscription', req.language)
  navbar.setup(doc, req.data.subscription)
  const removeElements = []
  if (req.data.subscription.cancel_at_period_end) {
    req.data.subscription.status = 'canceling'
  }
  for (const status of statuses) {
    if (req.data.subscription.status === status) {
      continue
    }
    removeElements.push(`${status}-subscription-${req.data.subscription.id}`)
  }
  if (req.data.subscription.status === 'active') {
    removeElements.push(`canceling-subscription-${req.data.subscription.id}`)
  } else {
    if (req.data.subscription.cancel_at_period_end) {
      removeElements.push(`change-plan-link-${req.data.subscription.id}`, `cancel-subscription-link-${req.data.subscription.id}`)
    } else {
      removeElements.push(`canceling-subscription-${req.data.subscription.id}`)
    }
  }
  for (const id of removeElements) {
    const element = doc.getElementById(id)
    if (!element) {
      continue
    }
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
