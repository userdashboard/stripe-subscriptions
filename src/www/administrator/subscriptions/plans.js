const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const total = await global.api.administrator.subscriptions.PlansCount.get(req)
  const plans = await global.api.administrator.subscriptions.Plans.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (plans && plans.length) {
    for (const plan of plans) {
      plan.created = plan.created.getTime ? plan.created : dashboard.Timestamp.date(plan.created)
      plan.trialFormatted = plan.trial_period_days || 0
      plan.priceFormatted = plan.currency === 'usd' ? '$' + (plan.amount / 100) : plan.amount
    }
  }
  req.data = {plans, total, offset}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.plans && req.data.plans.length) {
    dashboard.HTML.renderTable(doc, req.data.plans, 'plan-row', 'plans-table')
    for (const plan of req.data.plans) {
      const draftPlan = doc.getElementById(`draft-plan-${plan.id}`)
      const publishedPlan = doc.getElementById(`published-plan-${plan.id}`)
      const unpublishedPlan = doc.getElementById(`unpublished-plan-${plan.id}`)
      const setPlanPublished = doc.getElementById(`set-plan-published-${plan.id}`)
      const setPlanUnpublished = doc.getElementById(`set-plan-unpublished-${plan.id}`)
      if (plan.metadata.unpublished) {
        draftPlan.parentNode.removeChild(draftPlan)
        publishedPlan.parentNode.removeChild(publishedPlan)
        setPlanPublished.parentNode.removeChild(setPlanPublished)
        setPlanUnpublished.parentNode.removeChild(setPlanUnpublished)
      } else if (plan.metadata.published) {
        draftPlan.parentNode.removeChild(draftPlan)
        unpublishedPlan.parentNode.removeChild(unpublishedPlan)
        setPlanPublished.parentNode.removeChild(setPlanPublished)
      } else {
        publishedPlan.parentNode.removeChild(publishedPlan)
        unpublishedPlan.parentNode.removeChild(unpublishedPlan)
        setPlanUnpublished.parentNode.removeChild(setPlanUnpublished)
      }
    }
    if (req.data.total <= global.PAGE_SIZE) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
  } else {
    const plansTable = doc.getElementById('plans-table')
    plansTable.parentNode.removeChild(plansTable)
  }
  return dashboard.Response.end(req, res, doc)
}
