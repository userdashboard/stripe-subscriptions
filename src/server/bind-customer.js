module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  if (req.customer) {
    return
  }
  if (!req.account) {
    return
  }
  const queryWas = req.query
  const customerid = await global.dashboard.Account.getProperty(req.account.accountid, 'customerid')
  if (customerid) {
    req.query = { customerid }
    req.customer = await global.api.user.subscriptions.Customer.get(req)
    req.query = queryWas
    return
  }
  req.query = { accountid: req.account.accountid }
  try {
    req.customer = await global.api.user.subscriptions.CreateCustomer.post(req)
  } catch (error) {
    if (error.message === 'invalid-customerid') {
      req.customer = await global.api.user.subscriptions.Customer.get(req)
    }
  }
  req.query = queryWas
}
