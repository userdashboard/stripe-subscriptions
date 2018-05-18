const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const plans = await global.api.user.subscriptions.Plans.get(req)
  req.data = {plans}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.plans && req.data.plans.length) {
    doc.renderTable(req.data.plans, 'plan-row-template', 'plans-table')
  } else {
    doc.removeElementById('plans-table')
  }
  return global.dashboard.Response.end(req, res, doc)
}
