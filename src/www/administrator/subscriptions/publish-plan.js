const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.planid) {
    throw new Error('invalid-planid')
  }
  const plan = await global.api.administrator.subscriptions.Plan.get(req)
  if (plan.metadata.published) {
    throw new Error('invalid-plan')
  }
  req.data = {plan}
  if (req.session.lockURL === req.url && req.session.unlocked >= dashboard.Timestamp.now) {
    await global.api.administrator.subscriptions.SetPlanPublished.patch(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  doc.renderTemplate(req.data.plan, 'plan-row-template', 'plans-table')
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      doc.removeElementById('submit-form')
    }
  }
  return dashboard.Response.end(req, res, doc.toString())
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.SetPlanPublished.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
