const dashboard = require('@userappstore/dashboard')

module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  if (req.customer || !req.account) {
    return
  }
  const queryWas = req.query
  const customerid = await dashboard.RedisObject.getProperty(req.account.accountid, 'customerid')
  if (customerid) {
    req.query = {customerid}
    req.customer = await global.api.user.subscriptions.Customer.get(req)
    req.query = queryWas
    return
  }
  req.query = {accountid: req.account.accountid}
  req.customer = await global.api.user.subscriptions.CreateCustomer.post(req)
  req.query = queryWas
}
