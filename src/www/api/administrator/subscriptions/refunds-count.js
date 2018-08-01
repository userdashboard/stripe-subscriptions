const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    return dashboard.RedisList.count('refunds', req.stripeKey)
  }
}
