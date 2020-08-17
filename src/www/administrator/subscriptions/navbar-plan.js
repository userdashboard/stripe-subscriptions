module.exports = {
  setup: (doc, plan) => {
    const removeElements = []
    if (plan.metadata.unpublished) {
      removeElements.push('navbar-edit-link', 'navbar-publish-link', 'navbar-unpublish-link')
    } else if (plan.metadata.published) {
      removeElements.push('navbar-publish-link')
    } else {
      removeElements.push('navbar-unpublish-link')
    }
    const template = doc.getElementById('navbar')
    for (const id of removeElements) {
      const element = template.getElementById(id)
      element.parentNode.removeChild(element)
    }
  }
}
