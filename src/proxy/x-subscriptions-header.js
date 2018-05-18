module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req) {
  const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
  req.headers['x-subscriptions'] = JSON.stringify(subscriptions)
}
