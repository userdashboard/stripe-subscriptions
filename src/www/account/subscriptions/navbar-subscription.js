module.exports = {
  setup: (doc, subscription) => {
    const removeElements = []
    if (subscription.status === 'active') {
      if (subscription.cancel_at_period_end) {
        removeElements.push('navbar-change-plan-link', 'navbar-cancel-link')
      } else {
        removeElements.push('navbar-restore-link')
      }
    } else {
      removeElements.push('navbar-change-plan-link', 'navbar-cancel-link', 'navbar-restore-link')
    }
    const template = doc.getElementById('navbar')
    for (const id of removeElements) {
      const element = template.getElementById(id)
      element.parentNode.removeChild(element)
    }
  }
}
