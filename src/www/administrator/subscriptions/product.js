const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-product.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.productid) {
    throw new Error('invalid-productid')
  }
  const product = await global.api.administrator.subscriptions.Product.get(req)
  req.data = { product }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.product, 'product', req.language)
  navbar.setup(doc, req.data.product)
  if (req.data.product.metadata.unpublished) {
    const published = doc.getElementById('published')
    published.parentNode.removeChild(published)
    const notPublished = doc.getElementById('not-published')
    notPublished.parentNode.removeChild(notPublished)
  } else if (req.data.product.metadata.published) {
    const unpublished = doc.getElementById('unpublished')
    unpublished.parentNode.removeChild(unpublished)
    const notPublished = doc.getElementById('not-published')
    notPublished.parentNode.removeChild(notPublished)
  } else {
    const published = doc.getElementById('published')
    published.parentNode.removeChild(published)
    const unpublished = doc.getElementById('unpublished')
    unpublished.parentNode.removeChild(unpublished)
  }
  return dashboard.Response.end(req, res, doc)
}
