const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (!customer) {
      throw new Error('invalid-customer')
    }
    if (!global.stripeJS) {
      if (!req.body || !req.body.name || !req.body.name.length) {
        throw new Error('invalid-name')
      }
      if (!req.body.number || !req.body.number.length) {
        throw new Error('invalid-number')
      }
      if (!req.body.cvc || req.body.cvc.length !== 3) {
        throw new Error('invalid-cvc')
      }
      try {
        const intValue = parseInt(req.body.cvc, 10)
        if (intValue.toString() !== req.body.cvc) {
          throw new Error('invalid-cvc')
        }
      } catch (error) {
        throw new Error('invalid-cvc')
      }
      if (!req.body.exp_month || !req.body.exp_month.length) {
        throw new Error('invalid-exp_month')
      }
      try {
        const intValue = parseInt(req.body.exp_month, 10)
        if (intValue.toString() !== req.body.exp_month) {
          throw new Error('invalid-exp_month')
        }
        if (intValue < 1 || intValue > 12) {
          throw new Error('invalid-exp_month')
        }
      } catch (error) {
        throw new Error('invalid-exp_month')
      }
      if (!req.body.exp_year || !req.body.exp_year.length) {
        throw new Error('invalid-exp_year')
      }
      try {
        const intValue = parseInt(req.body.exp_year, 10)
        if (intValue.toString() !== req.body.exp_year) {
          throw new Error('invalid-exp_year')
        }
        const now = parseInt(new Date().getFullYear().toString().substring(2), 10)
        if (intValue < now || intValue > now + 10) {
          throw new Error('invalid-exp_year')
        }
      } catch (error) {
        throw new Error('invalid-exp_year')
      }
    } else if (global.stripeJS === 2 || global.stripeJS === 3) {
      if (!req.body || !req.body.token || !req.body.token.length) {
        throw new Error('invalid-token')
      }
    }
    const cardInfo = {}
    if (!global.stripeJS) {
      cardInfo.number = req.body.number
      cardInfo.cvc = req.body.cvc
      cardInfo.exp_month = req.body.exp_month
      cardInfo.exp_year = req.body.exp_year
    } else if (global.stripeJS === 2 || global.stripeJS === 3) {
      cardInfo.token = req.body.token
    }
    const billingInfo = {
      name: req.body.name,
      address: {}
    }
    for (const field of ['line1', 'line2', 'city', 'state', 'zip', 'country']) {
      if (req.body[field] && req.body[field].length) {
        billingInfo.address[field] = req.body[`address_${field}`]
      }
    }
    const paymentMethodInfo = {
      type: 'card',
      card: cardInfo,
      metadata: {
        appid: req.appid,
        accountid: req.account.accountid
      }
    }
    if (global.stripeJS === false) {
      paymentMethodInfo.billing_details = billingInfo
    }
    let paymentMethod = await stripeCache.execute('paymentMethods', 'create', paymentMethodInfo, req.stripeKey)
    paymentMethod = await stripeCache.execute('paymentMethods', 'attach', paymentMethod.id, {
      customer: req.query.customerid
    }, req.stripeKey)
    const setupIntent = await stripeCache.execute('setupIntents', 'create', {
      customer: req.query.customerid,
      payment_method: paymentMethod.id,
      usage: 'off_session'
    }, req.stripeKey)
    await stripeCache.update(setupIntent)
    if (req.body.default === 'true') {
      const customerNow = await stripeCache.execute('customers', 'update', req.query.customerid, {
        invoice_settings: {
          default_payment_method: paymentMethod.id
        }
      }, req.stripeKey)
      await stripeCache.update(customerNow)
    }
    await stripeCache.update(paymentMethod)
    await subscriptions.StorageList.addMany({
      [`${req.appid}/paymentMethods`]: paymentMethod.id,
      [`${req.appid}/customer/paymentMethods/${req.query.customerid}`]: paymentMethod.id,
      [`${req.appid}/account/paymentMethods/${req.account.accountid}`]: paymentMethod.id,
      [`${req.appid}/setupIntents`]: setupIntent.id,
      [`${req.appid}/customer/setupIntents/${req.query.customerid}`]: setupIntent.id,
      [`${req.appid}/account/setupIntents/${req.account.accountid}`]: setupIntent.id
    })
    return paymentMethod
  }
}
