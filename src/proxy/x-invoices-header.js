module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  const queryWas = req.query
  req.query = {customerid: req.customer.id}
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  req.query = queryWas
  req.headers['x-invoices'] = JSON.stringify(invoices)
}
