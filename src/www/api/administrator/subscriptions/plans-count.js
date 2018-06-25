const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    const count = await dashboard.RedisList.count(`plans`)
    return count
  }
}
