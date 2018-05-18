module.exports = {
  render: renderNavigation
}

async function renderNavigation (req, doc) {
  doc.renderNavigation(doc, req.data.plan)
  const navbarTemplate = doc.getElementById('navbar-template')
  if (req.data.plan.metadata.deleted) {
    doc.removeElementsById(['navbar-edit-link', 'navbar-delete-link'])
  } else {
    doc.removeElementById('navbar-restore-link')
  }
  if (req.data.plan.metadata.published) {
    navbarTemplate.removeElementById('navbar-publish-link')
  } else {
    navbarTemplate.removeElementById('navbar-unpublish-link')
  }
}
