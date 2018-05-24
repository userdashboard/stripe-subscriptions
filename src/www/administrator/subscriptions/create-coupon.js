const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (req.session.lockURL === req.url && req.session.unlocked >= dashboard.Timestamp.now) {
    await global.api.administrator.subscriptions.CreateCoupon.post(req)
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
    if (messageTemplate === 'success') {
      doc.removeElementById('submitForm')
      return dashboard.Response.end(req, res, doc)
    }
  }
  const days = []
  const years = []
  for (let i = 1; i < 32; i++) {
    days.push({value: i, name: i.toString()})
  }
  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 3; i++) {
    const y = currentYear + i
    years.push({value: y, name: y.toString()})
  }
  const hours = []
  for (let i = 1; i < 13; i++) {
    hours.push({value: i, name: i.toString()})
  }
  const minutes = []
  for (let i = 0; i < 60; i++) {
    const padded = i < 10 ? `0${i}` : i
    minutes.push({value: i, name: `${padded}`})
  }
  doc.renderList(minutes, 'expire-option-template', 'expires_minute')
  doc.renderList(hours, 'expire-option-template', 'expires_hour')
  doc.renderList(days, 'expire-option-template', 'expires_day')
  doc.renderList(years, 'expire-option-template', 'expires_year')
  req.body = req.body || {}
  doc.setSelectedOptionByValue('expires_minute', req.body.expires_day || 0)
  doc.setSelectedOptionByValue('expires_hour', req.body.expires_month || 0)
  doc.setSelectedOptionByValue('expires_day', req.body.expires_year || 0)
  doc.setSelectedOptionByValue('expires_month', req.body.expires_month || 0)
  doc.setSelectedOptionByValue('expires_year', req.body.expires_year || 0)
  doc.setSelectedOptionByValue('duration', req.body.duration || '')
  const idField = doc.getElementById('couponid')
  idField.setAttribute('value', req.body.couponid || generateRandomCoupon())
  const durationInMonthsField = doc.getElementById('duration_in_months')
  durationInMonthsField.setAttribute('value', req.body.duration_in_months || '')
  const maxRedemptionsField = doc.getElementById('max_redemptions')
  maxRedemptionsField.setAttribute('value', req.body.maximum_accounts || '')
  const amountOffField = doc.getElementById('amount_off')
  amountOffField.setAttribute('value', req.body.amount_off || '')
  const percentOffField = doc.getElementById('percent_off')
  percentOffField.setAttribute('value', req.body.percent_off || '')
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (!req.body.couponid) {
    return renderPage(req, res, 'invalid-couponid')
  }
  if (!req.body.couponid.match(/^[a-zA-Z0-9]+$/)) {
    return renderPage(req, res, 'invalid-couponid')
  }
  if (global.MINIMUM_COUPON_LENGTH > req.body.couponid.length ||
    global.MAXIMUM_COUPON_LENGTH < req.body.couponid.length) {
    return renderPage(req, res, 'invalid-couponid-length')
  }
  if (req.body.amount_off) {
    try {
      req.body.amount_off = parseInt(req.body.amount_off, 10)
    } catch (s) {
      return renderPage(req, res, 'invalid-amount_off')
    }
    if (!req.body.amount_off || req.body.amount_off < 0) {
      return renderPage(req, res, 'invalid-amount_off')
    }
  } else if (req.body.percent_off) {
    try {
      req.body.percent_off = parseInt(req.body.percent_off, 10)
    } catch (s) {
      return renderPage(req, res, 'invalid-percent_off')
    }
    if (!req.body.percent_off || req.body.percent_off < 0 || req.body.percent_off > 100) {
      return renderPage(req, res, 'invalid-percent_off')
    }
  }
  if (!req.body.amount_off && !req.body.percent_off) {
    return renderPage(req, res, 'invalid-discount')
  }
  if (req.body.duration !== 'once' && req.body.duration !== 'repeating' && req.body.duration !== 'forever') {
    return renderPage(req, res, 'invalid-duration')
  }
  if (req.body.duration === 'repeating') {
    if (req.body.duration_in_months) {
      try {
        req.body.duration_in_months = parseInt(req.body.duration_in_months, 10)
      } catch (s) {
        return renderPage(req, res, 'invalid-duration_in_months')
      }
      if (!req.body.duration_in_months || req.body.duration_in_months < 1 || req.body.duration_in_months > 24) {
        return renderPage(req, res, 'invalid-duration_in_months')
      }
    }
  }
  if (req.body.max_redemptions) {
    try {
      req.body.max_redemptions = parseInt(req.body.max_redemptions, 10)
    } catch (s) {
      return renderPage(req, res, 'max_redemptions')
    }
    if (!req.body.max_redemptions || req.body.max_redemptions < 0) {
      return renderPage(req, res, 'invalid-max_redemptions')
    }
  }
  if (req.body.expire_day || req.body.expire_month || req.body.expire_year ||
    req.body.expire_hour || req.body.expire_minute || req.body.expire_meridien) {
    if (req.body.expire_meridien !== 'AM' && req.body.expire_meridien !== 'PM') {
      return renderPage(req, res, 'invalid-expires')
    }
    try {
      const expires = new Date(
        req.body.expires_year,
        req.body.expires_month - 1,
        req.body.expires_day,
        req.body.expires_meridien === 'PM' ? (req.body.expires_hour || 0) + 12 : req.body.expires_hour || 0,
        req.body.expires_day || 0,
        req.body.expires_minute || 0)
      if (!expires) {
        return renderPage(req, res, 'invalid-expires')
      }
    } catch (s) {
      return renderPage(req, res, 'invalid-expires')
    }
  }
  try {
    req.query = { couponid: req.body.couponid }
    const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
    if (coupon) {
      return renderPage(req, res, 'duplicate-couponid')
    }
  } catch (error) {
  }
  try {
    await global.api.administrator.subscriptions.CreateCoupon.post(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, 'unknown-error')
  }
}

