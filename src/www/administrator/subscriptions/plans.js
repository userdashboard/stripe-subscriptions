const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.administrator.subscriptions.PlansCount.get(req)
  const plans = await global.api.administrator.subscriptions.Plans.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (plans && plans.length) {
    for (const plan of plans) {
      plan.created = plan.created.getTime ? plan.created : dashboard.Timestamp.date(plan.created)
      plan.trialFormatted = plan.trial_period_days || 0
      plan.priceFormatted = plan.currency === 'usd' ? '$' + (plan.amount / 100) : plan.amount
    }
  }
  req.data = {plans, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.plans && req.data.plans.length) {
    doc.renderTable(req.data.plans, 'plan-row-template', 'plans-table')
    for (const plan of req.data.plans) {
      if (plan.metadata.unpublished) {
        doc.removeElementsById([`draft-plan-${plan.id}`, `published-plan-${plan.id}`, `set-plan-published-${plan.id}`, `set-plan-unpublished-${plan.id}`])
      } else if (plan.metadata.published) {
        doc.removeElementsById([`draft-plan-${plan.id}`, `unpublished-plan-${plan.id}`, `set-plan-published-${plan.id}`])
      } else {
        doc.removeElementsById([`published-plan-${plan.id}`, `unpublished-plan-${plan.id}`, `set-plan-unpublished-${plan.id}`])
      }
    }
    if (req.data.count < global.PAGE_SIZE) {
      doc.removeElementById('page-links')
    } else {
      doc.renderPagination(req.data.offset, req.data.count)
    }
  } else {
    doc.removeElementById('plans-table')
  }
  return dashboard.Response.end(req, res, doc)
}
