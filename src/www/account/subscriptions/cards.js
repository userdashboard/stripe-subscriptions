const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const cards = await global.api.user.subscriptions.Cards.get(req)
  req.data = {cards}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.cards && req.data.cards.length) {
    doc.renderTable(req.data.cards, 'card-row-template', 'cards-table')
  } else {
    doc.removeElementById('cards-table')
  }
  return dashboard.Response.end(req, res, doc)
}
