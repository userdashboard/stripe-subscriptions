const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.user.subscriptions.CardsCount.get(req)
  const cards = await global.api.user.subscriptions.Cards.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = {cards, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.cards && req.data.cards.length) {
    doc.renderTable(req.data.cards, 'card-row-template', 'cards-table')
    if (req.data.count < global.PAGE_SIZE) {
      doc.removeElementById('page-links')
    } else {
      doc.renderPagination(req.data.offset, req.data.count)
    }
  } else {
    doc.removeElementById('cards-table')
  }
  return dashboard.Response.end(req, res, doc)
}
