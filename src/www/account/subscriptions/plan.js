const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.planid) {
    throw new Error('invalid-planid')
  }
  const plan = await global.api.user.subscriptions.PublishedPlan.get(req)
  if (!plan.metadata.published || plan.metadata.unpublished) {
    throw new Error('invalid-plan')
  }
  req.data = { plan }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.plan, 'plan')
  return dashboard.Response.end(req, res, doc)
}
