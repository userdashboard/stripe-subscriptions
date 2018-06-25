const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.cardid) {
    throw new Error('invalid-cardid')
  }
  const card = await global.api.user.subscriptions.Card.get(req)
  req.data = {card}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.card, 'card')
  return dashboard.Response.end(req, res, doc)
}
