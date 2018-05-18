module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.planid) {
    throw new Error('invalid-planid')
  }
  const plan = await global.api.administrator.subscriptions.Plan.get(req)
  plan.created = plan.created.getTime ? plan.created : global.dashboard.Timestamp.date(plan.created)
  plan.createdRelative = global.dashboard.Format.relativePastDate(plan.created)
  plan.trialFormatted = plan.trial_period_days || 0
  plan.priceFormatted = plan.currency === 'usd' ? '$' + (plan.amount / 100) : plan.amount
  req.data = {plan}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  doc.renderTemplate(req.data.plan, 'plan-row-template', 'plans-table')
  return global.dashboard.Response.end(req, res, doc)
}
