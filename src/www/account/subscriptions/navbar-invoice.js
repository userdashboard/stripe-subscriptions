const dashboard = require('@userdashboard/dashboard')

module.exports = {
  setup: async (doc, invoice) => {
    const template = doc.getElementById('navbar')
    if (invoice.paid) {
      const payLink = template.getElementById('navbar-pay-link')
      payLink.parentNode.removeChild(payLink)
      if (global.subscriptionRefundPeriod && invoice.created > dashboard.Timestamp.now - global.subscriptionRefundPeriod) {
        const requestLink = template.getElementById('navbar-request-link')
        requestLink.parentNode.removeChild(requestLink)
      } else {
        const refundLink = template.getElementById('navbar-refund-link')
        refundLink.parentNode.removeChild(refundLink)
      }
    } else if (!invoice.total) {
      const refundLink = template.getElementById('navbar-refund-link')
      refundLink.parentNode.removeChild(refundLink)
      const requestLink = template.getElementById('navbar-request-link')
      requestLink.parentNode.removeChild(requestLink)
    }
  }
}
