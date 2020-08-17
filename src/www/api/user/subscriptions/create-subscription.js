const dashboard = require('@userdashboard/dashboard')
const subscriptions = require('../../../../../index.js')
const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  post: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (!req.body || !req.body.planid) {
      throw new Error('invalid-planid')
    }
    if (req.body.quantity) {
      try {
        const quantity = parseInt(req.body.quantity, 10)
        if (quantity < 1 || quantity.toString() !== req.body.quantity) {
          throw new Error('invalid-quantity')
        }
      } catch (error) {
        throw new Error('invalid-quantity')
      }
    }
    if (req.body.tax_percent) {
      try {
        const percent = parseInt(req.body.tax_percent, 10)
        if (percent < 0 || percent.toString() !== req.body.tax_percent) {
          throw new Error('invalid-tax_percent')
        }
      } catch (error) {
        throw new Error('invalid-tax_percent')
      }
    }
    req.query.planid = req.body.planid
    const plan = await global.api.user.subscriptions.PublishedPlan.get(req)
    if (!plan) {
      throw new Error('invalid-planid')
    }
    if (plan.metadata.unpublished) {
      throw new Error('invalid-plan')
    }
    const customer = await global.api.user.subscriptions.Customer.get(req)
    if (!req.body.paymentmethodid || !req.body.paymentmethodid.length) {
      req.body.paymentmethodid = customer.invoice_settings.default_payment_method
    }
    if (plan.amount) {
      if (!req.body.paymentmethodid || !req.body.paymentmethodid.length) {
        throw new Error('invalid-paymentmethodid')
      }
      if (process.env.NODE_ENV !== 'testing' && req.body.paymentmethodid.startsWith('pm_card_')) {
        req.query.paymentmethodid = req.body.paymentmethodid
        const paymentMethod = await global.api.user.subscriptions.PaymentMethod.get(req)
        if (!paymentMethod) {
          throw new Error('invalid-paymentmethodid')
        }
      }
    }
    const subscriptionInfo = {
      customer: req.query.customerid,
      items: [{
        plan: req.body.planid
      }],
      metadata: {
        appid: req.appid,
        accountid: req.account.accountid
      },
      tax_percent: req.body.tax_percent || 0,
      enable_incomplete_payments: true
    }
    if (req.body.quantity && plan.usage_type === 'licensed') {
      subscriptionInfo.items[0].quantity = req.body.quantity
    }
    if (req.body.paymentmethodid) {
      subscriptionInfo.default_payment_method = req.body.paymentmethodid
    }
    if (plan.trial_period_days) {
      subscriptionInfo.trial_end = dashboard.Timestamp.now + (plan.trial_period_days * 24 * 60 * 60)
    }
    const subscription = await stripeCache.execute('subscriptions', 'create', subscriptionInfo, req.stripeKey)
    if (!subscription) {
      throw new Error('unknown-error')
    }
    await stripeCache.update(subscription)
    await subscriptions.StorageList.addMany({
      [`${req.appid}/subscriptions`]: subscription.id,
      [`${req.appid}/account/subscriptions/${req.account.accountid}`]: subscription.id,
      [`${req.appid}/customer/subscriptions/${req.query.customerid}`]: subscription.id,
      [`${req.appid}/account/plan/subscriptions/${req.query.planid}/${req.account.accountid}`]: subscription.id,
      [`${req.appid}/account/product/subscriptions/${plan.product}/${req.account.accountid}`]: subscription.id,
      [`${req.appid}/account/plan/customers/${req.query.planid}/${req.account.accountid}`]: req.query.customerid,
      [`${req.appid}/account/product/customers/${plan.product}/${req.account.accountid}`]: req.query.customerid,
      [`${req.appid}/plan/subscriptions/${req.query.planid}`]: subscription.id,
      [`${req.appid}/product/subscriptions/${plan.product}`]: subscription.id,
      [`${req.appid}/plan/customers/${req.query.planid}`]: req.query.customerid,
      [`${req.appid}/product/customers/${plan.product}`]: req.query.customerid
    })
    return subscription
  }
}
