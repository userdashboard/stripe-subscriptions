const dashboard = require('@userdashboard/dashboard')
const countries = require('../../../../countries.json')
const countryDivisions = require('../../../../country-divisions.json')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.customerid) {
    throw new Error('invalid-customerid')
  }
  const customer = await global.api.user.subscriptions.Customer.get(req)
  req.data = { customer }
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  let doc
  const removeElements = []
  if (global.stripeJS === false) {
    doc = dashboard.HTML.parse(req.html || req.route.html, { customerid: req.query.customerid }, 'dashboard')
    removeElements.push('stripe-v3', 'common-v3', 'handler-v3', 'form-stripejs-v3')
  } else if (global.stripeJS === 3) {
    doc = dashboard.HTML.parse(req.html || req.route.html, { customerid: req.query.customerid, dashboardServer: global.dashboardServer, stripePublishableKey: global.stripePublishableKey }, 'dashboard')
    const stripePublishableKey = doc.getElementById('stripe-publishable-key')
    stripePublishableKey.setAttribute('value', global.stripePublishableKey)
    removeElements.push('form-nojs')
    res.setHeader('content-security-policy',
      'default-src * \'unsafe-inline\'; ' +
      `style-src https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/v3/ https://js.stripe.com/v2/ ${global.dashboardServer}/public/ 'unsafe-inline'; ` +
      `script-src * https://q.stripe.com/ https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/v3/ https://js.stripe.com/v2/ ${global.dashboardServer}/public/ 'unsafe-inline' 'unsafe-eval'; ` +
      'frame-src https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/ \'unsafe-inline\'; ' +
      'connect-src https://m.stripe.com/ https://m.stripe.network/ https://js.stripe.com/ \'unsafe-inline\'; ')
  }
  for (const elementid of removeElements) {
    const element = doc.getElementById(elementid)
    if (!element || !element.parentNode) {
      console.log('missing parent', elementid)
      continue
    }
    element.parentNode.removeChild(element)
  }
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
  }
  req.query = req.query || {}
  req.query.ip = req.ip
  const defaultCountry = await global.api.user.maxmind.Country.get(req)
  let countryCode
  if (req.body) {
    countryCode = req.body.address_country
  }
  countryCode = countryCode || defaultCountry.country.iso_code
  const country = countryDivisions[countryCode]
  const states = []
  for (const code in country.divisions) {
    states.push({ code, name: country.divisions[code], object: 'state' })
  }
  states.sort(sortStates)
  dashboard.HTML.renderList(doc, states, 'state-option', 'address_state')
  if (req.body && req.body.address_state) {
    dashboard.HTML.setSelectedOptionByValue(doc, 'address_state', req.body.address_state)
  }
  dashboard.HTML.renderList(doc, countries, 'country-option', 'address_country')
  dashboard.HTML.setSelectedOptionByValue(doc, 'address_country', countryCode)
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (!global.stripeJS) {
    if (!req.body.name || !req.body.name.length) {
      return renderPage(req, res, 'invalid-name')
    }
    if (!req.body.number || !req.body.number.length) {
      return renderPage(req, res, 'invalid-number')
    }
    if (!req.body.cvc || !req.body.cvc.length) {
      return renderPage(req, res, 'invalid-cvc')
    }
    if (!req.body.exp_month || !req.body.exp_month.length) {
      return renderPage(req, res, 'invalid-exp_month')
    }
    if (!req.body.exp_year || !req.body.exp_year.length) {
      return renderPage(req, res, 'invalid-exp_year')
    }
  } else if (global.stripeJS === 3) {
    if (!req.body.token || !req.body.token.length) {
      return renderPage(req, res, 'invalid-token')
    }
  }
  try {
    await global.api.user.subscriptions.CreatePaymentMethod.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `${req.urlPath}?customerid=${req.query.customerid}&message=success`
    })
    return res.end()
  }
}

function sortStates (a, b) {
  return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
}
