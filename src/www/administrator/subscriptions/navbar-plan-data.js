module.exports = {
  render: renderNavigation
}

async function renderNavigation (req, doc) {
  doc.renderNavigation(doc, req.data.plan)
  const navbarTemplate = doc.getElementById('navbar-template')
  if (req.data.plan.deleted) {
    navbarTemplate.removeElementsById(['navbar-edit-link', 'navbar-delete-link'])
  } else {
    navbarTemplate.removeElementById('navbar-restore-link')
  }
}
