const fs = require('fs')
const path = require('path')
const Navigation = require('./navbar.js')
const countries = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../countries.json')))
const countryDivisions = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../country-divisions.json')))

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (req.session.lockURL === req.url && req.session.unlocked >= global.dashboard.Timestamp.now) {
    await global.api.user.subscriptions.CreateCard.post(req)
  }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    messageTemplate = 'success'
  }
  const doc = global.dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  doc.renderList(countries, 'country-template', 'address_country')
  if (messageTemplate) {
    doc.renderTemplate({}, messageTemplate, 'messageContainer')
  }
  let country
  if ((req.body && req.body.address_country) || req.country) {
    country = countryDivisions[req.body ? req.body.address_country : req.country.country.iso_code]
    const states = []
    for (const code in country.divisions) {
      states.push({code, name: country.divisions[code]})
    }
    if (!states || !states.length) {
      doc.removeElementById('stateContainer')
    } else {
      doc.renderList(states, 'state-template', 'address_state')
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
    doc.setSelectedOptionByValue('address_state', req.body.address_state || '')
  }
  if (req.body.address_country || req.country) {
    doc.setSelectedOptionByValue('address_country', req.body.address_country || req.country.country.iso_code)
  }
  res.statusCode = res.statusCode || 200
  return global.dashboard.Response.end(req, res, doc)
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
    await global.api.user.subscriptions.CreateCard.post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return global.dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}
