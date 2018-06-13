const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.user.subscriptions.PlansCount.get(req)
  const plans = await global.api.user.subscriptions.Plans.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = {plans, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.plans && req.data.plans.length) {
    doc.renderTable(req.data.plans, 'plan-row-template', 'plans-table')
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
