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
    const queryWas = req.query
    req.query = {customerid}
    req.customer = await global.api.user.subscriptions.Customer.get(req)
    req.query = queryWas
  }
}
