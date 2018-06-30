const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    const count = await dashboard.RedisList.count(`published:procuts`)
    return count
  }
}
