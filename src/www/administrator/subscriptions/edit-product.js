const dashboard = require('@userdashboard/dashboard')
const navbar = require('./navbar-product.js')

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
  if (product.metadata.unpublished) {
    throw new Error('invalid-product')
  }
  req.data = { product }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, req.data.product, 'product', req.language)
  navbar.setup(doc, req.data.product)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  const nameField = doc.getElementById('name')
  nameField.setAttribute('value', req.body ? (req.body.name || '').split("'").join('&quot;') : req.data.product.name)
  const statementDescriptorField = doc.getElementById('statement_descriptor')
  statementDescriptorField.setAttribute('value', req.body ? (req.body.statement_descriptor || '').split("'").join('&quot;') : req.data.product.statement_descriptor)
  const unitLabelField = doc.getElementById('unit_label')
  unitLabelField.setAttribute('value', req.body ? (req.body.unit_label || '').split("'").join('&quot;') : req.data.product.unit_label)
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (req.query && req.query.message === 'success') {
    return renderPage(req, res)
  }
  if (!req.body.name || !req.body.name.length) {
    return renderPage(req, res, 'invalid-name')
  }
  if (global.minimumProductNameLength < req.body.name ||
    global.maximumProductNameLength > req.body.name) {
    return renderPage(req, res, 'invalid-product-name-length')
  }
  if (!req.body.statement_descriptor || !req.body.statement_descriptor.length) {
    return renderPage(req, res, 'invalid-statement_descriptor')
  }
  if (!req.body.unit_label || !req.body.unit_label.length) {
    return renderPage(req, res, 'invalid-unit_label')
  }
  try {
    await global.api.administrator.subscriptions.UpdateProduct.patch(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?productid=${req.query.productid}&message=success`
    })
    return res.end()
  }
}
