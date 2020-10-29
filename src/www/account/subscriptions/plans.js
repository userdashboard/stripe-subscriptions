const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.user.subscriptions.PublishedPlansCount.get(req)
  const plans = await global.api.user.subscriptions.PublishedPlans.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { plans, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HML.parse(req.html || req.route.html)
  if (req.data.plans && req.data.plans.length) {
    dashboard.HTML.renderTable(doc, req.data.plans, 'plan-row', 'plans-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noPlans = doc.getElementById('no-plans')
    noPlans.parentNode.removeChild(noPlans)
  } else {
    const plansTable = doc.getElementById('plans-table')
    plansTable.parentNode.removeChild(plansTable)
  }
  return dashboard.Response.end(req, res, doc)
}
