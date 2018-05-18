module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const products = await global.api.administrator.subscriptions.Products.get(req)
  req.data = {products}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  if (req.data.products && req.data.products.length) {
    doc.renderTable(req.data.products, 'product-row-template', 'products-table')
  } else {
    doc.removeElementById('products-table')
  }
  return global.dashboard.Response.end(req, res, doc)
}
