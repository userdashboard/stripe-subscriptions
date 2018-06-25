const stripe = require('stripe')()

module.exports = {
  loadMany: async (array, stripeKey) => {
    if (!array || !array.length) {
      throw new Error('invalid-array')
    }
    const suffix = array[0].split('_')
    const items = []
    switch (suffix) {
      // case 'card':
      //   for (const cardid of array) {
      //     const item = await stripe.customers.retrieveCard(customerid, cardid, stripeKey)
      //     items.push(item)
      //   }
      //   return items
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
    }
    if (!items.length) {
      return null
    }
    return items
  }
  // count: async (query, type, stripeKey) => {
  //   let last = null
  //   let total = 0
  //   query.limit = 100
  //   while (true) {
  //     if (last) {
  //       query.starting_after = last
  //     }
  //     const objects = await stripe[type].list(query, stripeKey)
  //     for (const object of objects.data) {
  //       if (process.env.NODE_ENV === 'testing' && object.created < global.MINIMUM_STRIPE_TIMESTAMP) {
  //         continue
  //       }
  //       last = object.id
  //       total++
  //     }
  //     if (objects.has_more !== true) {
  //       return total
  //     }
  //   }
}

