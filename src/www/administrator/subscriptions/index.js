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
      plan.trialFormatted = plan.trial_period_days || 0
      plan.priceFormatted = plan.currency === 'usd' ? '$' + (plan.amount / 100) : plan.amount
    }
  }
  const coupons = await global.api.administrator.subscriptions.Coupons.get(req)
  if (coupons && coupons.length) {
    for (const coupon of coupons) {
      coupon.created = coupon.created.getTime ? coupon.created : dashboard.Timestamp.date(coupon.created)
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
    dashboard.HTML.renderTable(doc, req.data.plans, 'plan-row', 'plans-table')
    for (const plan of req.data.plans) {
      const draftPlan = doc.getElementById(`draft-plan-${plan.id}`)
      const publishedPlan = doc.getElementById(`published-plan-${plan.id}`)
      const unpublishedPlan = doc.getElementById(`unpublished-plan-${plan.id}`)
      if (plan.metadata.published) {
        draftPlan.parentNode.removeChild(draftPlan)
        if (plan.metadata.unpublished) {
          publishedPlan.parentNode.removeChild(publishedPlan)
        } else {
          unpublishedPlan.parentNode.removeChild(unpublishedPlan)
        }
      } else {
        publishedPlan.parentNode.removeChild(publishedPlan)
        unpublishedPlan.parentNode.removeChild(unpublishedPlan)
      }
    }
  }
  if (req.data.coupons && req.data.coupons.length) {
    dashboard.HTML.renderTable(doc, req.data.coupons, 'coupon-row', 'coupons-table')
    for (const coupon of req.data.coupons) {
      const draftCoupon = doc.getElementById(`draft-coupon-${coupon.id}`)
      const publishedCoupon = doc.getElementById(`published-coupon-${coupon.id}`)
      const unpublishedCoupon = doc.getElementById(`unpublished-coupon-${coupon.id}`)
      if (coupon.metadata.unpublished) {
        draftCoupon.parentNode.removeChild(draftCoupon)
        publishedCoupon.parentNode.removeChild(publishedCoupon)
      } else if (coupon.metadata.published) {
        draftCoupon.parentNode.removeChild(draftCoupon)
        unpublishedCoupon.parentNode.removeChild(unpublishedCoupon)
      } else {
        publishedCoupon.parentNode.removeChild(publishedCoupon)
        unpublishedCoupon.parentNode.removeChild(unpublishedCoupon)
      }
    }
  } else {
    const couponsTable = doc.getElementById('coupons-table')
    couponsTable.parentNode.removeChild(couponsTable)
  }
  if (req.data.subscriptions && req.data.subscriptions.length) {
    dashboard.HTML.renderTable(doc, req.data.subscriptions, 'subscription-row', 'subscriptions-table')
  } else {
    const subscriptionsTable = doc.getElementById('subscriptions-table')
    subscriptionsTable.parentNode.removeChild(subscriptionsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
