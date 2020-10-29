const dashboard = require('@userdashboard/dashboard')

module.exports = {
  get: renderPage,
  post: submitForm
}

function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HML.parse(req.html || req.route.html)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  if (req.body) {
    const nameField = doc.getElementById('name')
    nameField.setAttribute('value', (req.body.name || '').split("'").join('&quot;'))
    const statementDescriptorField = doc.getElementById('statement_descriptor')
    statementDescriptorField.setAttribute('value', (req.body.statement_descriptor || '').split("'").join('&quot;'))
    const unitLabelField = doc.getElementById('unit_label')
    unitLabelField.setAttribute('value', (req.body.unit_label || '').split("'").join('&quot;'))
  }
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
  let product
  try {
    product = await global.api.administrator.subscriptions.CreateProduct.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query && req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `/administrator/subscriptions/product?productid=${product.id}`
    })
    return res.end()
  }
}
