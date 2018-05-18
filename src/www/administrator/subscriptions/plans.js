module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const plans = await global.api.administrator.subscriptions.Plans.get(req)
  if (plans && plans.length) {
    for (const plan of plans) {
      plan.created = plan.created.getTime ? plan.created : global.dashboard.Timestamp.date(plan.created)
      plan.createdRelative = global.dashboard.Format.relativePastDate(plan.created)
      plan.trialFormatted = plan.trial_period_days || 0
      plan.priceFormatted = plan.currency === 'usd' ? '$' + (plan.amount / 100) : plan.amount
    }
  }
  req.data = {plans}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  if (req.data.plans && req.data.plans.length) {
    doc.renderTable(req.data.plans, 'plan-row-template', 'plans-table')
    for (const plan of req.data.plans) {
      if (plan.metadata.unpublished) {
        doc.removeElementsById([`draft-plan-${plan.id}`, `published-plan-${plan.id}`, `publish-plan-${plan.id}`, `unpublish-plan-${plan.id}`])
      } else if (plan.metadata.published) {
        doc.removeElementsById([`draft-plan-${plan.id}`, `unpublished-plan-${plan.id}`, `publish-plan-${plan.id}`])
      } else {
        doc.removeElementsById([`published-plan-${plan.id}`, `unpublished-plan-${plan.id}`, `unpublish-plan-${plan.id}`])
      }
    }
  } else {
    doc.removeElementById('plans-table')
  }
  return global.dashboard.Response.end(req, res, doc)
}
