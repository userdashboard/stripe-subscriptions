const dashboard = require('@userdashboard/dashboard')

module.exports = {
  after: async (req, res) => {
    if (!global.requireSubscription) {
      return
    }
    if (!req.account || !req.session) {
      return
    }
    if (req.urlPath === '/account' ||
        req.urlPath === '/administrator' ||
        req.urlPath.startsWith('/public/') ||
        req.urlPath.startsWith('/account/') ||
        req.urlPath.startsWith('/administrator/') ||
        req.urlPath.startsWith('/api/')) {
      return
    }
    if (req.account.owner && req.urlPath === '/home') {
      return
    }
    let startSubscriptionPath = global.startSubscriptionPath
    if (startSubscriptionPath.indexOf('?') > -1) {
      startSubscriptionPath += '&'
    } else {
      startSubscriptionPath += '?'
    }
    startSubscriptionPath += 'return-url=' + req.url
    if (req.url.startsWith(startSubscriptionPath)) {
      return
    }
    const queryWas = req.query
    req.query = {
      accountid: req.account.accountid,
      all: true
    }
    const subscriptions = await global.api.user.subscriptions.Subscriptions.get(req)
    req.query = queryWas
    if (subscriptions && subscriptions.length) {
      for (const subscription of subscriptions) {
        if (subscription.current_period_end) {
          return
        }
      }
    }
    res.ended = true
    return dashboard.Response.redirect(req, res, startSubscriptionPath)
  }
}
