const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.user.subscriptions.PublishedPlansCount.get(req)
  const plans = await global.api.user.subscriptions.PublishedPlans.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = {plans, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.plans && req.data.plans.length) {
    dashboard.HTML.renderTable(doc, req.data.plans, 'plan-row', 'plans-table')
    if (req.data.count < global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.count)
    }
  } else {
    const plansTable = doc.getElementById('plans-table')
    plansTable.parentNode.removeChild(plansTable)
  }
  return dashboard.Response.end(req, res, doc)
}
