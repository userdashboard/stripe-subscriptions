const stripeCache = require('../../../../stripe-cache.js')

module.exports = {
  patch: async (req) => {
    if (!req.query || !req.query.invoiceid) {
      throw new Error('invalid-invoiceid')
    }
    const invoice = await global.api.user.subscriptions.Invoice.get(req)
    if (!invoice) {
      throw new Error('invalid-invoiceid')
    }
    if (invoice.status !== 'draft' && invoice.status !== 'open') {
      throw new Error('invalid-invoice')
    }
    if (!req.body || !req.body.paymentmethodid) {
      throw new Error('invalid-paymentmethodid')
    }
    req.query.paymentmethodid = req.body.paymentmethodid
    const paymentMethod = await global.api.user.subscriptions.PaymentMethod.get(req)
    if (!paymentMethod) {
      throw new Error('invalid-paymentmethodid')
    }
    const invoiceNow = await stripeCache.execute('invoices', 'pay', req.query.invoiceid, {
      payment_method: paymentMethod.id
    }, req.stripeKey)
    await stripeCache.update(invoiceNow)
    return invoiceNow
  }
}
