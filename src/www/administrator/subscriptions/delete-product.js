const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.productid) {
    throw new Error('invalid-productid')
  }
  const product = await global.api.administrator.subscriptions.Product.get(req)
  if (req.session.lockURL === req.url && req.session.unlocked >= dashboard.Timestamp.now) {
    await global.api.administrator.subscriptions.DeleteProduct.delete(req)
  }
  req.data = {product}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'messageContainer')
    if (messageTemplate === 'success') {
      doc.removeElementById('submitForm')
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (req.data.product.deleted) {
    return renderPage(req, res, 'success')
  }
  try {
    await global.api.administrator.subscriptions.DeleteProduct.delete(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
