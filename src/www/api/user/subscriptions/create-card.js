const RedisListIndex = require('../../../../redis-list-index.js')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    for (const field of ['name', 'cvc', 'number', 'exp_month', 'exp_year']) {
      if (!req.body[field] || !req.body[field].length) {
        throw new Error(`invalid-${field}`)
      }
    }
  },
  post: async (req) => {
    const cardInfo = {
      source: {
        object: 'card',
        name: req.body.name,
        number: req.body.number,
        cvc: req.body.cvc,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year
      }
    }
    for (const field of ['address_line1', 'address_line2', 'address_city', 'address_state', 'address_zip', 'address_country']) {
      if (req.body[field] && req.body[field].length) {
        cardInfo.source[field] = req.body[field]
      }
    }
    const card = await stripe.customers.createCard(req.customer.id, cardInfo, req.stripeKey)
    await stripe.customers.update(req.customer.id, {default_source: card.id}, req.stripeKey)
    await RedisListIndex.add('cards', card.id)
    await RedisListIndex.add(`customer:cards:${req.customer.id}`, card.id)
    req.customer = await stripe.customers.retrieve(req.customer.id, req.stripeKey)
    req.success = true
  }
}
