const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  req.query = req.query || {}
  req.query.accountid = req.account.accountid
  const total = await global.api.user.subscriptions.RefundsCount.get(req)
  const refunds = await global.api.user.subscriptions.Refunds.get(req)
  const offset = req.query ? req.query.offset || 0 : 0
  if (refunds && refunds.length) {
    for (const refund of refunds) {
      refund.createdFormatted = dashboard.Format.date(refund.created)
      refund.amountFormatted = dashboard.Format.money(refund.amount || 0, refund.currency)
    }
  }
  req.data = { refunds, total, offset }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.html || req.route.html)
  if (req.data.refunds && req.data.refunds.length) {
    dashboard.HTML.renderTable(doc, req.data.refunds, 'refund-row', 'refunds-table')
    if (req.data.total <= global.pageSize) {
      const pageLinks = doc.getElementById('page-links')
      pageLinks.parentNode.removeChild(pageLinks)
    } else {
      dashboard.HTML.renderPagination(doc, req.data.offset, req.data.total)
    }
    const noRefunds = doc.getElementById('no-refunds')
    noRefunds.parentNode.removeChild(noRefunds)
  } else {
    const refundsTable = doc.getElementById('refunds-table')
    refundsTable.parentNode.removeChild(refundsTable)
  }
  return dashboard.Response.end(req, res, doc)
}
