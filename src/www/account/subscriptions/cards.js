const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.customerid = req.customer.id
  const total = await global.api.user.subscriptions.CardsCount.get(req)
  const cards = await global.api.user.subscriptions.Cards.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = {cards, total, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.cards && req.data.cards.length) {
    dashboard.HTML.renderTable(doc, req.data.cards, 'card-row', 'cards-table')
    if (req.data.count <= global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.count)
    }
  } else {
    const cardsTable = doc.getElementById('cards-table')
    cardsTable.parentNode.removeChild(cardsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
