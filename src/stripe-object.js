const stripe = require('stripe')()

module.exports = {
  loadManyForCustomer: async (customerid, array, stripeKey) => {
    if (!customerid || !customerid.length) {
      throw new Error('invalid-customerid')
    }
    if (!array || !array.length) {
      throw new Error('invalid-array')
    }
    const suffix = array[0].split('_')[0]
    const items = []
    switch (suffix) {
      case 'card':
        for (const cardid of array) {
          const item = await stripe.customers.retrieveCard(customerid, cardid, stripeKey)
          items.push(item)
        }
        return items
      case 'charge':
        for (const cardid of array) {
          const item = await stripe.charges.retrieve(cardid, stripeKey)
          items.push(item)
        }
        return items
    }
    if (!items.length) {
      return null
    }
    return items
  },
  loadMany: async (array, stripeKey) => {
    if (!array || !array.length) {
      throw new Error('invalid-array')
    }
    const suffix = array[0].split('_')[0]
    const items = []
    switch (suffix) {
      case 're':
        for (const refundid of array) {
          const item = await stripe.refunds.retrieve(refundid, stripeKey)
          items.push(item)
        }
        return items
      case 'in':
        for (const invoiceid of array) {
          const item = await stripe.invoices.retrieve(invoiceid, stripeKey)
          items.push(item)
        }
        return items
      case 'ch':
        for (const chargeid of array) {
          const item = await stripe.charges.retrieve(chargeid, stripeKey)
          items.push(item)
        }
        return items
      case 'cus':
        for (const customerid of array) {
          const item = await stripe.customers.retrieve(customerid, stripeKey)
          items.push(item)
        }
        return items
      case 'sub':
        for (const subscriptionid of array) {
          const item = await stripe.subscriptions.retrieve(subscriptionid, stripeKey)
          items.push(item)
        }
        return items
      case 'prod':
        for (const productid of array) {
          const item = await stripe.products.retrieve(productid, stripeKey)
          items.push(item)
        }
        return items
      default:
        console.log('loadMany', suffix)
        return null
    }
  }
}
