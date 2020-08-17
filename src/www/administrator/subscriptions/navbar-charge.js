module.exports = {
  setup: (doc, charge) => {
    const removeElements = []
    if (charge.fraud_details.user_report || charge.fraud_details.stripe_report) {
      removeElements.push('navbar-flag-fraud-link', 'navbar-refund-link', 'navbar-deny-refund-link')
    } else {
      if (!charge.amount || !charge.paid || charge.refunded) {
        removeElements.push('navbar-flag-fraud-link', 'navbar-refund-link', 'navbar-deny-refund-link')
      } else if (!charge.metadata.refundRequested) {
        removeElements.push('navbar-deny-refund-link')
      }
    }
    const template = doc.getElementById('navbar')
    for (const id of removeElements) {
      const element = template.getElementById(id)
      element.parentNode.removeChild(element)
    }
  }
}
