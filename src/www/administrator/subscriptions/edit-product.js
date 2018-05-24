const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

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
  req.data = {product}
  if (req.session.lockURL === req.url && req.session.unlocked >= dashboard.Timestamp.now) {
    await global.api.administrator.subscriptions.UpdateProduct.patch(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'messageContainer')
  }
  const nameField = doc.getElementById('name')
  nameField.setAttribute('value', req.body ? req.body.name || '' : req.data.product.name)
  const statementDescriptorField = doc.getElementById('statement_descriptor')
  statementDescriptorField.setAttribute('value', req.body ? req.body.statement_descriptor || '' : req.data.product.statement_descriptor)
  const unitLabelField = doc.getElementById('unit_label')
  unitLabelField.setAttribute('value', req.body ? req.body.unit_label || '' : req.data.product.unit_label)
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (!req.body.name || !req.body.name.length) {
    return renderPage(req, res, 'invalid-name')
  }
  if (global.MINIMUM_PRODUCT_NAME_LENGTH < req.body.name ||
    global.MAXIMUM_PRODUCT_NAME_LENGTH > req.body.name) {
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
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
