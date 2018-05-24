const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.planid) {
    throw new Error('invalid-planid')
  }
  const plan = await global.api.user.subscriptions.Plan.get(req)
  if (!plan.metadata.published || plan.metadata.unpublished) {
    throw new Error('invalid-plan')
  }
  req.data = {plan}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  doc.renderTemplate(req.data.plan, 'plan-row-template', 'plans-table')
  return dashboard.Response.end(req, res, doc)
}
