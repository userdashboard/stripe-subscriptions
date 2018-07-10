const dashboard = require('@userappstore/dashboard')
const countries = require('../../../../countries.json')
const countryDivisions = require('../../../../country-divisions.json')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (req.session.lockURL === req.url && req.session.unlocked) {
    req.query = {customerid: req.query.customerid}
    await global.api.user.subscriptions.CreateCard.post(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = dashboard.HTML.parse(req.route.html)
  dashboard.HTML.renderList(doc, countries, 'country-option-template', 'address_country')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, {}, messageTemplate, 'message-container')
  }
  let country
  if ((req.body && req.body.address_country) || req.country) {
    country = countryDivisions[req.body ? req.body.address_country : req.country.country.iso_code]
    const states = []
    for (const code in country.divisions) {
      states.push({code, name: country.divisions[code], object: 'state'})
    }
    if (!states || !states.length) {
      const stateContainer = doc.getElementById('state-container')
      stateContainer.parentNode.removeChild(stateContainer)
    } else {
      dashboard.HTML.renderList(doc, states, 'state-option-template', 'address_state')
    }
  }
  req.body = req.body || {}
  const numberField = doc.getElementById('number')
  numberField.setAttribute('value', req.body.number || '')
  const cvcField = doc.getElementById('cvc')
  cvcField.setAttribute('value', req.body.cvc || '')
  const expMonthField = doc.getElementById('exp_month')
  expMonthField.setAttribute('value', req.body.exp_month || '')
  const expYearField = doc.getElementById('exp_year')
  expYearField.setAttribute('value', req.body.exp_year || '')
  const nameField = doc.getElementById('name')
  nameField.setAttribute('value', req.body.name || '')
  const line1Field = doc.getElementById('address_line1')
  line1Field.setAttribute('value', req.body.address_line1 || '')
  const line2Field = doc.getElementById('address_line2')
  line2Field.setAttribute('value', req.body.address_line2 || '')
  const cityField = doc.getElementById('address_city')
  cityField.setAttribute('value', req.body.address_city || '')
  const zipField = doc.getElementById('address_zip')
  zipField.setAttribute('value', req.body.address_zip || '')
  if (req.body.address_state) {
    dashboard.HTML.setSelectedOptionByValue(doc, 'address_state', req.body.address_state || '')
  }
  if (req.body.address_country || req.country) {
    dashboard.HTML.setSelectedOptionByValue(doc, 'address_country', req.body.address_country || req.country.country.iso_code)
  }
  res.statusCode = res.statusCode || 200
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  for (const field of ['name', 'cvc', 'number', 'exp_month', 'exp_year']) {
    if (!req.body[field] || !req.body[field].length) {
      return renderPage(req, res, `invalid-${field}`)
    }
  }
  try {
    req.query = {customerid: req.customer.id}
    await global.api.user.subscriptions.CreateCard.post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
