const dashboard = require('@userappstore/dashboard')

module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  if (req.customer || !req.account) {
    return
  }
  const customerid = await dashboard.RedisObject.getProperty(req.account.accountid, 'customerid')
  if (customerid) {
    req.customer = await global.api.user.subscriptions.Customer.get(req)
  }
}
