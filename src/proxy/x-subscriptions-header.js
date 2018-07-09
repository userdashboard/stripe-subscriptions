module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  const queryWas = req.query
  req.query = {customerid: req.customer.id}
  const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
  req.query = queryWas
  req.headers['x-subscriptions'] = JSON.stringify(subscriptions)
}
