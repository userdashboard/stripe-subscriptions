const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.invoiceid) {
      throw new Error('invalid-invoiceid')
    }
    let invoice
    try {
      invoice = await stripeCache.retrieve(req.query.invoiceid, 'invoices', req.stripeKey)
    } catch (error) {
    }
    if (!invoice) {
      throw new Error('invalid-invoiceid')
    }
    return invoice
  }
}
