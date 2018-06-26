const dashboard = require('@userappstore/dashboard')

module.exports = {
  after: afterAuthentication
}

async function afterAuthentication (req, res) {
  if (!req.account || !req.customer) {
    return
  }
  if (req.url.indexOf('/administrator') === 0 || req.url.indexOf('/account') === 0) {
    return
  }
  const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
  if (!subscriptions || !subscriptions.length) {
    req.redirect = true
    return dashboard.Response.redirect(req, res, `/account/subscriptions/plans`)
  }
  for (const subscription of subscriptions) {
    if (subscription.status === 'active') {
      return
    }
  }
  req.redirect = true
  return dashboard.Response.redirect(req, res, `/account/subscriptions/plans`)
}
