module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.productid) {
    throw new Error('invalid-productid')
  }
  const product = await global.api.administrator.subscriptions.Product.get(req)
  req.data = {product}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  doc.renderTemplate(req.data.product, 'product-row-template', 'products-table')
  return global.dashboard.Response.end(req, res, doc)
}
