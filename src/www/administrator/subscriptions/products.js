const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const count = await global.api.administrator.subscriptions.ProductsCount.get(req)
  const products = await global.api.administrator.subscriptions.Products.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  req.data = {products, count, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.products && req.data.products.length) {
    dashboard.HTML.renderTable(doc, req.data.products, 'product-row', 'products-table')
    if (req.data.count < global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.count)
    }
  } else {
    const productsTable = doc.getElementById('products-table')
    productsTable.parentNode.removeChild(productsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
