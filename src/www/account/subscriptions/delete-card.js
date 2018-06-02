const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.cardid) {
    throw new Error('invalid-cardid')
  }
  const card = await global.api.user.subscriptions.Card.get(req)
  if (card.id === req.customer.default_source) {
    throw new Error('invalid-card')
  }
  req.data = {card}
  if (req.session.lockURL === req.url && req.session.unlocked >= dashboard.Timestamp.now) {
    await global.api.user.subscriptions.DeleteCard.delete(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      doc.renderTemplate(null, 'success', 'message-container')
      doc.removeElementById('submit-form')
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
