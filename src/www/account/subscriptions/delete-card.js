const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.cardid) {
    throw new Error('invalid-cardid')
  }
  if (req.session.lockURL === req.url && req.session.unlocked) {
    await global.api.user.subscriptions.DeleteCard.delete(req)
    if (req.success) {
      return
    }
  }
  const card = await global.api.user.subscriptions.Card.get(req)
  if (card.id === req.customer.default_source) {
    throw new Error('invalid-card')
  }
  req.data = {card}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.card, 'card')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      dashboard.HTML.renderTemplate(doc, null, 'success', 'message-container')
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.body.cardid === req.customer.default_source) {
    return renderPage(req, res, 'invalid-card')
  }
  try {
    await global.api.user.subscriptions.DeleteCard.delete(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
