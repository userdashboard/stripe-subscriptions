const dashboard = require('@userdashboard/dashboard')

module.exports = {
  get: renderPage,
  post: submitForm
}

async function renderPage (req, res, messageTemplate) {
  messageTemplate = messageTemplate || (req.query ? req.query.message : null)
  const doc = dashboard.HTML.parse(req.html || req.route.html, null, null, req.language)
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  const days = []
  const years = []
  for (let i = 1; i < 32; i++) {
    days.push({ value: i, name: i.toString(), object: 'option' })
  }
  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 3; i++) {
    const y = currentYear + i
    years.push({ value: y, name: y.toString(), object: 'option' })
  }
  const hours = []
  for (let i = 1; i < 13; i++) {
    hours.push({ value: i, name: i.toString(), object: 'option' })
  }
  const minutes = []
  for (let i = 0; i < 60; i++) {
    const padded = i < 10 ? `0${i}` : i
    minutes.push({ value: i, name: `${padded}`, object: 'option' })
  }
  dashboard.HTML.renderList(doc, minutes, 'redeem_by-option-template', 'redeem_by_minute')
  dashboard.HTML.renderList(doc, hours, 'redeem_by-option-template', 'redeem_by_hour')
  dashboard.HTML.renderList(doc, days, 'redeem_by-option-template', 'redeem_by_day')
  dashboard.HTML.renderList(doc, years, 'redeem_by-option-template', 'redeem_by_year')
  if (req.body) {
    dashboard.HTML.setSelectedOptionByValue(doc, 'redeem_by_minute', req.body.redeem_by_day || 0)
    dashboard.HTML.setSelectedOptionByValue(doc, 'redeem_by_hour', req.body.redeem_by_month || 0)
    dashboard.HTML.setSelectedOptionByValue(doc, 'redeem_by_day', req.body.redeem_by_year || 0)
    dashboard.HTML.setSelectedOptionByValue(doc, 'redeem_by_month', req.body.redeem_by_month || 0)
    dashboard.HTML.setSelectedOptionByValue(doc, 'redeem_by_year', req.body.redeem_by_year || 0)
    dashboard.HTML.setSelectedOptionByValue(doc, 'duration', req.body.duration || '')
    const idField = doc.getElementById('couponid')
    idField.setAttribute('value', (req.body.couponid).split("'").join('&quot;'))
    const durationInMonthsField = doc.getElementById('duration_in_months')
    durationInMonthsField.setAttribute('value', (req.body.duration_in_months || '').split("'").join('&quot;'))
    const maxRedemptionsField = doc.getElementById('max_redemptions')
    maxRedemptionsField.setAttribute('value', (req.body.maximum_accounts || '').split("'").join('&quot;'))
    const amountOffField = doc.getElementById('amount_off')
    amountOffField.setAttribute('value', (req.body.amount_off || '').split("'").join('&quot;'))
    const percentOffField = doc.getElementById('percent_off')
    percentOffField.setAttribute('value', (req.body.percent_off || '').split("'").join('&quot;'))
  } else {
    const idField = doc.getElementById('couponid')
    idField.setAttribute('value', generateRandomCoupon())
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
  if (!req.body.couponid) {
    return renderPage(req, res, 'invalid-couponid')
  }
  if (!req.body.couponid.match(/^[a-zA-Z0-9]+$/)) {
    return renderPage(req, res, 'invalid-couponid')
  }
  if (!req.body.amount_off && !req.body.percent_off) {
    return renderPage(req, res, 'invalid-discount')
  }
  if (req.body.duration !== 'once' && req.body.duration !== 'repeating' && req.body.duration !== 'forever') {
    return renderPage(req, res, 'invalid-duration')
  }
  if (global.minimumCouponLength > req.body.couponid.length ||
    global.maximumCouponLength < req.body.couponid.length) {
    return renderPage(req, res, 'invalid-couponid-length')
  }
  if (req.body.amount_off) {
    try {
      const amountOff = parseInt(req.body.amount_off, 10)
      if (!amountOff || amountOff < 0) {
        return renderPage(req, res, 'invalid-amount_off')
      }
    } catch (s) {
      return renderPage(req, res, 'invalid-amount_off')
    }
  } else if (req.body.percent_off) {
    try {
      const percentOff = parseInt(req.body.percent_off, 10)
      if (!percentOff || percentOff < 0 || percentOff > 100) {
        return renderPage(req, res, 'invalid-percent_off')
      }
    } catch (s) {
      return renderPage(req, res, 'invalid-percent_off')
    }
  }
  if (req.body.duration === 'repeating') {
    if (req.body.duration_in_months) {
      try {
        const durationInMonths = parseInt(req.body.duration_in_months, 10)
        if (!durationInMonths || durationInMonths < 1 || durationInMonths > 24) {
          return renderPage(req, res, 'invalid-duration_in_months')
        }
      } catch (s) {
        return renderPage(req, res, 'invalid-duration_in_months')
      }
    }
  }
  if (req.body.max_redemptions) {
    try {
      const maxRedemptions = parseInt(req.body.max_redemptions, 10)
      if (!maxRedemptions || maxRedemptions < 0) {
        return renderPage(req, res, 'invalid-max_redemptions')
      }
    } catch (s) {
      return renderPage(req, res, 'invalid-max_redemptions')
    }
  }
  if ((req.body.redeem_by_day && req.body.redeem_by_day !== '0') ||
      (req.body.redeem_by_month && req.body.redeem_by_month !== '0') ||
      (req.body.redeem_by_year && req.body.redeem_by_year !== '0') ||
      (req.body.redeem_by_hour && req.body.redeem_by_hour !== 'HH') ||
      (req.body.redeem_by_minute && req.body.redeem_by_minute !== 'MM')) {
    if (req.body.redeem_by_meridiem !== 'AM' && req.body.redeem_by_meridiem !== 'PM') {
      return renderPage(req, res, 'invalid-redeem_by')
    }
    if (req.body.redeem_by_day) {
      try {
        const day = parseInt(req.body.redeem_by_day, 10)
        if (!day || day < 1 || day > 31) {
          return renderPage(req, res, 'invalid-redeem_by')
        }
      } catch (s) {
        return renderPage(req, res, 'invalid-redeem_by')
      }
    }
    if (req.body.redeem_by_month) {
      try {
        const month = parseInt(req.body.redeem_by_month, 10)
        if (!month || month < 1 || month > 12) {
          return renderPage(req, res, 'invalid-redeem_by')
        }
      } catch (s) {
        return renderPage(req, res, 'invalid-redeem_by')
      }
    }
    if (req.body.redeem_by_year) {
      try {
        const year = parseInt(req.body.redeem_by_year, 10)
        const now = new Date().getFullYear()
        if (!year || year > now + 5) {
          return renderPage(req, res, 'invalid-redeem_by')
        }
      } catch (s) {
        return renderPage(req, res, 'invalid-redeem_by')
      }
    }
    try {
      const redeemBy = new Date(
        req.body.redeem_by_year,
        req.body.redeem_by_month - 1,
        req.body.redeem_by_day,
        req.body.redeem_by_meridiem === 'PM' ? (req.body.redeem_by_hour || 0) + 12 : req.body.redeem_by_hour || 0,
        req.body.redeem_by_minute || 0)
      if (!redeemBy) {
        return renderPage(req, res, 'invalid-redeem_by')
      }
    } catch (s) {
      return renderPage(req, res, 'invalid-redeem_by')
    }
  }
  try {
    req.query = req.query || {}
    req.query.couponid = req.body.couponid
    const coupon = await global.api.administrator.subscriptions.Coupon.get(req)
    if (coupon) {
      return renderPage(req, res, 'invalid-couponid')
    }
  } catch (error) {
  }
  let coupon
  try {
    coupon = await global.api.administrator.subscriptions.CreateCoupon.post(req)
  } catch (error) {
    return renderPage(req, res, error.message)
  }
  if (req.query['return-url']) {
    return dashboard.Response.redirect(req, res, req.query['return-url'])
  } else {
    res.writeHead(302, {
      location: `/administrator/subscriptions/coupon?couponid=${coupon.id}`
    })
    return res.end()
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
