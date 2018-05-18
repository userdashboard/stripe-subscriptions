const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']
const intervals = ['day', 'week', 'month', 'year']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
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
      subscription.created = global.dashboard.Timestamp.date(subscription.start)
      subscription.createdRelative = global.dashboard.Format.relativePastDate(subscription.created)
      subscription.priceFormatted = global.dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
      if (subscription.status === 'trial') {
        subscription.trial_end = global.dashboard.Timestamp.date(subscription.trial_end)
        subscription.trialEndRelative = global.dashboard.Format.relativeFutureDate(subscription.trial_end)
      }
      if (!subscription.plan.amount || subscription.status !== 'active' || subscription.cancel_at_period_end) {
        subscription.nextChargeRelative = '-'
        subscription.nextCharge = '-'
      } else {
        subscription.nextCharge = global.dashboard.Timestamp.date(subscription.current_period_end)
        subscription.nextChargeRelative = global.dashboard.Format.relativeFutureDate(subscription.nextCharge)
      }
    }
  }
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = global.dashboard.Format.money(invoice.total || 0, invoice.currency)
      invoice.date = global.dashboard.Timestamp.date(invoice.date)
      invoice.dateRelative = global.dashboard.Format.date(invoice.date)
      invoice.period_start = global.dashboard.Timestamp.date(invoice.lines.data[0].period_start)
      invoice.periodStartRelative = global.dashboard.Format.date(invoice.lines.data[0].period_start)
      invoice.period_end = global.dashboard.Timestamp.date(invoice.lines.data[0].period_end)
      invoice.periodEndRelative = global.dashboard.Format.date(invoice.lines.data[0].period_end)
      invoice.plan_name = invoice.lines.data[0].plan.name
    }
  }
  req.data = {cards, subscriptions, invoices}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  let allFree = true
  if (req.data.subscriptions && req.data.subscriptions.length) {
    doc.renderTable(req.data.subscriptions, 'subscription-row-template', 'subscriptions-table')
    const removeElements = []
    for (const subscription of req.data.subscriptions) {
      allFree = allFree || subscription.plan.amount > 0
      for (const status of statuses) {
        if (subscription.status === status) {
          continue
        }
        removeElements.push(`${status}-subscription-${subscription.id}`)
      }
      if (subscription.status === 'active') {
        if (subscription.cancel_at_period_end) {
          removeElements.push(`active-subscription-${subscription.id}`, `change-plan-link-${subscription.id}`, `cancel-subscription-link-${subscription.id}`)
        } else {
          removeElements.push(`canceling-subscription-${subscription.id}`)
        }
      }
      for (const interval of intervals) {
        if (interval !== subscription.plan.interval) {
          removeElements.push(`${interval}-singular-interval-${subscription.id}`, `${interval}-multiple-${subscription.id}`)
        }
        if (subscription.plan.interval_count === 1) {
          removeElements.push(`${interval}-multiple-interval-${subscription.id}`)
        } else {
          removeElements.push(`${interval}-singular-interval-${subscription.id}`)
        }
      }
    }
    doc.removeElementsById(removeElements)
  } else {
    doc.removeElementById('subscriptionsContainer')
  }
  if (req.data.invoices && req.data.invoices.length) {
    doc.renderTable(req.data.invoices, 'invoice-row-template', 'invoices-table')
  } else {
    doc.removeElementById('invoicesContainer')
  }
  if (req.data.cards && req.data.cards.length) {
    for (const card of req.data.cards) {
      if (req.customer.default_source === card.id) {
        doc.renderTemplate(card, 'card-template', 'card')
        break
      }
    }
    doc.renderTable(req.data.cards, 'card-row-template', 'cards-table')
  } else {
    doc.removeElementById('cardsContainer')
    doc.removeElementById('payment-informationContainer')
  }
  if (req.customer.account_balance < 0) {
    const balanceField = doc.getElementById('balance')
    balanceField.setInnerText(global.dashboard.Format.money(-req.customer.account_balance, req.customer.currency))
  } else {
    doc.removeElementById('balance-informationContainer')
  }
  return global.dashboard.Response.end(req, res, doc)
}
