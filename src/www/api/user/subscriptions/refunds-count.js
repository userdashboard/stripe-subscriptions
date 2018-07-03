const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    const total = await dashboard.RedisList.count(`refunds`, req.stripeKey)
    return total
  }
}
