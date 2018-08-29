const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    const result = await dashboard.RedisList.count(`${req.appid}:published:products`)
    return result
  }
}
