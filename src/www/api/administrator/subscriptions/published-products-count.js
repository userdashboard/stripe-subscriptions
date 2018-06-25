const dashboard = require('@userappstore/dashboard')
const subs = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    const count = await dashboard.RedisList.count(`published:procuts`)
    return count
  }
}
