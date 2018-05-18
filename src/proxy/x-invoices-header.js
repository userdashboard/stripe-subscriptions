module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  const invoices = await global.api.user.subscriptions.Invoices.get(req)
  req.headers['x-invoices'] = JSON.stringify(invoices)
}
