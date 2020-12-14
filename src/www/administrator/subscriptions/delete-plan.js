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
  if (req.query.message === 'success') {
    req.data = {
      plan: {
        id: req.query.planid,
        object: 'plan',
        metadata: {
          unpublished: true
        }
      }
    }
    return
  }
  const plan = await global.api.administrator.subscriptions.Plan.get(req)
  req.data = { plan }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.plan, 'plan')
  navbar.setup(doc, req.data.plan)

  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.DeletePlan.delete(req)
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
