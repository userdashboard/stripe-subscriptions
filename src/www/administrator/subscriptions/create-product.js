
module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (req.session.lockURL === req.url && req.session.unlocked >= global.dashboard.Timestamp.now) {
    await global.api.administrator.subscriptions.CreateProduct.post(req)
  }
}

function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = global.dashboard.HTML.parse(req.route.html)
  if (messageTemplate) {
    doc.renderTemplate(null, messageTemplate, 'messageContainer')
    if (messageTemplate === 'success') {
      doc.removeElementById('submitForm')
      return global.dashboard.Response.end(req, res, doc)
    }
  }
  req.body = req.body || {}
  const nameField = doc.getElementById('name')
  nameField.setAttribute('value', req.body.name || '')
  const statementDescriptorField = doc.getElementById('statement_descriptor')
  statementDescriptorField.setAttribute('value', req.body.statement_descriptor || '0')
  const unitLabelField = doc.getElementById('unit_label')
  unitLabelField.setAttribute('value', req.body.unit_label || '')
  return global.dashboard.Response.end(req, res, doc)
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
    await global.api.administrator.subscriptions.CreateProduct.post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return global.dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
