const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const plans = await global.api.administrator.subscriptions.Plans.get(req)
  if (plans && plans.length) {
    for (const plan of plans) {
      plan.created = plan.created.getTime ? plan.created : dashboard.Timestamp.date(plan.created)
      plan.createdRelative = dashboard.Format.date(plan.created)
      plan.trialFormatted = plan.trial_period_days || 0
      plan.priceFormatted = plan.currency === 'usd' ? '$' + (plan.amount / 100) : plan.amount
    }
  }
  const coupons = await global.api.administrator.subscriptions.Coupons.get(req)
  if (coupons && coupons.length) {
    for (const coupon of coupons) {
      coupon.created = coupon.created.getTime ? coupon.created : dashboard.Timestamp.date(coupon.created)
      coupon.createdRelative = dashboard.Format.date(dashboard.Timestamp.date(coupon.created))
      if (coupon.percent_off) {
        coupon.discount = `${coupon.percent_off}%`
      } else {
        if (coupon.currency === 'usd') {
          coupon.discount = `$${coupon.amount_off / 100} ${coupon.currency.toUpperCase()}`
        } else if (coupon.currency === 'eu') {
          coupon.discount = `€${coupon.amount_off / 100} ${coupon.currency.toUpperCase()}`
        } else {
          coupon.discount = `${coupon.amount_off} ${coupon.currency.toUpperCase()}`
        }
      }
    }
  }
  const subscriptions = await global.api.administrator.subscriptions.Subscriptions.get(req)
  if (subscriptions && subscriptions.length) {
    for (const subscription of subscriptions) {
      subscription.created = subscription.created.getTime ? subscription.created : dashboard.Timestamp.date(subscription.created)
      subscription.createdRelative = dashboard.Format.date(subscription.created)
      subscription.currentPeriodStart = dashboard.Timestamp.date(subscription.current_period_start)
      subscription.currentPeriodStartFormatted = dashboard.Format.date(subscription.currentPeriodStart)
      subscription.currentPeriodEnd = dashboard.Timestamp.date(subscription.current_period_end)
      subscription.currentPeriodEndFormatted = dashboard.Format.date(subscription.currentPeriodEnd)
      subscription.plan = subscription.plan && subscription.plan.id ? subscription.plan.id : subscription.plan
    }
  }
  req.data = {plans, coupons, subscriptions}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.plans && req.data.plans.length) {
    doc.renderTable(req.data.plans, 'plan-row-template', 'plans-table')
    for (const plan of req.data.plans) {
      if (plan.metadata.published) {
        doc.removeElementById(`draft-plan-${plan.id}`)
        if (plan.metadata.unpublished) {
          doc.removeElementById(`published-plan-${plan.id}`)
        } else {
          doc.removeElementById(`unpublished-plan-${plan.id}`)
        }
      } else {
        doc.removeElementById(`unpublished-plan-${plan.id}`)
        doc.removeElementById(`published-plan-${plan.id}`)
      }
    }
  }
  if (req.data.coupons && req.data.coupons.length) {
    doc.renderTable(req.data.coupons, 'coupon-row-template', 'coupons-table')
    for (const coupon of req.data.coupons) {
      if (coupon.metadata.unpublished) {
        doc.removeElementsById([`draft-coupon-${coupon.id}`, `published-coupon-${coupon.id}`])
      } else if (coupon.metadata.published) {
        doc.removeElementsById([`draft-coupon-${coupon.id}`, `unpublished-coupon-${coupon.id}`])
      } else {
        doc.removeElementsById([`published-coupon-${coupon.id}`, `unpublished-coupon-${coupon.id}`])
      }
    }
  } else {
    doc.removeElementById('coupons-table')
  }
  if (req.data.subscriptions && req.data.subscriptions.length) {
    doc.renderTable(req.data.subscriptions, 'subscription-row-template', 'subscriptions-table')
  } else {
    doc.removeElementById('subscriptions-table')
  }
  return dashboard.Response.end(req, res, doc)
}
