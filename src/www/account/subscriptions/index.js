const dashboard = require('@userappstore/dashboard')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']
const intervals = ['day', 'week', 'month', 'year']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = {customerid: req.customer.id}
  const cards = await global.api.user.subscriptions.Cards.get(req)
  const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
  if (subscriptions && subscriptions.length) {
    for (const subscription of subscriptions) {
      if (subscription.status === 'canceled') {
        continue
      }
      subscription.plan_name = subscription.plan.name
      subscription.currency = subscription.plan.currency.toUpperCase()
      subscription.interval = subscription.plan.interval
      subscription.interval_count = subscription.plan.interval_count
      subscription.created = dashboard.Timestamp.date(subscription.start)
      subscription.priceFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
      if (subscription.status === 'trial') {
        subscription.trial_end = dashboard.Timestamp.date(subscription.trial_end)
      }
      if (!subscription.plan.amount || subscription.status !== 'active' || subscription.cancel_at_period_end) {
        subscription.nextCharge = '-'
      } else {
        subscription.nextCharge = dashboard.Timestamp.date(subscription.current_period_end)
      }
    }
  }
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = dashboard.Format.money(invoice.total || 0, invoice.currency)
      invoice.date = dashboard.Timestamp.date(invoice.date)
      invoice.period_start = dashboard.Timestamp.date(invoice.lines.data[0].period_start)
      invoice.period_end = dashboard.Timestamp.date(invoice.lines.data[0].period_end)
      invoice.plan_name = invoice.lines.data[0].plan.name
    }
  }
  req.data = {cards, subscriptions, invoices}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  let allFree = true
  if (req.data.subscriptions && req.data.subscriptions.length) {
    dashboard.HTML.renderTable(doc, req.data.subscriptions, 'subscription-row', 'subscriptions-table')
    for (const subscription of req.data.subscriptions) {
      allFree = allFree || subscription.plan.amount > 0
      for (const status of statuses) {
        if (subscription.status === status) {
          continue
        }
        const element = doc.getElementById(`${status}-subscription-${subscription.id}`)
        element.parentNode.removeChild(element)
      }
      if (subscription.status === 'active') {
        if (subscription.cancel_at_period_end) {
          const element = doc.getElementById(`active-subscription-${subscription.id}`)
          element.parentNode.removeChild(element)
          const element2 = doc.getElementById(`change-plan-link-${subscription.id}`)
          element2.parentNode.removeChild(element2)
          const element3 = doc.getElementById(`cancel-subscription-link-${subscription.id}`)
          element3.parentNode.removeChild(element3)
        } else {
          const element = doc.getElementById(`canceling-subscription-${subscription.id}`)
          element.parentNode.removeChild(element)
        }
      }
      for (const interval of intervals) {
        if (interval !== subscription.plan.interval) {
          const element = doc.getElementById(`${interval}-singular-interval-${subscription.id}`)
          element.parentNode.removeChild(element)
          const element2 = doc.getElementById(`${interval}-multiple-interval-${subscription.id}`)
          element2.parentNode.removeChild(element2)
        } else if (subscription.plan.interval_count === 1) {
          const element = doc.getElementById(`${interval}-multiple-interval-${subscription.id}`)
          element.parentNode.removeChild(element)
        } else {
          const element = doc.getElementById(`${interval}-singular-interval-${subscription.id}`)
          element.parentNode.removeChild(element)
        }
      }
    }
  } else {
    const element = doc.getElementById(`subscriptions-container`)
    element.parentNode.removeChild(element)
  }
  if (req.data.invoices && req.data.invoices.length) {
    dashboard.HTML.renderTable(doc, req.data.invoices, 'invoice-row', 'invoices-table')
  } else {
    const element = doc.getElementById(`invoices-container`)
    element.parentNode.removeChild(element)
  }
  if (req.data.cards && req.data.cards.length) {
    for (const card of req.data.cards) {
      if (req.customer.default_source === card.id) {
        dashboard.HTML.renderTemplate(doc, card, 'card-template', 'card')
        break
      }
    }
    dashboard.HTML.renderTable(doc, req.data.cards, 'card-row', 'cards-table')
  } else {
    const element = doc.getElementById(`cards-container`)
    element.parentNode.removeChild(element)
    const element2 = doc.getElementById(`payment-information-container`)
    element2.parentNode.removeChild(element2)
  }
  if (req.customer.account_balance < 0) {
    const balanceField = doc.getElementById('balance')
    balanceField.setInnerText(dashboard.Format.money(-req.customer.account_balance, req.customer.currency))
  } else {
    const element = doc.getElementById(`balance-information-container`)
    element.parentNode.removeChild(element)
  }
  return dashboard.Response.end(req, res, doc)
}
