const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const total = await dashboard.RedisList.count(`plan:cards:${req.query.planid}`, req.stripeKey)
    return total
  }
}
