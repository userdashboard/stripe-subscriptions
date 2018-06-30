const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const result = await dashboard.RedisList.count(`published:products`)
    return result
  }
}
