const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.planid) {
      throw new Error('invalid-planid')
    }
    const count = await dashboard.RedisList.count(`plan:charges:${req.query.planid}`)
    return count
  }
}