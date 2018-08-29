const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    return dashboard.RedisList.count(`${req.appid}:plan:cards:${req.query.planid}`, req.stripeKey)
  }
}
