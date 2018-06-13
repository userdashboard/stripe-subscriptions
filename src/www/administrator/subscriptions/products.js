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
    doc.renderTable(req.data.products, 'product-row-template', 'products-table')
    if (req.data.count < global.PAGE_SIZE) {
      doc.removeElementById('page-links')
    } else {
      doc.renderPagination(req.data.offset, req.data.count)
    }
  } else {
    doc.removeElementById('products-table')
  }
  return dashboard.Response.end(req, res, doc)
}
