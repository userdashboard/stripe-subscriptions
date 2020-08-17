const stripeCache = require('../../../../stripe-cache.js')

module.exports = {

  patch: async (req) => {
    if (!req.query || !req.query.invoiceid) {
      throw new Error('invalid-invoiceid')
    }
    const invoice = await global.api.administrator.subscriptions.Invoice.get(req)
    if (!invoice) {
      throw new Error('invalid-invoiceid')
    }
    if (invoice.status !== 'open' && invoice.status !== 'draft') {
      throw new Error('invalid-invoice')
    }
    const invoiceNow = await stripeCache.execute('invoices', 'markUncollectible', req.query.invoiceid, req.stripeKey)
    await stripeCache.update(invoiceNow)
    return invoiceNow
  }
}
