const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.SetupIntentsCount.get(req)
  const setupIntents = await global.api.administrator.subscriptions.SetupIntents.get(req)
  if (setupIntents && setupIntents.length) {
    for (const setupIntent of setupIntents) {
      setupIntent.createdFormatted = dashboard.Format.date(setupIntent.created)
    }
  }
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = { setupIntents, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html, null, null, req.language)
  if (req.data.setupIntents && req.data.setupIntents.length) {
    dashboard.HTML.renderTable(doc, req.data.setupIntents, 'setup-intent-row', 'setup-intents-table')
    for (const setupIntent of req.data.setupIntents) {
      dashboard.HTML.renderTemplate(doc, null, setupIntent.status, `${setupIntent.id}-status`)
    }
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noPayouts = doc.getElementById('no-setup-intents')
    noPayouts.parentNode.removeChild(noPayouts)
  } else {
    const setupIntentsTable = doc.getElementById('setup-intents-table')
    setupIntentsTable.parentNode.removeChild(setupIntentsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
