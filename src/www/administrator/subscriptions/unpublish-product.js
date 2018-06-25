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
  if (req.session.lockURL === req.url && req.session.unlocked) {
    await global.api.administrator.subscriptions.SetProductUnpublished.patch(req)
  }
  const product = await global.api.administrator.subscriptions.Product.get(req)
  if (!product.metadata.published || product.metadata.unpublished) {
    throw new Error('invalid-product')
  }
  req.data = {product}
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.product, 'product')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
    }
  }
  return dashboard.Response.end(req, res, doc.toString())
}

async function submitForm (req, res) {
  try {
    await global.api.administrator.subscriptions.SetProductUnpublished.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
