module.exports = {
  setup: (doc, invoice) => {
    const removeElements = []
    if (!invoice.amount_due) {
      removeElements.push('navbar-forgive-link')
    } else if (!invoice.paid || !invoice.total) {
      removeElements.push('navbar-refund-link')
    }
    const template = doc.getElementById('navbar')
    for (const id of removeElements) {
      const element = template.getElementById(id)
      element.parentNode.removeChild(element)
    }
  }
}
