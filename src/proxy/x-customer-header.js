module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  const customer = JSON.parse(JSON.stringify(req.customer))
  req.headers['x-customer'] = JSON.stringify(customer)
}