const adjectives = [
  'autumn', 'hidden', 'bitter', 'misty', 'silent', 'empty', 'dry', 'dark',
  'summer', 'icy', 'delicate', 'quiet', 'white', 'cool', 'spring', 'winter',
  'patient', 'twilight', 'dawn', 'crimson', 'wispy', 'weathered', 'blue',
  'billowing', 'broken', 'cold', 'damp', 'falling', 'frosty', 'green',
  'long', 'late', 'lingering', 'bold', 'little', 'morning', 'muddy', 'old',
  'red', 'rough', 'still', 'small', 'sparkling', 'wobbling', 'shy',
  'wandering', 'withered', 'wild', 'black', 'young', 'holy', 'solitary',
  'fragrant', 'aged', 'snowy', 'proud', 'floral', 'restless', 'divine',
  'polished', 'ancient', 'purple', 'lively', 'nameless'
]
const nouns = [
  'waterfall', 'river', 'breeze', 'moon', 'rain', 'wind', 'sea', 'morning',
  'snow', 'lake', 'sunset', 'pine', 'shadow', 'leaf', 'dawn', 'glitter',
  'forest', 'hill', 'cloud', 'meadow', 'sun', 'glade', 'bird', 'brook',
  'butterfly', 'bush', 'dew', 'dust', 'field', 'fire', 'flower', 'firefly',
  'feather', 'grass', 'haze', 'mountain', 'night', 'pond', 'darkness',
  'snowflake', 'silence', 'sound', 'sky', 'shape', 'surf', 'thunder',
  'violet', 'water', 'wildflower', 'wave', 'water', 'resonance', 'sun',
  'wood', 'dream', 'cherry', 'tree', 'fog', 'frost', 'voice', 'paper',
  'frog', 'smoke', 'star'
]

function generateRandomCoupon (installed) {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const int = Math.floor(Math.random() * 100) + 1
  return `${adjective}${noun}${int}`
}
