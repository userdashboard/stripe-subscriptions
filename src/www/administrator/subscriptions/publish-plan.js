const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-plan.js')

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
  if (req.query.message === 'success') {
    req.data = {
      plan
    }
    return
  }
  if (plan.metadata.published) {
    throw new Error('invalid-plan')
  }
  req.data = { plan }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.route.html, req.data.plan, 'plan', req.language)
  navbar.setup(doc, req.data.plan)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc.toString())
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.SetPlanPublished.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?planid=${req.query.planid}&message=success`
    })
    return res.end()
  }
}
